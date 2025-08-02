import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Trophy, TriangleAlert, Star } from "lucide-react";
import { GameWeekNavigation } from "./GameWeekNavigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PredictionDialog } from "./PredictionDialog";
import { type Match } from "@/services/footballDataApi";

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
  myPrediction?: string | null;
  myPredictionCorrect?: boolean | null;
  round: string;
  adminRating?: number;
  competition?: {
    id: number;
    name: string;
    emblem?: string;
    area?: {
      name: string;
    };
  };
}

interface LeagueProps {
  leagueName: string;
  areaName?: string;
  matches: ProcessedMatch[];
  leagueLogo?: string;
  currentMatchday?: number;
  onLoadMatchday?: (leagueName: string, matchday: number) => Promise<void>;
}

const League = ({ leagueName, areaName, matches, leagueLogo, currentMatchday, onLoadMatchday }: LeagueProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<ProcessedMatch | null>(null);
  const [isPredictionDialogOpen, setIsPredictionDialogOpen] = useState(false);
  
  
  
  // Group matches by round and get available rounds
  const matchesByRound = matches.reduce((acc, match) => {
    const round = match.round;
    if (!acc[round]) {
      acc[round] = [];
    }
    acc[round].push(match);
    return acc;
  }, {} as Record<string, ProcessedMatch[]>);
  
  
  
  const availableRounds = Object.keys(matchesByRound).sort((a, b) => parseInt(a) - parseInt(b));
  
  // Calculate max rounds based on available data, fallback to current matchday or 38
  const maxRoundFromMatches = availableRounds.length > 0 
    ? Math.max(...availableRounds.map(r => parseInt(r)))
    : 0;
  
  // Use current matchday if available and higher than max found round, otherwise use data max or 38 fallback
  const totalRounds = currentMatchday && currentMatchday > maxRoundFromMatches
    ? currentMatchday
    : maxRoundFromMatches > 0 
      ? maxRoundFromMatches 
      : 38;
  
  // Initialize with the current matchday if available, otherwise first round
  const [currentGameWeek, setCurrentGameWeek] = useState(() => {
    // If we have a current matchday from API, use it regardless of available rounds
    if (currentMatchday) {
      return currentMatchday;
    }
    const fallback = availableRounds.length > 0 ? parseInt(availableRounds[0]) : 1;
    return fallback;
  });
  
  // Update currentGameWeek when currentMatchday prop changes (but not when user navigates)
  useEffect(() => {
    if (currentMatchday && currentGameWeek === (availableRounds.length > 0 ? parseInt(availableRounds[0]) : 1)) {
      setCurrentGameWeek(currentMatchday);
    }
  }, [currentMatchday, leagueName]); // Removed availableRounds from dependencies
  
  // Get current round's matches
  const currentRound = currentGameWeek.toString();
  const currentMatches = matchesByRound[currentRound] || [];

  const formatMatchTime = (timeString: string) => {
    try {
      // If it's already in HH:mm format, try to add date
      if (timeString.match(/^\d{2}:\d{2}$/)) {
        return { isToday: false, time: timeString, date: null };
      }
      
      // Parse ISO date string
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        return { isToday: false, time: timeString, date: null }; // Return original if can't parse
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
        return { isToday: true, time: timeStr, date: "Today" };
      } else {
        const dateStr = date.toLocaleDateString('bg-BG', { 
          day: '2-digit', 
          month: '2-digit',
          timeZone: 'Europe/Sofia'
        });
        return { isToday: false, time: timeStr, date: dateStr };
      }
    } catch (error) {
      return { isToday: false, time: timeString, date: null }; // Return original if any error
    }
  };

  const getStatusBadge = (status: string, isLive: boolean = false) => {
    if (status === "live" && isLive) {
      return (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-live rounded-full animate-pulse"></div>
          <span className="text-xs text-live">LIVE</span>
        </div>
      );
    }
    return null;
  };

  const getTimeInfo = (timeString: string) => {
    const { isToday, time: timeStr, date } = formatMatchTime(timeString);
    return { isToday, timeStr, date };
  };

  const getMatchResult = (homeScore: number | null, awayScore: number | null): string | null => {
    if (homeScore === null || awayScore === null) return null;
    if (homeScore > awayScore) return "1";
    if (homeScore < awayScore) return "2";
    return "X";
  };

  const getPredictionDisplay = (match: ProcessedMatch) => {
    const myPrediction = match.myPrediction;
    const actualResult = getMatchResult(match.homeScore, match.awayScore);
    
    // За завършили мачове
    if (match.status === 'finished') {
      if (!myPrediction) {
        return { text: '-', bgColor: 'bg-destructive', textColor: 'text-destructive-foreground' };
      }
      
      const isCorrect = actualResult === myPrediction;
      return {
        text: myPrediction,
        bgColor: isCorrect ? 'bg-green-600' : 'bg-destructive',
        textColor: 'text-white'
      };
    }
    
    // За лайв мачове
    if (match.status === 'live') {
      if (!myPrediction) {
        return { text: '-', bgColor: 'bg-destructive', textColor: 'text-destructive-foreground' };
      }
      
      const currentResult = getMatchResult(match.homeScore, match.awayScore);
      const isCurrentlyCorrect = currentResult === myPrediction;
      return {
        text: myPrediction,
        bgColor: isCurrentlyCorrect ? 'bg-green-600' : 'bg-destructive',
        textColor: 'text-white'
      };
    }
    
    // За предстоящи мачове
    if (match.status === 'upcoming') {
      if (!myPrediction) {
        return { text: '!', bgColor: 'bg-yellow-500', textColor: 'text-black' };
      }
      
      return {
        text: myPrediction,
        bgColor: 'bg-muted',
        textColor: 'text-muted-foreground'
      };
    }
    
    // Fallback
    return { text: '-', bgColor: 'bg-muted', textColor: 'text-muted-foreground' };
  };

  const handleGameWeekChange = async (newGameWeek: number) => {
    setCurrentGameWeek(newGameWeek);
    
    // Always load matches for this gameweek if callback provided
    if (onLoadMatchday) {
      try {
        await onLoadMatchday(leagueName, newGameWeek);
      } catch (error) {
        console.error(`Failed to load GW ${newGameWeek}:`, error);
      }
    }
  };

  const handleMatchClick = (match: ProcessedMatch) => {
    // Only allow predictions for upcoming matches
    if (match.status === 'upcoming') {
      setSelectedMatch(match);
      setIsPredictionDialogOpen(true);
    }
  };

  const handleSavePrediction = (matchId: number, prediction: string | null) => {
    // Here you would normally save to backend/state
    
    // For now, just update local state (in real app, this would update your matches state)
    // You'd typically call an API here and then update the matches state
  };

  const handleClosePredictionDialog = () => {
    setIsPredictionDialogOpen(false);
    setSelectedMatch(null);
  };

  // Convert ProcessedMatch to the format expected by PredictionDialog
  const convertMatchForDialog = (match: ProcessedMatch): Match => {
    return {
      id: parseInt(match.id),
      homeTeam: {
        id: match.homeTeamId || 1, // Use real team ID if available
        name: match.homeTeam,
        shortName: match.homeTeam,
        tla: match.homeTeam.substring(0, 3).toUpperCase(),
        crest: match.homeLogo || '/placeholder.svg'
      },
      awayTeam: {
        id: match.awayTeamId || 2, // Use real team ID if available
        name: match.awayTeam,
        shortName: match.awayTeam,
        tla: match.awayTeam.substring(0, 3).toUpperCase(),
        crest: match.awayLogo || '/placeholder.svg'
      },
      utcDate: typeof match.time === 'string' && match.time.includes('T') ? match.time : new Date().toISOString(),
      status: match.status === 'live' ? 'IN_PLAY' : match.status === 'finished' ? 'FINISHED' : 'SCHEDULED',
      venue: 'Stadium TBD',
      score: {
        fullTime: {
          home: match.homeScore,
          away: match.awayScore
        },
        winner: match.homeScore !== null && match.awayScore !== null 
          ? (match.homeScore > match.awayScore ? 'HOME_TEAM' : match.awayScore > match.homeScore ? 'AWAY_TEAM' : 'DRAW')
          : null,
        halfTime: { home: null, away: null }
      },
      competition: match.competition || {
        id: 2013, // Fallback to Brazilian league
        name: match.tournament || 'Unknown Competition'
      },
      season: { id: 2371 },
      matchday: parseInt(match.round) || 1
    };
  };

  return (
    <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-purple-700 purple-glow">
      {/* League Header */}
      <div className="flex items-center justify-between p-2 sm:p-3 lg:p-4 bg-section-background border-b border-purple-700/50">
        {/* Left part - Clickable area extended to include navigation */}
        <div 
          className="flex items-center gap-2 lg:gap-3 cursor-pointer transition-colors rounded-lg p-1 sm:p-2 -m-1 sm:-m-2 flex-1"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {leagueLogo ? (
            <img src={leagueLogo} alt={leagueName} className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-md" />
          ) : (
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-primary" />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-xs sm:text-sm lg:text-lg truncate">
              {leagueName}
              <span className="hidden sm:inline">{areaName && `, ${areaName}`}</span>
            </h3>
          </div>
          
          {/* Game Week Navigation inside clickable area but with event prevention */}
          {!isCollapsed && (
            <div onClick={(e) => e.stopPropagation()} className="hidden sm:block">
              <GameWeekNavigation
                currentGameWeek={currentGameWeek}
                onGameWeekChange={handleGameWeekChange}
                maxGameWeek={totalRounds}
              />
            </div>
          )}
        </div>

        {/* Right part - Collapse/Expand Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-6 w-6 lg:h-8 lg:w-8 p-0 hover:bg-accent/20 flex-shrink-0"
        >
          {isCollapsed ? (
            <ChevronDown className="h-3 w-3 lg:h-4 lg:w-4" />
          ) : (
            <ChevronUp className="h-3 w-3 lg:h-4 lg:w-4" />
          )}
        </Button>
      </div>

      {/* Mobile Game Week Navigation - only visible when expanded on mobile */}
      {!isCollapsed && (
        <div className="sm:hidden p-2 border-b border-purple-700/30 bg-section-background">
          <GameWeekNavigation
            currentGameWeek={currentGameWeek}
            onGameWeekChange={handleGameWeekChange}
            maxGameWeek={totalRounds}
          />
        </div>
      )}

      {/* Matches List */}
      {!isCollapsed && (
        <div className="divide-y-[2px] sm:divide-y-[3px] divide-purple-700/30">
          {currentMatches.length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-muted-foreground">
              <Trophy className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">Няма мачове за кръг {currentRound || currentGameWeek}</p>
            </div>
          ) : (
             currentMatches.map((match) => {
               const timeInfo = getTimeInfo(match.time);
               
                return (
                  <div
                    key={match.id}
                    className={cn(
                      "p-2 sm:p-3 lg:p-4 transition-colors",
                      match.status === 'upcoming' 
                        ? "hover:bg-accent/10 cursor-pointer" 
                        : "hover:bg-accent/5"
                    )}
                    onClick={() => handleMatchClick(match)}
                  >
                   <div className="flex items-center gap-2 sm:gap-4">
                      {/* Star area - always present */}
                      <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 relative flex items-center justify-center">
                        {match.adminRating && match.adminRating >= 2 && (
                          <div className="relative">
                            <Star 
                              className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-400 fill-yellow-400" 
                              strokeWidth={1.5}
                            />
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-black">
                              {match.adminRating}
                            </span>
                          </div>
                        )}
                      </div>
                     {/* Teams, Scores, Date/Time - takes most space */}
                     <div className="flex-1 min-w-0">
                       {/* Home Team Row */}
                       <div className="flex items-center justify-between mb-1 lg:mb-2">
                         <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 min-w-0 flex-1">
                           {match.homeLogo && (
                             <img 
                               src={match.homeLogo} 
                               alt={match.homeTeam}
                               className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 rounded-sm flex-shrink-0"
                             />
                           )}
                           <span className="font-medium text-xs sm:text-sm lg:text-base truncate">{match.homeTeam}</span>
                         </div>
                         <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2 sm:ml-4">
                           <span className={cn(
                             "text-sm sm:text-base lg:text-lg font-bold w-4 sm:w-6 text-center",
                             match.status === "live" ? "text-live" : 
                             match.status === "finished" ? "text-white" : ""
                           )}>
                             {match.homeScore !== null ? match.homeScore : '-'}
                           </span>
                           <div className="w-8 sm:w-10 lg:w-12 text-center">
                              {match.status === "live" ? (
                                <div className="text-xs sm:text-sm font-bold text-live flex items-baseline justify-center">
                                  <span>{(() => {
                                    const now = new Date();
                                    const minutesSinceHour = now.getMinutes();
                                    const secondsSinceMinute = now.getSeconds();
                                    // Simulate match progression based on real time
                                    return (minutesSinceHour + Math.floor(secondsSinceMinute / 2)) % 90 + 1;
                                  })()}</span>
                                  <span className={cn("transition-opacity duration-500", 
                                    new Date().getSeconds() % 2 === 0 ? "opacity-100" : "opacity-0"
                                  )}>'</span>
                                </div>
                             ) : match.status === "finished" ? (
                               <span className="text-xs font-bold text-white">FT</span>
                             ) : match.status === "upcoming" && timeInfo.isToday ? (
                               <span className="text-xs text-muted-foreground">
                                 {timeInfo.timeStr}
                               </span>
                              ) : (
                                timeInfo.date && (
                                  <span className="text-xs text-muted-foreground">
                                    {timeInfo.date}
                                  </span>
                                )
                              )}
                           </div>
                         </div>
                       </div>
                       
                       {/* Away Team Row */}
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 min-w-0 flex-1">
                           {match.awayLogo && (
                             <img 
                               src={match.awayLogo} 
                               alt={match.awayTeam}
                               className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 rounded-sm flex-shrink-0"
                             />
                           )}
                           <span className="font-medium text-xs sm:text-sm lg:text-base truncate">{match.awayTeam}</span>
                         </div>
                            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2 sm:ml-4">
                              <span className={cn(
                                "text-sm sm:text-base lg:text-lg font-bold w-4 sm:w-6 text-center",
                                match.status === "live" ? "text-live" : 
                                match.status === "finished" ? "text-white" : ""
                              )}>
                                {match.awayScore !== null ? match.awayScore : '-'}
                              </span>
                              <div className="w-8 sm:w-10 lg:w-12" />
                            </div>
                       </div>
                     </div>

                     {/* My Prediction Button */}
                     <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
                       {(() => {
                         const predictionDisplay = getPredictionDisplay(match);
                         return (
                           <Badge 
                             className={cn(
                               "text-xs font-bold min-w-[20px] sm:min-w-[24px] h-6 sm:h-8 flex items-center justify-center",
                               predictionDisplay.bgColor,
                               predictionDisplay.textColor
                             )}
                           >
                             {predictionDisplay.text}
                           </Badge>
                         );
                       })()}
                       
                       {match.predictions && (
                         <div className="text-xs text-muted-foreground text-right hidden sm:block">
                           <div>{match.predictions}</div>
                           <div className="text-xs opacity-75">predictions</div>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               );
             })
          )}
        </div>
      )}
      
      {/* Prediction Dialog */}
      <PredictionDialog
        match={selectedMatch ? convertMatchForDialog(selectedMatch) : null}
        isOpen={isPredictionDialogOpen}
        onClose={handleClosePredictionDialog}
        onSavePrediction={handleSavePrediction}
        currentPrediction={selectedMatch?.myPrediction}
        adminRating={selectedMatch?.adminRating}
      />
    </Card>
  );
};

export default League;