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
import { ArrowLeft, MapPin, Users, Trophy } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
}

interface PredictionDialogProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
  onSavePrediction: (matchId: number, prediction: string | null) => void;
  currentPrediction?: string | null;
}

export const PredictionDialog: React.FC<PredictionDialogProps> = ({
  match,
  isOpen,
  onClose,
  onSavePrediction,
  currentPrediction,
}) => {
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentPrediction) {
      setSelectedPrediction(currentPrediction);
    } else if (isOpen && !currentPrediction) {
      setSelectedPrediction(null);
    }
  }, [isOpen, currentPrediction]);

  if (!match) return null;

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

  // Mock data for demonstration - in real app this would come from API
  const mockStadiumData = {
    venue: match.venue || "Stadium TBD",
    capacity: "26,418"
  };

  const mockForm = {
    homePosition: 4,
    awayPosition: 20,
    homeLastFive: ['W', 'W', 'L', 'D', 'W'], // W=Win, L=Loss, D=Draw
    awayLastFive: ['L', 'L', 'W', 'D', 'L']
  };

  const mockHeadToHead = [
    { date: '04.02.24', competition: 'COP', homeTeam: 'Bahia', awayTeam: 'Sport Recife', homeScore: 2, awayScore: 1 },
    { date: '23.02.23', competition: 'COP', homeTeam: 'Sport Recife', awayTeam: 'Bahia', homeScore: 0, awayScore: 0 },
    { date: '13.09.22', competition: 'SB', homeTeam: 'Sport Recife', awayTeam: 'Bahia', homeScore: 1, awayScore: 0 },
    { date: '09.06.22', competition: 'SB', homeTeam: 'Bahia', awayTeam: 'Sport Recife', homeScore: 2, awayScore: 0 },
    { date: '05.03.22', competition: 'COP', homeTeam: 'Sport Recife', awayTeam: 'Bahia', homeScore: 2, awayScore: 3 }
  ];

  const mockStandings = [
    { position: 1, team: 'Flamengo RJ', played: 16, wins: 11, draws: 3, losses: 2, goals: '30:5', points: 36, form: ['W', 'W', 'W', 'L', 'W'] },
    { position: 2, team: 'Cruzeiro', played: 17, wins: 10, draws: 4, losses: 3, goals: '26:11', points: 34, form: ['L', 'L', 'W', 'W', 'W'] },
    { position: 3, team: 'Palmeiras', played: 15, wins: 10, draws: 2, losses: 3, goals: '19:12', points: 32, form: ['W', 'W', 'W', 'L', 'L'] },
    { position: 4, team: match.homeTeam.name, played: 16, wins: 8, draws: 4, losses: 4, goals: '20:11', points: 28, form: ['W', 'W', 'L', 'D', 'W'] },
    { position: 5, team: 'São Paulo', played: 16, wins: 7, draws: 6, losses: 3, goals: '18:12', points: 27, form: ['D', 'W', 'L', 'W', 'D'] },
    { position: 6, team: 'Grêmio', played: 15, wins: 8, draws: 2, losses: 5, goals: '17:14', points: 26, form: ['W', 'L', 'W', 'W', 'L'] },
    { position: 7, team: 'Internacional', played: 16, wins: 7, draws: 4, losses: 5, goals: '16:13', points: 25, form: ['L', 'W', 'D', 'W', 'W'] },
    { position: 8, team: 'Athletico-PR', played: 15, wins: 7, draws: 3, losses: 5, goals: '15:14', points: 24, form: ['W', 'D', 'L', 'W', 'L'] },
    { position: 9, team: 'Corinthians', played: 16, wins: 6, draws: 6, losses: 4, goals: '14:13', points: 24, form: ['D', 'L', 'W', 'D', 'W'] },
    { position: 10, team: 'Fluminense', played: 15, wins: 7, draws: 2, losses: 6, goals: '13:15', points: 23, form: ['L', 'W', 'W', 'L', 'D'] },
    { position: 11, team: 'Vasco da Gama', played: 16, wins: 6, draws: 4, losses: 6, goals: '12:16', points: 22, form: ['W', 'L', 'D', 'L', 'W'] },
    { position: 12, team: 'Santos', played: 15, wins: 6, draws: 3, losses: 6, goals: '11:14', points: 21, form: ['L', 'D', 'W', 'L', 'W'] },
    { position: 13, team: 'Ceará', played: 16, wins: 5, draws: 5, losses: 6, goals: '10:15', points: 20, form: ['D', 'L', 'L', 'W', 'D'] },
    { position: 14, team: 'Fortaleza', played: 15, wins: 5, draws: 4, losses: 6, goals: '9:13', points: 19, form: ['W', 'L', 'D', 'L', 'W'] },
    { position: 15, team: 'Chapecoense', played: 16, wins: 4, draws: 6, losses: 6, goals: '8:14', points: 18, form: ['D', 'L', 'D', 'W', 'L'] },
    { position: 16, team: 'Goiás', played: 15, wins: 4, draws: 5, losses: 6, goals: '7:12', points: 17, form: ['L', 'D', 'W', 'L', 'D'] },
    { position: 17, team: 'Coritiba', played: 16, wins: 3, draws: 7, losses: 6, goals: '6:16', points: 16, form: ['D', 'L', 'L', 'D', 'L'] },
    { position: 18, team: 'Cuiabá', played: 15, wins: 3, draws: 6, losses: 6, goals: '5:14', points: 15, form: ['L', 'D', 'L', 'W', 'D'] },
    { position: 19, team: 'Juventude', played: 16, wins: 2, draws: 8, losses: 6, goals: '4:18', points: 14, form: ['D', 'L', 'D', 'L', 'L'] },
    { position: 20, team: match.awayTeam.name, played: 15, wins: 0, draws: 5, losses: 10, goals: '9:25', points: 5, form: ['L', 'L', 'W', 'D', 'L'] }
  ];

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
        
        <div className="space-y-6 p-6 pt-0">
          {/* Match Header */}
          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              {date} {time}
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex flex-col items-center space-y-2">
                <img 
                  src={match.homeTeam.crest} 
                  alt={match.homeTeam.name}
                  className="w-12 h-12 md:w-16 md:h-16 object-contain"
                />
                <span className="font-semibold text-xs md:text-sm text-center">{match.homeTeam.name}</span>
              </div>
              
              <div className="flex items-center space-x-2 md:space-x-4">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs md:text-base">{mockForm.homePosition}</span>
                </div>
                <span className="text-lg md:text-2xl font-bold text-muted-foreground">VS</span>
                <div className="w-8 h-8 md:w-12 md:h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs md:text-base">{mockForm.awayPosition}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-2">
                <img 
                  src={match.awayTeam.crest} 
                  alt={match.awayTeam.name}
                  className="w-12 h-12 md:w-16 md:h-16 object-contain"
                />
                <span className="font-semibold text-xs md:text-sm text-center">{match.awayTeam.name}</span>
              </div>
            </div>
            
            {/* Prediction Buttons */}
            <div className="flex justify-center space-x-3 md:space-x-4 py-4">
              {['1', 'X', '2'].map((option) => (
                <Button
                  key={option}
                  variant={selectedPrediction === option ? "default" : "outline"}
                  className={`w-12 h-10 md:w-16 md:h-12 text-base md:text-lg font-bold ${
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
                  <span className="text-sm">{mockStadiumData.venue}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Capacity:</span>
                  <span className="text-sm">{mockStadiumData.capacity}</span>
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
                    <span className="font-medium">{mockForm.homePosition}.</span>
                    <span className="font-medium">{match.homeTeam.name}</span>
                  </div>
                  <div className="flex space-x-1">
                    {mockForm.homeLastFive.map((result, index) => (
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
                    <span className="font-medium">{mockForm.awayPosition}.</span>
                    <span className="font-medium">{match.awayTeam.name}</span>
                  </div>
                  <div className="flex space-x-1">
                    {mockForm.awayLastFive.map((result, index) => (
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
                {mockHeadToHead.map((game, index) => (
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
                ))}
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
                    <TableHead className="w-8 py-1">#</TableHead>
                    <TableHead className="py-1">Team</TableHead>
                    <TableHead className="w-8 py-1">MP</TableHead>
                    <TableHead className="w-8 py-1">W</TableHead>
                    <TableHead className="w-8 py-1">D</TableHead>
                    <TableHead className="w-8 py-1">L</TableHead>
                    <TableHead className="w-12 py-1">Goals</TableHead>
                    <TableHead className="w-8 py-1">PTS</TableHead>
                    <TableHead className="py-1">Form</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStandings.map((team) => (
                    <TableRow 
                      key={team.position}
                      className={`h-6 ${
                        team.team === match.homeTeam.name || team.team === match.awayTeam.name
                          ? 'bg-yellow-50 dark:bg-yellow-950/20'
                          : ''
                      }`}
                    >
                      <TableCell className="font-medium py-1 text-xs">{team.position}</TableCell>
                      <TableCell className="py-1 text-xs">{team.team}</TableCell>
                      <TableCell className="py-1 text-xs">{team.played}</TableCell>
                      <TableCell className="py-1 text-xs">{team.wins}</TableCell>
                      <TableCell className="py-1 text-xs">{team.draws}</TableCell>
                      <TableCell className="py-1 text-xs">{team.losses}</TableCell>
                      <TableCell className="py-1 text-xs">{team.goals}</TableCell>
                      <TableCell className="font-medium py-1 text-xs">{team.points}</TableCell>
                      <TableCell className="py-1">
                        <div className="flex space-x-1">
                          {team.form.map((result, index) => (
                            <div
                              key={index}
                              className={`w-3 h-3 rounded flex items-center justify-center text-white text-xs font-bold ${getFormColor(result)}`}
                            >
                              {result}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Fixed Save Button */}
        <div className="sticky bottom-0 bg-background border-t border-border p-4 mt-6">
          <Button onClick={handleSave} className="w-full">
            Save Prediction
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};