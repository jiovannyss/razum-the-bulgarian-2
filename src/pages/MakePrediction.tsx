import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Shield } from "lucide-react";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  time: string;
  status: 'upcoming' | 'live' | 'finished';
  rank: number;
  popularPrediction: string;
}

interface Tournament {
  id: string;
  name: string;
  matches: Match[];
  currentRound: number;
  totalRounds: number;
}

const mockTournaments: Tournament[] = [
  {
    id: "1",
    name: "ЕВРОПА: Шампионска лига - Квалификация",
    currentRound: 1,
    totalRounds: 6,
    matches: [
      {
        id: "1",
        homeTeam: "Real Madrid",
        awayTeam: "Barcelona",
        time: "20:30",
        status: 'upcoming',
        rank: 3,
        popularPrediction: "1"
      },
      {
        id: "2", 
        homeTeam: "Manchester City",
        awayTeam: "Liverpool",
        time: "21:00",
        status: 'upcoming',
        rank: 2,
        popularPrediction: "X"
      }
    ]
  },
  {
    id: "2",
    name: "АНГЛИЯ: Премиер лига",
    currentRound: 15,
    totalRounds: 38,
    matches: [
      {
        id: "3",
        homeTeam: "Arsenal",
        awayTeam: "Chelsea",
        time: "18:30",
        status: 'upcoming',
        rank: 2,
        popularPrediction: "2"
      }
    ]
  }
];

const MakePrediction = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
  const [expandedTournaments, setExpandedTournaments] = useState<Set<string>>(new Set(["1", "2"]));
  const [predictions, setPredictions] = useState<Record<string, string>>({});
  const [savedPredictions, setSavedPredictions] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const hasChanges = Object.keys(predictions).some(
      matchId => predictions[matchId] !== savedPredictions[matchId]
    );
    setHasUnsavedChanges(hasChanges);
  }, [predictions, savedPredictions]);

  const toggleTournament = (tournamentId: string) => {
    const newExpanded = new Set(expandedTournaments);
    if (newExpanded.has(tournamentId)) {
      newExpanded.delete(tournamentId);
    } else {
      newExpanded.add(tournamentId);
    }
    setExpandedTournaments(newExpanded);
  };

  const changeRound = (tournamentId: string, direction: 'prev' | 'next') => {
    setTournaments(tournaments.map(tournament => {
      if (tournament.id === tournamentId) {
        const newRound = direction === 'prev' 
          ? Math.max(1, tournament.currentRound - 1)
          : Math.min(tournament.totalRounds, tournament.currentRound + 1);
        return { ...tournament, currentRound: newRound };
      }
      return tournament;
    }));
  };

  const handlePredictionChange = (matchId: string, prediction: string) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: prediction
    }));
  };

  const handleSave = () => {
    setSavedPredictions({ ...predictions });
    setHasUnsavedChanges(false);
  };

  const renderRankShield = (rank: number) => {
    if (rank === 1) return null;
    
    return (
      <div className="relative">
        <Shield className="w-6 h-6 text-warning fill-warning" />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-warning-foreground">
          {rank}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Make Prediction</h1>
          <p className="text-muted-foreground">Select your predictions for upcoming matches</p>
        </div>

        <div className="space-y-4">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="bg-card border border-border rounded-lg overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => toggleTournament(tournament.id)}
              >
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{tournament.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        changeRound(tournament.id, 'prev');
                      }}
                      disabled={tournament.currentRound <= 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="px-2 py-1 bg-secondary rounded-md font-medium">
                      Round {tournament.currentRound} / {tournament.totalRounds}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        changeRound(tournament.id, 'next');
                      }}
                      disabled={tournament.currentRound >= tournament.totalRounds}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {expandedTournaments.has(tournament.id) ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              {expandedTournaments.has(tournament.id) && (
                <div className="border-t border-border">
                  <div className="grid grid-cols-5 gap-4 p-4 text-sm font-medium text-muted-foreground border-b border-border">
                    <div>Rank</div>
                    <div>Time</div>
                    <div>Match</div>
                    <div>Popular</div>
                    <div>My Prediction</div>
                  </div>
                  
                  <div className="space-y-2 p-4">
                    {tournament.matches.map((match) => (
                      <div key={match.id} className="grid grid-cols-5 gap-4 items-center py-2">
                        <div className="flex justify-center">
                          {renderRankShield(match.rank)}
                        </div>
                        
                        <div className="text-sm font-medium">
                          {match.time}
                        </div>
                        
                        <div className="text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{match.homeTeam}</span>
                            <span className="text-muted-foreground">vs</span>
                            <span className="font-medium">{match.awayTeam}</span>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                            {match.popularPrediction}
                          </span>
                        </div>
                        
                        <div>
                          <RadioGroup
                            value={predictions[match.id] || ""}
                            onValueChange={(value) => handlePredictionChange(match.id, value)}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="1" id={`${match.id}-1`} />
                              <Label htmlFor={`${match.id}-1`} className="text-sm font-medium cursor-pointer">1</Label>
                            </div>
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="X" id={`${match.id}-X`} />
                              <Label htmlFor={`${match.id}-X`} className="text-sm font-medium cursor-pointer">X</Label>
                            </div>
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="2" id={`${match.id}-2`} />
                              <Label htmlFor={`${match.id}-2`} className="text-sm font-medium cursor-pointer">2</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Save Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
          size="lg"
          className={`px-8 py-3 shadow-lg transition-all duration-300 ${
            hasUnsavedChanges 
              ? 'btn-glow hover:scale-105' 
              : 'opacity-60'
          }`}
        >
          Save Predictions
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default MakePrediction;