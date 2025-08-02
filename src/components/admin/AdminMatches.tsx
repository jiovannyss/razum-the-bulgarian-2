import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, Star, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { footballDataApi, type Match as ApiMatch } from '@/services/footballDataApi';
import { format } from 'date-fns';
import { GameWeekNavigation } from '../GameWeekNavigation';

interface ApiMatchDisplay extends ApiMatch {
  admin_rating: number;
  db_id?: string;
}

interface CompetitionWithMatches {
  competition: string;
  matches: ApiMatchDisplay[];
  currentMatchday: number;
}

export function AdminMatches() {
  const [apiMatches, setApiMatches] = useState<ApiMatchDisplay[]>([]);
  const [loadingApi, setLoadingApi] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [collapsedCompetitions, setCollapsedCompetitions] = useState<Set<string>>(new Set());
  const [competitionGameWeeks, setCompetitionGameWeeks] = useState<Record<string, number>>({});
  const [smartGameWeeks, setSmartGameWeeks] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadApiMatches();
  }, []);

  const loadApiMatches = async () => {
    setLoadingApi(true);
    try {
      const apiMatchesData = await footballDataApi.getUpcomingMatches();
      
      // Map API matches to display format with default rating of 1
      const mappedMatches: ApiMatchDisplay[] = apiMatchesData.map(match => ({
        ...match,
        admin_rating: 1, // Default rating
      }));

      // Check which matches already exist in database
      const externalIds = mappedMatches.map(m => m.id);
      
      // Split into smaller chunks to avoid URL length limits
      const chunkSize = 100;
      const existingMatches = [];
      
      for (let i = 0; i < externalIds.length; i += chunkSize) {
        const chunk = externalIds.slice(i, i + chunkSize);
        const { data, error } = await supabase
          .from('cached_fixtures')
          .select('id, admin_rating')
          .in('id', chunk);
          
        if (error) {
          console.error('Error loading matches chunk:', error);
          continue;
        }
        
        if (data) {
          existingMatches.push(...data);
        }
      }

      if (existingMatches.length > 0) {
        // Update ratings from database
        mappedMatches.forEach(apiMatch => {
          const existing = existingMatches.find(db => db.id === apiMatch.id);
          if (existing) {
            apiMatch.admin_rating = existing.admin_rating || 1;
            apiMatch.db_id = existing.id.toString();
          }
        });
      }

      // Set all competitions as collapsed by default
      const competitions = new Set(mappedMatches.map(match => match.competition.name));
      setCollapsedCompetitions(competitions);

      setApiMatches(mappedMatches);
      
      toast({
        title: "Успех",
        description: `Заредени ${mappedMatches.length} мача от API`,
      });
    } catch (error) {
      console.error('Error loading API matches:', error);
      toast({
        title: "Грешка",
        description: "Неуспешно зареждане на мачовете от API",
        variant: "destructive",
      });
    } finally {
      setLoadingApi(false);
    }
  };

  const updateApiMatchRating = async (apiMatch: ApiMatchDisplay, newRating: number) => {
    try {
      console.log('Updating match rating:', { 
        match_id: apiMatch.id, 
        newRating, 
        hasDbId: !!apiMatch.db_id 
      });

      // Update the rating in cached_fixtures table
      const { error } = await supabase
        .from('cached_fixtures')
        .update({ admin_rating: newRating })
        .eq('id', apiMatch.id);
        
      if (error) throw error;

      // Update local state
      setApiMatches(prev => prev.map(match => 
        match.id === apiMatch.id 
          ? { ...match, admin_rating: newRating }
          : match
      ));

      // Clear cache to force refresh in home
      localStorage.removeItem('football-matches-cache');
      localStorage.removeItem('football-competitions-cache');

      toast({
        title: "Успех",
        description: "Рейтингът е обновен успешно",
      });
    } catch (error) {
      console.error('Error updating rating:', error);
      toast({
        title: "Грешка",
        description: "Неуспешно обновяване на рейтинга",
        variant: "destructive",
      });
    }
  };

  const filteredApiMatches = apiMatches.filter(match => {
    const matchesSearch = match.homeTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.awayTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.competition.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || match.status.toLowerCase() === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Group matches by competition and round
  const groupedMatches = filteredApiMatches.reduce((acc, match) => {
    const competition = match.competition.name;
    if (!acc[competition]) {
      acc[competition] = {
        competition,
        matches: [],
        currentMatchday: match.matchday || 1
      };
    }
    acc[competition].matches.push(match);
    return acc;
  }, {} as Record<string, CompetitionWithMatches>);

  // Calculate smart game weeks when matches are loaded
  useEffect(() => {
    const calculateSmartGameWeeks = async () => {
      const newSmartGameWeeks: Record<string, number> = {};
      
      for (const [competitionName, competitionData] of Object.entries(groupedMatches)) {
        if (competitionData.matches.length > 0) {
          try {
            const competitionId = competitionData.matches[0].competition.id;
            
            // Get the current matchday from cached competitions
            const { data: cachedCompetition } = await supabase
              .from('cached_competitions')
              .select('current_matchday')
              .eq('id', competitionId)
              .single();
            
            const officialCurrentMatchday = cachedCompetition?.current_matchday || competitionData.currentMatchday || 1;
            
            
            // Then get smart matchday based on official one
            const smartMatchday = await footballDataApi.getSmartCurrentMatchday(competitionId, officialCurrentMatchday);
            
            
            newSmartGameWeeks[competitionName] = smartMatchday;
          } catch (error) {
            console.error(`Error getting smart matchday for ${competitionName}:`, error);
            // Fallback to highest matchday number from available matches
            const matchdays = competitionData.matches.map(m => m.matchday).filter(Boolean);
            const maxMatchday = Math.max(...matchdays);
            newSmartGameWeeks[competitionName] = maxMatchday || 1;
          }
        }
      }
      
      setSmartGameWeeks(newSmartGameWeeks);
    };

    if (Object.keys(groupedMatches).length > 0) {
      calculateSmartGameWeeks();
    }
  }, [apiMatches]);

  // Handle game week navigation for each competition
  const handleGameWeekChange = (competition: string, newGameWeek: number) => {
    setCompetitionGameWeeks(prev => ({
      ...prev,
      [competition]: newGameWeek
    }));
  };

  // Get current game week for a competition
  const getCurrentGameWeek = (competition: string, defaultMatchday: number) => {
    // If user has manually selected a game week, use that
    if (competitionGameWeeks[competition]) {
      return competitionGameWeeks[competition];
    }
    
    // Use smart matchday if available
    if (smartGameWeeks[competition]) {
      return smartGameWeeks[competition];
    }
    
    return defaultMatchday;
  };

  // Filter matches by current game week for each competition
  const getMatchesForGameWeek = (competitionData: CompetitionWithMatches) => {
    const currentGameWeek = getCurrentGameWeek(competitionData.competition, competitionData.currentMatchday);
    
    return competitionData.matches.filter(match => match.matchday === currentGameWeek);
  };

  const toggleCompetition = (competition: string) => {
    const newCollapsed = new Set(collapsedCompetitions);
    if (newCollapsed.has(competition)) {
      newCollapsed.delete(competition);
    } else {
      newCollapsed.add(competition);
    }
    setCollapsedCompetitions(newCollapsed);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-600';
      case 'finished': return 'bg-blue-600';
      case 'postponed': return 'bg-yellow-600';
      case 'timed': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Планиран';
      case 'timed': return 'Планиран';
      case 'live': return 'На живо';
      case 'finished': return 'Завършен';
      case 'postponed': return 'Отложен';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Управление на мачове</h2>
          <p className="text-purple-200">
            API: {apiMatches.length} мача
          </p>
        </div>
        <Button 
          onClick={loadApiMatches}
          disabled={loadingApi}
          variant="outline"
          className="border-purple-600 text-purple-200 hover:bg-purple-900"
        >
          {loadingApi ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {loadingApi ? 'Зарежда...' : 'Обнови от API'}
        </Button>
      </div>

      {/* Филтри */}
      <Card className="bg-slate-800/50 border-purple-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                <Input
                  placeholder="Търсене по отбори или първенство..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-purple-600 text-white"
                />
              </div>
            </div>
            <div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48 bg-slate-700 border-purple-600 text-white">
                  <SelectValue placeholder="Филтър по статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всички статуси</SelectItem>
                  <SelectItem value="scheduled">Планиран</SelectItem>
                  <SelectItem value="timed">Планиран</SelectItem>
                  <SelectItem value="live">На живо</SelectItem>
                  <SelectItem value="finished">Завършен</SelectItem>
                  <SelectItem value="postponed">Отложен</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Мачове групирани по първенства */}
      <div className="space-y-4">
        {Object.entries(groupedMatches).map(([competitionName, competitionData]) => {
          const currentGameWeek = getCurrentGameWeek(competitionName, competitionData.currentMatchday);
          const currentMatches = getMatchesForGameWeek(competitionData);
          
          return (
            <Card key={competitionName} className="bg-slate-800/50 border-purple-700">
              <Collapsible open={!collapsedCompetitions.has(competitionName)} onOpenChange={() => toggleCompetition(competitionName)}>
                <div className="p-4 transition-colors flex items-center justify-between">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center gap-3 cursor-pointer transition-colors flex-1 -mx-4 px-4 py-2 rounded">
                      {collapsedCompetitions.has(competitionName) ? (
                        <ChevronRight className="h-5 w-5 text-purple-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-purple-400" />
                      )}
                      <h3 className="text-lg font-semibold text-white">{competitionName}</h3>
                    </div>
                  </CollapsibleTrigger>
                  <div className="flex items-center gap-3">
                    {!collapsedCompetitions.has(competitionName) && (() => {
                      // Calculate max gameweek from available matches for this competition
                      const competitionMatches = currentMatches;
                      const maxRoundFromMatches = competitionMatches.length > 0 
                        ? Math.max(...competitionMatches.map(m => m.matchday || 1))
                        : 0;
                      
                      // Use smart gameweek if available, otherwise calculated max or 38 fallback
                      const smartGW = smartGameWeeks[competitionName];
                      const maxGameWeek = smartGW && smartGW > maxRoundFromMatches
                        ? smartGW
                        : maxRoundFromMatches > 0 
                          ? maxRoundFromMatches 
                          : 38;
                      
                      return (
                        <GameWeekNavigation
                          currentGameWeek={currentGameWeek}
                          onGameWeekChange={(gw) => handleGameWeekChange(competitionName, gw)}
                          maxGameWeek={maxGameWeek}
                        />
                      );
                    })()}
                    <Badge variant="outline" className="border-purple-600 text-purple-200">
                      {currentMatches.length} мача
                    </Badge>
                  </div>
                </div>
                <CollapsibleContent>
                  <CardContent className="p-0">
                    <div className="grid gap-3 p-4">
                      {currentMatches.length === 0 ? (
                        <div className="text-center text-purple-200 py-8">
                          Няма мачове за кръг {currentGameWeek}
                        </div>
                      ) : (
                        currentMatches.map((match) => (
                          <div key={match.id} className="bg-slate-700/30 rounded-lg p-4 border border-purple-700/30">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="text-white font-medium text-lg">
                                  {match.homeTeam.name} vs {match.awayTeam.name}
                                </div>
                                <div className="text-purple-200 text-sm mt-1">
                                  {format(new Date(match.utcDate), 'dd.MM.yyyy HH:mm')}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <div className="text-white font-medium">
                                  {match.score.fullTime.home !== null && match.score.fullTime.away !== null 
                                    ? `${match.score.fullTime.home} - ${match.score.fullTime.away}` 
                                    : 'Предстои'}
                                </div>
                                
                                <Badge className={`${getStatusBadgeColor(match.status.toLowerCase())} text-white`}>
                                  {getStatusLabel(match.status.toLowerCase())}
                                </Badge>
                                
                                <div className="flex items-center gap-2">
                                  <span className="text-purple-200 text-sm">Рейтинг:</span>
                                 <Select 
                                   value={match.admin_rating.toString()} 
                                   onValueChange={(value) => updateApiMatchRating(match, parseInt(value))}
                                   disabled={match.status.toLowerCase() === 'live' || match.status.toLowerCase() === 'finished'}
                                 >
                                   <SelectTrigger className={`w-20 h-8 border-purple-600 text-white ${
                                     match.status.toLowerCase() === 'live' || match.status.toLowerCase() === 'finished' 
                                       ? 'bg-slate-600 cursor-not-allowed opacity-50' 
                                       : 'bg-slate-700'
                                   }`}>
                                     <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent>
                                     <SelectItem value="1">1</SelectItem>
                                     <SelectItem value="2">2</SelectItem>
                                     <SelectItem value="3">3</SelectItem>
                                     <SelectItem value="4">4</SelectItem>
                                     <SelectItem value="5">5</SelectItem>
                                   </SelectContent>
                                 </Select>
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
}