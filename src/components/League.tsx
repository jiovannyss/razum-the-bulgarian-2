import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProcessedMatch {
  id: string;
  tournament: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  time: string;
  status: 'live' | 'upcoming' | 'finished';
  homeLogo?: string;
  awayLogo?: string;
  predictions?: number;
  popularPrediction?: string;
  rank?: number;
  myPrediction?: string | null;
  myPredictionCorrect?: boolean | null;
  round: string;
}

interface LeagueProps {
  leagueName: string;
  matches: ProcessedMatch[];
  leagueLogo?: string;
}

const League = ({ leagueName, matches, leagueLogo }: LeagueProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  console.log(`🏆 League: ${leagueName}, Matches count: ${matches.length}`, matches);
  
  // Group matches by round and get available rounds
  const matchesByRound = matches.reduce((acc, match) => {
    const round = match.round;
    if (!acc[round]) {
      acc[round] = [];
    }
    acc[round].push(match);
    return acc;
  }, {} as Record<string, ProcessedMatch[]>);
  
  console.log(`📊 Matches by round:`, matchesByRound);
  
  const availableRounds = Object.keys(matchesByRound).sort((a, b) => parseInt(a) - parseInt(b));
  const maxGameWeeks = Math.max(availableRounds.length, 1);
  
  console.log(`🎯 Available rounds: [${availableRounds.join(', ')}], Max GW: ${maxGameWeeks}`);
  
  const [currentGameWeek, setCurrentGameWeek] = useState(1);
  
  // If no matches, show all matches in a single "round"
  const currentRound = availableRounds.length > 0 ? availableRounds[currentGameWeek - 1] : '1';
  const currentMatches = availableRounds.length > 0 ? (matchesByRound[currentRound] || []) : matches;
  
  console.log(`⚽ Current GW: ${currentGameWeek}, Round: ${currentRound}, Matches: ${currentMatches.length}`);

  const formatMatchTime = (timeString: string) => {
    try {
      // If it's already in HH:mm format, try to add date
      if (timeString.match(/^\d{2}:\d{2}$/)) {
        return timeString;
      }
      
      // Parse ISO date string
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        return timeString; // Return original if can't parse
      }
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const matchDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const diffDays = Math.floor((matchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      const timeStr = date.toLocaleTimeString('bg-BG', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Europe/Sofia'
      });
      
      if (diffDays === 0) {
        return `днес ${timeStr}`;
      } else if (diffDays === 1) {
        return `утре ${timeStr}`;
      } else if (diffDays === -1) {
        return `вчера ${timeStr}`;
      } else {
        const dateStr = date.toLocaleDateString('bg-BG', { 
          day: '2-digit', 
          month: '2-digit',
          timeZone: 'Europe/Sofia'
        });
        return `${dateStr} ${timeStr}`;
      }
    } catch (error) {
      return timeString; // Return original if any error
    }
  };

  const getStatusBadge = (status: string, time: string) => {
    const formattedTime = formatMatchTime(time);
    
    switch (status) {
      case "live":
        return (
          <Badge className="bg-live text-white animate-pulse gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            {formattedTime}
          </Badge>
        );
      case "upcoming":
        return (
          <Badge variant="outline" className="text-muted-foreground gap-1">
            {formattedTime}
          </Badge>
        );
      case "finished":
        return <Badge variant="secondary">{formattedTime}</Badge>;
      default:
        return <Badge variant="outline">{formattedTime}</Badge>;
    }
  };

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case "1": return "bg-primary text-primary-foreground";
      case "X": return "bg-accent text-accent-foreground";
      case "2": return "bg-secondary text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handlePreviousGameWeek = () => {
    console.log(`⬅️ Previous GW clicked. Current: ${currentGameWeek}, Max: ${maxGameWeeks}`);
    if (currentGameWeek > 1) {
      const newGW = currentGameWeek - 1;
      console.log(`⬅️ Setting GW to: ${newGW}`);
      setCurrentGameWeek(newGW);
    }
  };

  const handleNextGameWeek = () => {
    console.log(`➡️ Next GW clicked. Current: ${currentGameWeek}, Max: ${maxGameWeeks}`);
    if (currentGameWeek < maxGameWeeks) {
      const newGW = currentGameWeek + 1;
      console.log(`➡️ Setting GW to: ${newGW}`);
      setCurrentGameWeek(newGW);
    }
  };

  return (
    <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/50">
      {/* League Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-card border-b border-border/50">
        <div className="flex items-center gap-3">
          {leagueLogo ? (
            <img src={leagueLogo} alt={leagueName} className="w-8 h-8 rounded-md" />
          ) : (
            <Trophy className="w-8 h-8 text-primary" />
          )}
          <div>
            <h3 className="font-semibold text-lg">{leagueName}</h3>
            <p className="text-sm text-muted-foreground">{matches.length} мача</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Game Week Navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousGameWeek}
              disabled={currentGameWeek <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2">
              GW {currentGameWeek}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextGameWeek}
              disabled={currentGameWeek >= maxGameWeeks}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Collapse/Expand Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Matches List */}
      {!isCollapsed && (
        <div className="divide-y divide-border/50">
          {currentMatches.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Няма мачове за кръг {currentRound || currentGameWeek}</p>
            </div>
          ) : (
            currentMatches.map((match) => (
              <div
                key={match.id}
                className="p-4 hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  {/* Teams and Score */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {match.homeLogo && (
                          <img 
                            src={match.homeLogo} 
                            alt={match.homeTeam}
                            className="w-6 h-6 rounded-sm"
                          />
                        )}
                        <span className="font-medium">{match.homeTeam}</span>
                      </div>
                      <div className="flex items-center gap-2 text-lg font-bold">
                        {match.homeScore !== null ? match.homeScore : '-'}
                        <span className="text-muted-foreground">:</span>
                        {match.awayScore !== null ? match.awayScore : '-'}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {match.awayLogo && (
                          <img 
                            src={match.awayLogo} 
                            alt={match.awayTeam}
                            className="w-6 h-6 rounded-sm"
                          />
                        )}
                        <span className="font-medium">{match.awayTeam}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status and Predictions */}
                  <div className="flex items-center gap-3 ml-4">
                    {getStatusBadge(match.status, match.time)}
                    
                    {match.predictions && (
                      <div className="text-sm text-muted-foreground">
                        {match.predictions} predictions
                      </div>
                    )}
                    
                    {match.popularPrediction && (
                      <Badge
                        variant="outline"
                        className={cn("text-xs", getPredictionColor(match.popularPrediction))}
                      >
                        {match.popularPrediction}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
};

export default League;