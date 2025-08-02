import { useState, useEffect } from "react";
import { 
  RefreshCw,
  AlertCircle,
  Trophy,
  Target,
  BarChart3,
  Users,
  Clock,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { footballDataApi, type Match, type Competition } from "@/services/footballDataApi";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import League from "./League";

interface ProcessedMatch {
  id: string;
  tournament: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId?: number; // Add real team IDs
  awayTeamId?: number; // Add real team IDs
  homeScore: number | null;
  awayScore: number | null;
  time: string;
  status: 'live' | 'upcoming' | 'finished';
  homeLogo?: string;
  awayLogo?: string;
  predictions?: number;
  popularPrediction?: string;
  rank?: number;
  adminRating?: number;
  myPrediction?: string | null;
  myPredictionCorrect?: boolean | null;
  round: string;
  competition?: {
    id: number;
    name: string;
    emblem?: string;
    area?: {
      name: string;
    };
  };
}

const LiveScore = () => {
  const { user, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState("matches");
  const [matches, setMatches] = useState<ProcessedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [competitionsWithCurrentMatchday, setCompetitionsWithCurrentMatchday] = useState<Array<Competition & { currentMatchday: number }>>([]);
  const [userCompetitions, setUserCompetitions] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  // Transform Football-Data.org API match to our format
  const transformMatch = (apiMatch: Match): ProcessedMatch => {
    let status: 'live' | 'upcoming' | 'finished' = 'upcoming';
    let time = apiMatch.utcDate; // Keep the full ISO date string

    if (apiMatch.status === 'FINISHED') {
      status = 'finished';
      time = 'FT';
    } else if (apiMatch.status === 'IN_PLAY' || apiMatch.status === 'PAUSED') {
      status = 'live';
      time = 'Live';
    } else if (apiMatch.status === 'SCHEDULED' || apiMatch.status === 'TIMED') {
      status = 'upcoming';
      // Keep the full ISO date string for upcoming matches
    }

    return {
      id: apiMatch.id.toString(),
      tournament: apiMatch.competition.name,
      homeTeam: apiMatch.homeTeam.name,
      awayTeam: apiMatch.awayTeam.name,
      homeTeamId: apiMatch.homeTeam.id, // Include real team IDs
      awayTeamId: apiMatch.awayTeam.id, // Include real team IDs
      homeScore: apiMatch.score.fullTime.home,
      awayScore: apiMatch.score.fullTime.away,
      time,
      status,
      homeLogo: apiMatch.homeTeam.crest,
      awayLogo: apiMatch.awayTeam.crest,
      predictions: Math.floor(Math.random() * 500) + 50,
      popularPrediction: ['1', 'X', '2'][Math.floor(Math.random() * 3)],
      rank: apiMatch.adminRating || 1, // Use admin_rating from footballDataApi
      adminRating: apiMatch.adminRating || 1, // Add adminRating field for consistency
      myPrediction: null,
      myPredictionCorrect: null,
      round: apiMatch.matchday.toString(),
      competition: {
        id: apiMatch.competition.id,
        name: apiMatch.competition.name,
        emblem: apiMatch.competition.emblem || '', // Използваме данните от API-то
        area: {
          name: apiMatch.competition.area?.name || 'Unknown' // Използваме данните от API-то
        }
      }
    };
  };

  // Function to load matches for a specific league and matchday
  const loadMatchdayForLeague = async (leagueName: string, matchday: number) => {
    try {
      console.log(`📥 Loading matchday ${matchday} for ${leagueName}...`);
      
      // Find the competition by name
      const competition = competitionsWithCurrentMatchday.find(comp => comp.name === leagueName);
      if (!competition) {
        console.log(`❌ Competition not found: ${leagueName}`);
        return;
      }
      
      // Check if we already have matches for this matchday to avoid duplicates
      const existingMatchesForRound = matches.filter(m => 
        m.tournament === leagueName && m.round === matchday.toString()
      );
      
      if (existingMatchesForRound.length > 0) {
        console.log(`✅ Already have ${existingMatchesForRound.length} matches for ${leagueName} GW${matchday}`);
        return;
      }
      
      // Get matches for the specific matchday with error handling for rate limits
      const newMatches = await footballDataApi.getMatches(competition.id, matchday);
      if (newMatches && newMatches.length > 0) {
        const transformedMatches = newMatches.map(apiMatch => 
          transformMatch(apiMatch)
        );
        
        // Add new matches to existing matches
        setMatches(prevMatches => {
          const existingIds = new Set(prevMatches.map(m => m.id));
          const uniqueNewMatches = transformedMatches.filter(m => !existingIds.has(m.id));
          return [...prevMatches, ...uniqueNewMatches];
        });
        
        console.log(`✅ Loaded ${newMatches.length} matches for ${leagueName} GW${matchday}`);
        
        toast({
          title: "Matches loaded",
          description: `Loaded ${newMatches.length} matches for ${leagueName} GW${matchday}`,
        });
      } else {
        console.log(`⚠️ No matches found for ${leagueName} GW${matchday}`);
        toast({
          title: "No matches",
          description: `No matches found for Round ${matchday}`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.log(`❌ Error loading matchday ${matchday} for ${leagueName}:`, error);
      
      // Handle rate limiting specifically
      if (error.message.includes('429')) {
        toast({
          title: "Rate limit reached",
          description: "Too many requests. Please wait before navigating to another round.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Loading error",
          description: `Failed to load matches for Round ${matchday}`,
          variant: "destructive",
        });
      }
    }
  };

  // Load user's selected competitions
  const loadUserCompetitions = async () => {
    if (!user) {
      console.log('❌ No user found, cannot load competitions');
      return;
    }
    
    try {
      console.log(`🔍 Loading competitions for user: ${user.id}, role: ${userRole}`);
      
      // For super admin, get all available competitions
      if (userRole === 'super_admin') {
        console.log('👑 Super admin detected, loading all competitions');
        const competitions = await footballDataApi.getCompetitions();
        setUserCompetitions(new Set(competitions.map(c => c.id)));
        console.log(`✅ Super admin set to ${competitions.length} competitions:`, competitions.map(c => c.id));
      } else {
        // For regular users, get their selected competitions
        console.log('👤 Regular user, loading selected competitions from database');
        const { data, error } = await supabase
          .from('user_competitions')
          .select('competition_id')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (error) {
          console.error('❌ Error loading user competitions:', error);
          return;
        }

        console.log('📊 Raw competition data from DB:', data);
        if (data) {
          const competitionIds = data.map((item: any) => item.competition_id);
          setUserCompetitions(new Set(competitionIds));
          console.log(`✅ User competitions set to:`, competitionIds);
        } else {
          console.log('⚠️ No competition data found for user');
          setUserCompetitions(new Set());
        }
      }
    } catch (error) {
      console.error('❌ Error loading user competitions:', error);
    }
  };

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading cached matches from database...');

      // Get all cached matches from database
      const allMatches = await footballDataApi.getUpcomingMatches();
      
      // Get competitions for storing state
      const competitions = await footballDataApi.getCompetitions();
      const competitionsWithCurrentMatchday = competitions.map(comp => ({
        ...comp, 
        currentMatchday: comp.currentSeason.currentMatchday
      }));
      console.log(`📊 Found ${allMatches.length} total cached matches`);
      
      // Filter matches based on user's selected competitions
      let filteredMatches = allMatches;
      console.log(`🔍 User competitions size: ${userCompetitions.size}`);
      console.log(`🔍 User competitions:`, Array.from(userCompetitions));
      
      if (userCompetitions.size > 0) {
        console.log(`🔍 Filtering ${allMatches.length} total matches...`);
        filteredMatches = allMatches.filter(match => {
          const hasMatch = userCompetitions.has(match.competition.id);
          if (hasMatch) {
            console.log(`✅ Match included: ${match.homeTeam.name} vs ${match.awayTeam.name} (${match.competition.name})`);
          }
          return hasMatch;
        });
        console.log(`🎯 Filtered to ${filteredMatches.length} matches based on user competitions:`, Array.from(userCompetitions));
      } else {
        console.log('⚠️ No user competitions set, showing all matches');
      }
      
      // Log competition names in filtered matches
      const competitionNames = [...new Set(filteredMatches.map(m => m.competition.name))];
      console.log(`🏆 Competitions in filtered matches:`, competitionNames);
      
      // Log rounds from the matches
      const roundsInMatches = [...new Set(filteredMatches.map(m => m.matchday))];
      console.log(`📋 Rounds in filtered matches: [${roundsInMatches.sort((a, b) => a - b).join(', ')}]`);

      if (filteredMatches.length === 0) {
        console.log('⚠️ No matches found for user competitions');
      }

      const transformedMatches = filteredMatches.map(apiMatch => 
        transformMatch(apiMatch)
      );
      console.log(`🏁 Transformed ${transformedMatches.length} matches`);
      setMatches(transformedMatches);
      setCompetitionsWithCurrentMatchday(competitionsWithCurrentMatchday);
        
    } catch (err) {
      console.error('❌ Error loading Football-Data.org matches:', err);
      
      let errorMessage = 'Неизвестна грешка';
      let description = 'Неуспешно зареждане на мачовете';
      
      if (err instanceof Error) {
        if (err.message === 'RATE_LIMIT_EXCEEDED') {
          errorMessage = 'API лимит';
          description = 'Превишен лимит на заявки. Моля, опитайте отново след малко.';
        } else if (err.message.includes('429')) {
          errorMessage = 'Твърде много заявки';
          description = 'API сървърът е затрупан. Моля, изчакайте 1-2 минути и опитайте отново.';
        } else {
          errorMessage = err.message;
          description = `Неуспешно зареждане на мачовете: ${errorMessage}`;
        }
      }
      
      setError(errorMessage);
      toast({
        title: "Грешка при зареждане",
        description: description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load user competitions and matches when component mounts or user changes
  useEffect(() => {
    if (user && userRole !== null) {
      loadUserCompetitions();
    }
  }, [user, userRole]);

  // Load matches when user competitions change
  useEffect(() => {
    if (userCompetitions.size > 0) {
      loadMatches();
    }
  }, [userCompetitions]);

  // Load matches on component mount for super admin or when no user competitions
  useEffect(() => {
    if (userRole === 'super_admin' || (user && userCompetitions.size === 0)) {
      loadMatches();
    }
    
    // Set up realtime listener for matches table updates
    const matchesChannel = supabase
      .channel('matches-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches'
        },
        (payload) => {
          console.log('Match updated via realtime:', payload);
          // Reload matches when any match is updated
          loadMatches();
        }
      )
      .subscribe();

    // Set up realtime listener for user competitions changes
    const competitionsChannel = supabase
      .channel('user-competitions-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_competitions',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          console.log('User competitions updated via realtime:', payload);
          // Reload user competitions and then matches
          loadUserCompetitions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchesChannel);
      supabase.removeChannel(competitionsChannel);
    };
  }, [userRole, user, userCompetitions.size]);

  // Helper function to check if a match is today
  const isMatchToday = (match: ProcessedMatch) => {
    // Live matches are always "today"
    if (match.status === 'live') {
      return true;
    }
    
    // For other matches, check the date
    const today = new Date();
    const matchDate = new Date(match.time);
    return matchDate.toDateString() === today.toDateString();
  };

  // Filter matches based on active tab
  const getFilteredMatches = (tabFilter: string) => {
    switch (tabFilter) {
      case "today":
        return matches.filter(match => isMatchToday(match));
      case "live":
        return matches.filter(match => match.status === "live");
      case "matches":
      default:
        return matches;
    }
  };

  const filteredMatches = getFilteredMatches(activeTab);

  // Group filtered matches by tournament/league
  const matchesByLeague = filteredMatches.reduce((acc, match) => {
    const league = match.tournament;
    if (!acc[league]) {
      acc[league] = [];
    }
    acc[league].push(match);
    return acc;
  }, {} as Record<string, ProcessedMatch[]>);

  // Calculate real statistics
  const liveMatchesCount = matches.filter(m => m.status === 'live').length;
  const todayMatchesCount = matches.filter(m => isMatchToday(m)).length;
  const activeLeaguesCount = Object.keys(matchesByLeague).length;

  // Calculate prediction statistics (lifetime) - включва завършени + лайв мачове
  const relevantMatches = matches.filter(m => m.status === 'finished' || m.status === 'live');
  const matchesWithPredictions = relevantMatches.filter(m => m.myPrediction !== null);
  const correctPredictions = matchesWithPredictions.filter(m => m.myPredictionCorrect === true).length;
  const wrongPredictions = matchesWithPredictions.filter(m => m.myPredictionCorrect === false).length;
  const unpredictedMatches = relevantMatches.filter(m => m.myPrediction === null).length;
  const totalPredictions = correctPredictions + wrongPredictions;
  const accuracy = totalPredictions > 0 ? Math.round((correctPredictions / totalPredictions) * 100) : 0;

  return (
    <main className="min-h-screen bg-gradient-subtle p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="space-y-2 w-full lg:w-auto">
            <div className="flex items-center gap-2 lg:gap-4 pt-2 flex-nowrap overflow-x-auto">
              <div className="flex items-center gap-2 text-xs lg:text-sm whitespace-nowrap">
                <div className="w-2 h-2 bg-live rounded-full animate-pulse"></div>
                <span className="text-muted-foreground font-medium">{liveMatchesCount} Live Matches</span>
              </div>
              <div className="flex items-center gap-2 text-xs lg:text-sm whitespace-nowrap">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">{todayMatchesCount} Matches Today</span>
              </div>
              <div className="flex items-center gap-2 text-xs lg:text-sm whitespace-nowrap">
                <Trophy className="w-3 h-3 lg:w-4 lg:h-4 text-accent" />
                <span className="text-muted-foreground">Active Leagues: {activeLeaguesCount}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-2 lg:mt-0">
            <Button 
              variant="outline" 
              className="gap-2 card-hover text-xs lg:text-sm px-3 lg:px-4 h-8 lg:h-10"
              onClick={loadMatches}
              disabled={loading}
            >
              <RefreshCw className={`w-3 h-3 lg:w-4 lg:h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Loading...' : 'Refresh'}</span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="matches">Matches</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="live">Live</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Loading Football-Data.org matches...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-12">
            <Card className="p-6 max-w-md mx-auto border-purple-700 purple-glow">
              <div className="flex items-center gap-3 text-destructive mb-4">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Error loading matches</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button 
                onClick={loadMatches} 
                size="sm" 
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </Card>
          </div>
        )}

        {!loading && !error && Object.keys(matchesByLeague).length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Card className="p-6 max-w-md mx-auto text-center border-purple-700 purple-glow">
              <div className="flex items-center justify-center gap-3 text-muted-foreground mb-4">
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">No matches found</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                No upcoming matches available. Try refreshing.
              </p>
              <Button 
                onClick={loadMatches} 
                size="sm" 
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </Card>
          </div>
        )}

        {/* Leagues */}
        <div className="space-y-6 mb-8">
        {!loading && !error && Object.entries(matchesByLeague).map(([leagueName, leagueMatches]) => {
            // Find current matchday and competition details for this league
            const competitionInfo = competitionsWithCurrentMatchday.find(comp => comp.name === leagueName);
            const currentMatchday = competitionInfo?.currentMatchday || 1;
            
            // Get competition details from the first match (they all have the same competition)
            const firstMatch = leagueMatches[0];
            const leagueEmblem = firstMatch?.competition?.emblem;
            const areaName = firstMatch?.competition?.area?.name;
            
            console.log(`🎯 League: ${leagueName}, Found competition:`, competitionInfo, `Current matchday: ${currentMatchday}`);
            
            return (
              <League
                key={leagueName}
                leagueName={leagueName}
                areaName={areaName}
                leagueLogo={leagueEmblem}
                matches={leagueMatches}
                currentMatchday={currentMatchday}
                onLoadMatchday={loadMatchdayForLeague}
              />
            );
          })}
        </div>

        {/* Bottom Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Quick Stats */}
          <Card className="card-hover bg-card/50 backdrop-blur-sm border-purple-700 purple-glow">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-gradient-card rounded-xl border border-purple-700/30">
                  <div className="font-bold text-lg sm:text-2xl text-gradient">{accuracy}%</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gradient-card rounded-xl border border-purple-700/30">
                  <div className="font-bold text-lg sm:text-2xl text-gradient">{correctPredictions}</div>
                  <div className="text-xs text-muted-foreground">Correct</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gradient-card rounded-xl border border-purple-700/30">
                  <div className="font-bold text-lg sm:text-2xl text-gradient">{wrongPredictions}</div>
                  <div className="text-xs text-muted-foreground">Wrong</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gradient-card rounded-xl border border-purple-700/30">
                  <div className="font-bold text-lg sm:text-2xl text-gradient">{unpredictedMatches}</div>
                  <div className="text-xs text-muted-foreground">Unpredicted</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="card-hover bg-card/50 backdrop-blur-sm border-purple-700 purple-glow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2 card-hover">
                <Users className="w-4 h-4" />
                Join Room
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 card-hover">
                <Trophy className="w-4 h-4" />
                Rankings
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 card-hover">
                <Clock className="w-4 h-4" />
                Match History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default LiveScore;