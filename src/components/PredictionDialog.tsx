import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Users, Trophy, Loader2, Star } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { footballDataApi, type MatchInfo, type Standing } from '@/services/footballDataApi';

interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

interface Match {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  utcDate: string;
  status: string;
  venue?: string;
  score: {
    fullTime: {
      home: number | null;
      away: number | null;
    };
  };
  competition?: {
    id: number;
    name: string;
  };
  season?: {
    id: number;
  };
  matchday?: number;
}

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

  // Debug: Log adminRating
  console.log('PredictionDialog adminRating:', adminRating, typeof adminRating);

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
            homeTeam: match.homeTeam.name,
            awayTeam: match.awayTeam.name,
            competition: match.competition
          });
          
          // Add missing properties if not present
          const apiMatch = {
            ...match,
            competition: match.competition || { id: 2013, name: "Campeonato Brasileiro Série A" },
            season: match.season || { id: 2371 },
            matchday: match.matchday || 18,
            score: {
              ...match.score,
              halfTime: { home: null, away: null }
            }
          };
          
          console.log('API match object:', apiMatch);
          const info = await footballDataApi.getMatchInfo(apiMatch);
          console.log('Loaded match info successfully:', info);
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

  if (!match) return null;

  // Show loading state while fetching match info
  if (isLoadingMatchInfo) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <DialogTitle className="text-lg font-semibold">Match Details</DialogTitle>
            </div>
          </DialogHeader>
          <div className="p-6 pt-0">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading match details...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-[90vw] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <DialogTitle className="text-lg font-semibold">Match Details</DialogTitle>
              {adminRating && adminRating >= 2 && (
                <div className="relative flex items-center justify-center">
                  <Star className="h-7 w-7 md:h-10 md:w-10 fill-yellow-500 text-yellow-500" />
                  <span className="absolute text-black text-xs md:text-sm font-bold">{adminRating}</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 p-6 pt-0">
          {/* Match Header */}
          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              {date} {time}
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                  <img 
                    src={match.homeTeam.crest} 
                    alt={match.homeTeam.name}
                    className="w-12 h-12 md:w-16 md:h-16 object-contain"
                  />
                  <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-xs md:text-sm">{matchInfo?.homePosition || '?'}</span>
                  </div>
                </div>
                <span className="font-semibold text-xs md:text-sm text-center">{match.homeTeam.name}</span>
              </div>
              
              <div className="flex flex-col items-center space-y-1">
                <span className="text-lg md:text-2xl font-bold text-muted-foreground">VS</span>
                {adminRating && adminRating >= 2 && (
                    <div className="relative flex items-center justify-center">
                      <Star className="h-7 w-7 md:h-10 md:w-10 fill-yellow-500 text-yellow-500" />
                      <span className="absolute text-black text-xs md:text-sm font-bold">{adminRating}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                  <img 
                    src={match.awayTeam.crest} 
                    alt={match.awayTeam.name}
                    className="w-12 h-12 md:w-16 md:h-16 object-contain"
                  />
                  <div className="absolute -top-1 -left-1 w-5 h-5 md:w-6 md:h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-xs md:text-sm">{matchInfo?.awayPosition || '?'}</span>
                  </div>
                </div>
                <span className="font-semibold text-xs md:text-sm text-center">{match.awayTeam.name}</span>
              </div>
            </div>
            
            {/* Prediction Buttons */}
            <div className="flex items-center justify-center py-4">
              <div className="grid grid-cols-3 gap-4 md:gap-6 w-fit">
                {['1', 'X', '2'].map((option, index) => (
                  <Button
                    key={option}
                    variant={selectedPrediction === option ? "default" : "outline"}
                    className={`w-12 h-10 md:w-16 md:h-12 text-base md:text-lg font-bold ${
                      selectedPrediction === option 
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-black' 
                        : ''
                    } ${index === 1 ? 'justify-self-center' : ''}`}
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
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Match Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Venue:</span>
                  <span className="text-sm">{matchInfo?.venue || "TBD"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Capacity:</span>
                  <span className="text-sm">{matchInfo?.capacity || "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Form */}
          <Card className="border-2 border-purple-500/20 shadow-lg shadow-purple-500/10">
            <CardHeader>
              <CardTitle>Form</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{matchInfo?.homePosition || '?'}.</span>
                    <span className="font-medium">{match.homeTeam.name}</span>
                  </div>
                  <div className="flex space-x-1">
                    {(matchInfo?.homeForm || ['?', '?', '?', '?', '?']).map((result, index) => (
                      <div
                        key={index}
                        className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold ${getFormColor(result)}`}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{matchInfo?.awayPosition || '?'}.</span>
                    <span className="font-medium">{match.awayTeam.name}</span>
                  </div>
                  <div className="flex space-x-1">
                    {(matchInfo?.awayForm || ['?', '?', '?', '?', '?']).map((result, index) => (
                      <div
                        key={index}
                        className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold ${getFormColor(result)}`}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Head to Head */}
          <Card className="border-2 border-purple-500/20 shadow-lg shadow-purple-500/10">
            <CardHeader>
              <CardTitle>Head-to-Head Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(matchInfo?.headToHead || []).length > 0 ? (
                  matchInfo.headToHead.map((game, index) => (
                    <div key={index} className="flex flex-col md:flex-row md:items-center md:justify-between py-2 border-b border-border space-y-1 md:space-y-0">
                      <div className="flex flex-col md:flex-row md:items-center md:space-x-3 space-y-1 md:space-y-0">
                        <span className="text-sm text-muted-foreground">{game.date}</span>
                        <Badge variant="outline" className="text-xs w-fit">{game.competition}</Badge>
                        <div className="flex items-center space-x-2 text-sm">
                          <span>{game.homeTeam}</span>
                          <span className="font-medium">{game.homeScore}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="font-medium">{game.awayScore}</span>
                          <span>{game.awayTeam}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No recent head-to-head matches found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Standings */}
          <Card className="border-2 border-purple-500/20 shadow-lg shadow-purple-500/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>Standings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="h-8">
                    <TableHead className="w-8 py-1 hidden md:table-cell">#</TableHead>
                    <TableHead className="py-1">Team</TableHead>
                    <TableHead className="w-8 py-1">MP</TableHead>
                    <TableHead className="w-8 py-1 hidden md:table-cell">W</TableHead>
                    <TableHead className="w-8 py-1 hidden md:table-cell">D</TableHead>
                    <TableHead className="w-8 py-1 hidden md:table-cell">L</TableHead>
                    <TableHead className="w-12 py-1">Goals</TableHead>
                    <TableHead className="w-8 py-1">PTS</TableHead>
                    <TableHead className="py-1 hidden md:table-cell">Form</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(matchInfo?.standings || []).map((team) => {
                    const isHomeTeam = team.team.name === match.homeTeam.name;
                    const isAwayTeam = team.team.name === match.awayTeam.name;
                    const isHighlighted = isHomeTeam || isAwayTeam;
                    
                    return (
                      <TableRow 
                        key={team.position}
                        className={`${
                          isHighlighted
                            ? 'h-8 bg-yellow-100/80 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-500 rounded-lg overflow-hidden'
                            : 'h-10 hover:bg-muted/50'
                        }`}
                      >
                        <TableCell className={`font-medium py-1 text-xs ${isHighlighted ? 'hidden md:table-cell' : ''}`}>{team.position}</TableCell>
                        <TableCell className="py-1 text-xs">{team.team.name}</TableCell>
                        <TableCell className="py-1 text-xs">{team.playedGames}</TableCell>
                        <TableCell className={`py-1 text-xs ${isHighlighted ? 'hidden md:table-cell' : ''}`}>{team.won}</TableCell>
                        <TableCell className={`py-1 text-xs ${isHighlighted ? 'hidden md:table-cell' : ''}`}>{team.draw}</TableCell>
                        <TableCell className={`py-1 text-xs ${isHighlighted ? 'hidden md:table-cell' : ''}`}>{team.lost}</TableCell>
                        <TableCell className="py-1 text-xs">{team.goalsFor}:{team.goalsAgainst}</TableCell>
                        <TableCell className="font-medium py-1 text-xs">{team.points}</TableCell>
                        <TableCell className={`py-1 ${isHighlighted ? 'hidden md:table-cell' : ''}`}>
                          <div className="flex space-x-1">
                            {(team.form || 'WWWWW').split('').slice(-5).map((result, index) => (
                              <div
                                key={index}
                                className={`w-4 h-4 rounded-sm flex items-center justify-center text-white text-xs font-bold ${getFormColor(result)}`}
                              >
                                {result}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!matchInfo?.standings || matchInfo.standings.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                        Няма налична информация за класирането в тази лига
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Fixed Save Button */}
        <Button 
          onClick={handleSave} 
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg z-50"
        >
          Save Prediction
        </Button>
      </DialogContent>
    </Dialog>
  );
};