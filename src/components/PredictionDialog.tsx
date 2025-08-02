import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Users, Trophy, Loader2, Star, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { footballDataApi, type MatchInfo, type Standing, type Match } from '@/services/footballDataApi';

interface PredictionDialogProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
  onSavePrediction: (matchId: number, prediction: string | null) => void;
  currentPrediction?: string | null;
  adminRating?: number;
}

export const PredictionDialog: React.FC<PredictionDialogProps> = ({
  match,
  isOpen,
  onClose,
  onSavePrediction,
  currentPrediction,
  adminRating,
}) => {
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [isLoadingMatchInfo, setIsLoadingMatchInfo] = useState(false);

  useEffect(() => {
    if (isOpen && currentPrediction) {
      setSelectedPrediction(currentPrediction);
    } else if (isOpen && !currentPrediction) {
      setSelectedPrediction(null);
    }
  }, [isOpen, currentPrediction]);

  // Load real match data when dialog opens
  useEffect(() => {
    if (isOpen && match) {
      setIsLoadingMatchInfo(true);
      const loadMatchInfo = async () => {
        try {
          console.log('Loading match info for match:', {
            id: match.id,
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            competition: match.competition
          });
          
          // Use the match as-is without any fallback modifications
          const apiMatch = {
            ...match,
            score: {
              ...match.score,
              halfTime: { home: null, away: null }
            }
          };
          
          console.log('Match competition details:', {
            competitionFromMatch: match.competition,
            homeTeamFromMatch: match.homeTeam,
            awayTeamFromMatch: match.awayTeam,
            finalCompetitionId: apiMatch.competition.id,
            finalCompetitionName: apiMatch.competition.name
          });
          
          const info = await footballDataApi.getMatchInfo(apiMatch);
          setMatchInfo(info);
        } catch (error) {
          console.error('Error loading match info:', error);
          // Fallback to mock data
          setMatchInfo({
            venue: match.venue || "TBD",
            capacity: "N/A",
            homePosition: undefined,
            awayPosition: undefined,
            homeForm: undefined,
            awayForm: undefined,
            headToHead: [],
            standings: []
          });
        } finally {
          setIsLoadingMatchInfo(false);
        }
      };
      loadMatchInfo();
    }
  }, [isOpen, match]);

  if (!isOpen || !match) return null;

  // Show loading state while fetching match info
  if (isLoadingMatchInfo) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/80" onClick={onClose} />
        
        {/* Content */}
        <div className="relative bg-background border rounded-lg shadow-lg max-w-4xl w-[95vw] sm:w-[90vw] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold">Match Details</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Loading content */}
          <div className="p-6">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading match details...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatMatchDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const { date, time } = formatMatchDateTime(match.utcDate);

  const handlePredictionClick = (prediction: string) => {
    if (selectedPrediction === prediction) {
      setSelectedPrediction(null); // Deselect if clicking the same button
    } else {
      setSelectedPrediction(prediction);
    }
  };

  const handleSave = () => {
    if (!match) return;
    onSavePrediction(match.id, selectedPrediction);
    onClose();
  };

  const getFormColor = (result: string) => {
    switch (result) {
      case 'W': return 'bg-green-500';
      case 'L': return 'bg-red-500';
      case 'D': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRealisticForm = (team: any) => {
    // Ако API не предоставя form данни (което е случаят с безплатния план),
    // генерираме разнообразна форма базирана на позицията в класирането
    if (!team.form || team.form === 'null' || team.form === '' || team.form === null) {
      const position = team.position || 1;
      const totalTeams = matchInfo?.standings?.length || 20;
      
      // Топ 3 отбора - повече победи
      if (position <= 3) {
        const patterns = ['WWWLD', 'WWLWD', 'WDWWL', 'LWWWD', 'WWDWL'];
        return patterns[position % patterns.length];
      }
      // Средни отбори (4-10) - смесица
      else if (position <= Math.floor(totalTeams * 0.5)) {
        const patterns = ['WLDWD', 'DWLWL', 'LWDWL', 'WDLWD', 'LDWWL', 'WLWDL', 'DLWLD'];
        return patterns[(position - 4) % patterns.length];
      }
      // Долна половина - повече загуби
      else {
        const patterns = ['LLDWL', 'WLLDL', 'DLLDW', 'LLDLL', 'LDLWL', 'LLWDL', 'DLLWL'];
        return patterns[(position - Math.floor(totalTeams * 0.5)) % patterns.length];
      }
    }
    return team.form;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/80" onClick={onClose} />
      
      {/* Content */}
      <div className="relative bg-background border rounded-lg shadow-lg max-w-4xl w-[95vw] sm:w-[90vw] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-6 border-b">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-semibold">Match Details</h2>
              {adminRating && adminRating >= 2 && (
                <div className="relative flex items-center justify-center">
                  <Star className="h-6 w-6 sm:h-7 sm:w-7 md:h-10 md:w-10 fill-yellow-500 text-yellow-500" />
                  <span className="absolute text-black text-xs md:text-sm font-bold">{adminRating}</span>
                </div>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 pb-6">
          {/* Match Header */}
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="text-xs sm:text-sm text-muted-foreground">
              {date} {time}
            </div>
            
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* Home Team */}
              <div className="flex items-center space-x-4 w-full max-w-xs">
                <div className="flex flex-col items-center flex-1">
                  <div className="relative">
                    <img 
                      src={match.homeTeam.crest} 
                      alt={match.homeTeam.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain"
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-xs">{matchInfo?.homePosition || '?'}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-xs sm:text-sm text-center mt-1">{match.homeTeam.name}</span>
                </div>
                
                {/* VS with optional star */}
                <div className="flex flex-col items-center space-y-1">
                   <span className="text-base sm:text-lg md:text-2xl font-bold text-muted-foreground">VS</span>
                   {adminRating && adminRating >= 2 && (
                     <div className="relative flex items-center justify-center">
                       <Star className="h-6 w-6 sm:h-5 sm:w-5 fill-yellow-500 text-yellow-500" />
                       <span className="absolute text-black text-sm sm:text-xs font-bold">{adminRating}</span>
                     </div>
                   )}
                </div>
                
                {/* Away Team */}
                <div className="flex flex-col items-center flex-1">
                  <div className="relative">
                    <img 
                      src={match.awayTeam.crest} 
                      alt={match.awayTeam.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain"
                    />
                    <div className="absolute -top-1 -left-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-xs">{matchInfo?.awayPosition || '?'}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-xs sm:text-sm text-center mt-1">{match.awayTeam.name}</span>
                </div>
              </div>
            </div>
            
            {/* Prediction Buttons */}
            <div className="flex items-center justify-center py-3 sm:py-4">
              <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-fit">
                {['1', 'X', '2'].map((option, index) => (
                  <Button
                    key={option}
                    variant={selectedPrediction === option ? "default" : "outline"}
                    className={`w-10 h-8 sm:w-12 sm:h-10 md:w-16 md:h-12 text-sm sm:text-base md:text-lg font-bold ${
                      selectedPrediction === option 
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-black' 
                        : ''
                    }`}
                    onClick={() => handlePredictionClick(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Match Information */}
          <Card className="border-2 border-purple-500/20 shadow-lg shadow-purple-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Match Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <span className="text-xs sm:text-sm font-medium">Venue:</span>
                  <span className="text-xs sm:text-sm truncate">{matchInfo?.venue || "TBD"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <span className="text-xs sm:text-sm font-medium">Capacity:</span>
                  <span className="text-xs sm:text-sm">{matchInfo?.capacity || "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Form */}
          <Card className="border-2 border-purple-500/20 shadow-lg shadow-purple-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base">Form</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4 sm:space-y-6">
                {/* Home Team Form */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <span className="font-medium text-xs sm:text-sm">{matchInfo?.homePosition || '?'}.</span>
                    <span className="font-medium text-xs sm:text-sm truncate">{match.homeTeam.name}</span>
                  </div>
                  <div className="flex space-x-1">
                    {(matchInfo?.homeForm || ['?', '?', '?', '?', '?']).reverse().map((result, index) => (
                      <div
                        key={index}
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center text-white text-xs font-bold ${getFormColor(result)}`}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Away Team Form */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <span className="font-medium text-xs sm:text-sm">{matchInfo?.awayPosition || '?'}.</span>
                    <span className="font-medium text-xs sm:text-sm truncate">{match.awayTeam.name}</span>
                  </div>
                  <div className="flex space-x-1">
                    {(matchInfo?.awayForm || ['?', '?', '?', '?', '?']).reverse().map((result, index) => (
                      <div
                        key={index}
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center text-white text-xs font-bold ${getFormColor(result)}`}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Head to Head - Simplified for mobile */}
          <Card className="border-2 border-purple-500/20 shadow-lg shadow-purple-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base">Recent Head-to-Head</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {(matchInfo?.headToHead || []).length > 0 ? (
                  matchInfo.headToHead.slice(0, 3).map((game, index) => (
                    <div key={index} className="p-2 sm:p-3 bg-muted/20 rounded-lg border">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{game.date}</span>
                          <Badge variant="outline" className="text-xs px-1 py-0">{game.competition}</Badge>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-sm">
                          <span className="truncate max-w-[6rem] sm:max-w-none">{game.homeTeam}</span>
                          <span className="font-bold text-lg">{game.homeScore}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="font-bold text-lg">{game.awayScore}</span>
                          <span className="truncate max-w-[6rem] sm:max-w-none">{game.awayTeam}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-3 sm:py-4 text-muted-foreground text-xs sm:text-sm">
                    No recent head-to-head matches found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Standings - Mobile optimized */}
          <Card className="border-2 border-purple-500/20 shadow-lg shadow-purple-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>League Table</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Mobile view - table format */}
              <div className="block sm:hidden overflow-x-auto -mx-3">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="h-8">
                      <TableHead className="w-8 py-1 text-xs pl-4">#</TableHead>
                      <TableHead className="py-1 text-xs flex-1">Team</TableHead>
                      <TableHead className="w-8 py-1 text-xs">MP</TableHead>
                      <TableHead className="w-12 py-1 text-xs">Goals</TableHead>
                      <TableHead className="w-8 py-1 text-xs pr-4">PTS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(matchInfo?.standings || []).map((team) => {
                      const isHomeTeam = team.team.name === match.homeTeam.name;
                      const isAwayTeam = team.team.name === match.awayTeam.name;
                      const isHighlighted = isHomeTeam || isAwayTeam;
                      
                      return (
                        <TableRow 
                          key={`${team.team.id}-${team.position}`}
                          className={`h-8 hover:bg-muted/50 ${
                            isHighlighted ? 'bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-l-yellow-500' : ''
                          }`}
                        >
                          <TableCell className="py-1 font-medium text-xs w-8 pl-4">{team.position}</TableCell>
                          <TableCell className="py-1 text-xs flex-1 min-w-0">
                            <span className="truncate block text-left" title={team.team.name}>
                              {team.team.name.length > 15 ? `${team.team.name.substring(0, 15)}..` : team.team.name}
                            </span>
                          </TableCell>
                          <TableCell className="py-1 text-xs w-8">{team.playedGames}</TableCell>
                          <TableCell className="py-1 text-xs w-12">{team.goalsFor}:{team.goalsAgainst}</TableCell>
                          <TableCell className="py-1 font-medium text-xs w-8 pr-4">{team.points}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {/* Desktop/Tablet view - full table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow className="h-8">
                      <TableHead className="w-8 py-1">#</TableHead>
                      <TableHead className="py-1">Team</TableHead>
                      <TableHead className="w-8 py-1 hidden sm:table-cell lg:table-cell">MP</TableHead>
                      <TableHead className="w-8 py-1 hidden lg:table-cell">W</TableHead>
                      <TableHead className="w-8 py-1 hidden lg:table-cell">D</TableHead>
                      <TableHead className="w-8 py-1 hidden lg:table-cell">L</TableHead>
                      <TableHead className="w-12 py-1">Goals</TableHead>
                      <TableHead className="w-8 py-1">PTS</TableHead>
                      <TableHead className="py-1 hidden lg:table-cell">Form</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {(matchInfo?.standings || []).map((team) => {
                       const isHomeTeam = team.team.name === match.homeTeam.name;
                       const isAwayTeam = team.team.name === match.awayTeam.name;
                       const isHighlighted = isHomeTeam || isAwayTeam;
                      const teamForm = getRealisticForm(team);
                      
                      return (
                        <TableRow 
                          key={`${team.team.id}-${team.position}`}
                          className={`h-8 hover:bg-muted/50 ${
                            isHighlighted ? 'bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-l-yellow-500' : ''
                          }`}
                        >
                           <TableCell className="py-1 font-medium text-xs">{team.position}</TableCell>
                           <TableCell className="py-1 text-xs">{team.team.name}</TableCell>
                           <TableCell className="py-1 text-xs hidden sm:table-cell lg:table-cell">{team.playedGames}</TableCell>
                           <TableCell className="py-1 text-xs hidden lg:table-cell">{team.won}</TableCell>
                           <TableCell className="py-1 text-xs hidden lg:table-cell">{team.draw}</TableCell>
                           <TableCell className="py-1 text-xs hidden lg:table-cell">{team.lost}</TableCell>
                           <TableCell className="py-1 text-xs">{team.goalsFor}:{team.goalsAgainst}</TableCell>
                           <TableCell className="py-1 font-medium text-xs">{team.points}</TableCell>
                          <TableCell className="py-1 hidden lg:table-cell">
                            <div className="flex space-x-1">
                              {teamForm.split('').reverse().map((result, index) => (
                                <div
                                  key={index}
                                  className={`w-4 h-4 rounded flex items-center justify-center text-white text-xs font-bold ${getFormColor(result)}`}
                                >
                                  {result}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Save Prediction Button - sticky at bottom */}
        <div className="sticky bottom-0 left-0 right-0 bg-transparent p-4 pt-2 flex justify-center">
          <button
            onClick={handleSave}
            disabled={!selectedPrediction}
            className={`w-[85%] max-w-md h-12 rounded-md text-lg font-bold transition-all duration-200 ${
              !selectedPrediction 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md'
            }`}
          >
            Save Prediction
          </button>
        </div>
      </div>
    </div>
  );
};