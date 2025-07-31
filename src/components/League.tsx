import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Trophy, TriangleAlert } from "lucide-react";
import { GameWeekNavigation } from "./GameWeekNavigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PredictionDialog } from "./PredictionDialog";

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
  currentMatchday?: number;
  onLoadMatchday?: (leagueName: string, matchday: number) => Promise<void>;
}

const League = ({ leagueName, matches, leagueLogo, currentMatchday, onLoadMatchday }: LeagueProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<ProcessedMatch | null>(null);
  const [isPredictionDialogOpen, setIsPredictionDialogOpen] = useState(false);
  
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
  
  // Use a fixed range of 1-38 for navigation, regardless of loaded matches
  const totalRounds = 38; // Standard for most leagues
  
  // Initialize with the current matchday if available, otherwise first round
  const [currentGameWeek, setCurrentGameWeek] = useState(() => {
    console.log(`🏗️ Initializing League ${leagueName}:`);
    console.log(`   - currentMatchday prop: ${currentMatchday}`);
    console.log(`   - availableRounds: [${availableRounds.join(', ')}]`);
    
    // If we have a current matchday from API, use it regardless of available rounds
    if (currentMatchday) {
      console.log(`🎯 Using API current matchday: ${currentMatchday}`);
      return currentMatchday;
    }
    const fallback = availableRounds.length > 0 ? parseInt(availableRounds[0]) : 1;
    console.log(`🎯 Using fallback matchday: ${fallback}`);
    return fallback;
  });
  
  // Update currentGameWeek when currentMatchday prop changes (but not when user navigates)
  useEffect(() => {
    console.log(`🔄 useEffect triggered for ${leagueName}:`);
    console.log(`   - currentMatchday: ${currentMatchday}`);
    
    // Only update if this is initial load and we don't have a manually set game week
    if (currentMatchday && currentGameWeek === (availableRounds.length > 0 ? parseInt(availableRounds[0]) : 1)) {
      console.log(`🔄 Initial load: Updating GW to API current: ${currentMatchday}`);
      setCurrentGameWeek(currentMatchday);
    }
  }, [currentMatchday, leagueName]); // Removed availableRounds from dependencies
  
  console.log(`🎯 Available rounds: [${availableRounds.join(', ')}], Current GW: ${currentGameWeek}, API Current: ${currentMatchday}`);
  
  // Get current round's matches
  const currentRound = currentGameWeek.toString();
  const currentMatches = matchesByRound[currentRound] || [];
  
  console.log(`⚽ Current GW: ${currentGameWeek}, Round: ${currentRound}, Matches: ${currentMatches.length}`);

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
        return { isToday: true, time: timeStr, date: null };
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
    console.log(`🎯 Changing from GW ${currentGameWeek} to GW ${newGameWeek}`);
    setCurrentGameWeek(newGameWeek);
    
    // Always load matches for this gameweek if callback provided
    if (onLoadMatchday) {
      console.log(`📥 Loading matches for GW ${newGameWeek}...`);
      try {
        await onLoadMatchday(leagueName, newGameWeek);
      } catch (error) {
        console.error(`❌ Failed to load GW ${newGameWeek}:`, error);
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
    console.log(`Saving prediction for match ${matchId}: ${prediction}`);
    
    // For now, just update local state (in real app, this would update your matches state)
    // You'd typically call an API here and then update the matches state
  };

  const handleClosePredictionDialog = () => {
    setIsPredictionDialogOpen(false);
    setSelectedMatch(null);
  };

  // Convert ProcessedMatch to the format expected by PredictionDialog
  const convertMatchForDialog = (match: ProcessedMatch) => {
    return {
      id: parseInt(match.id),
      homeTeam: {
        id: 1, // Would come from API
        name: match.homeTeam,
        shortName: match.homeTeam,
        tla: match.homeTeam.substring(0, 3).toUpperCase(),
        crest: match.homeLogo || '/placeholder.svg'
      },
      awayTeam: {
        id: 2, // Would come from API
        name: match.awayTeam,
        shortName: match.awayTeam,
        tla: match.awayTeam.substring(0, 3).toUpperCase(),
        crest: match.awayLogo || '/placeholder.svg'
      },
      utcDate: match.time,
      status: match.status,
      venue: 'Stadium TBD', // Would come from API
      score: {
        fullTime: {
          home: match.homeScore,
          away: match.awayScore
        }
      }
    };
  };

  return (
    <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-purple-700">
      {/* League Header - Clickable */}
      <div 
        className="flex items-center justify-between p-3 lg:p-4 bg-section-background border-b border-purple-700/50 cursor-pointer hover:bg-accent/10 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2 lg:gap-3">
          {leagueLogo ? (
            <img src={leagueLogo} alt={leagueName} className="w-6 h-6 lg:w-8 lg:h-8 rounded-md" />
          ) : (
            <Trophy className="w-6 h-6 lg:w-8 lg:h-8 text-primary" />
          )}
          <div>
            <h3 className="font-semibold text-sm lg:text-lg">{leagueName}</h3>
          </div>
        </div>

        <div className="flex items-center gap-1 lg:gap-2">
          {!isCollapsed && (
            <GameWeekNavigation
              currentGameWeek={currentGameWeek}
              onGameWeekChange={handleGameWeekChange}
              maxGameWeek={totalRounds}
            />
          )}

          {/* Collapse/Expand Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 lg:h-8 lg:w-8 p-0 hover:bg-accent/20"
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering parent click
              setIsCollapsed(!isCollapsed);
            }}
          >
            {isCollapsed ? (
              <ChevronDown className="h-3 w-3 lg:h-4 lg:w-4" />
            ) : (
              <ChevronUp className="h-3 w-3 lg:h-4 lg:w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Matches List */}
      {!isCollapsed && (
        <div className="divide-y-[3px] divide-purple-700/30">
          {currentMatches.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Няма мачове за кръг {currentRound || currentGameWeek}</p>
            </div>
          ) : (
             currentMatches.map((match) => {
               const timeInfo = getTimeInfo(match.time);
               
                return (
                  <div
                    key={match.id}
                    className={cn(
                      "p-3 lg:p-4 transition-colors",
                      match.status === 'upcoming' 
                        ? "hover:bg-accent/10 cursor-pointer" 
                        : "hover:bg-accent/5"
                    )}
                    onClick={() => handleMatchClick(match)}
                  >
                   <div className="flex items-center justify-between gap-4">
                     {/* Teams, Scores, Date/Time - takes most space */}
                     <div className="flex-1 min-w-0">
                       {/* Home Team Row */}
                       <div className="flex items-center justify-between mb-1 lg:mb-2">
                         <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
                           {match.homeLogo && (
                             <img 
                               src={match.homeLogo} 
                               alt={match.homeTeam}
                               className="w-4 h-4 lg:w-6 lg:h-6 rounded-sm flex-shrink-0"
                             />
                           )}
                           <span className="font-medium text-sm lg:text-base truncate">{match.homeTeam}</span>
                         </div>
                         <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                           <span className={cn(
                             "text-base lg:text-lg font-bold w-6 text-center",
                             match.status === "live" ? "text-live" : 
                             match.status === "finished" ? "text-white" : ""
                           )}>
                             {match.homeScore !== null ? match.homeScore : '-'}
                           </span>
                           <div className="w-12 text-center">
                              {match.status === "live" ? (
                                <div className="text-sm font-bold text-live flex items-baseline justify-center">
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
                               !timeInfo.isToday && timeInfo.date && (
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
                         <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
                           {match.awayLogo && (
                             <img 
                               src={match.awayLogo} 
                               alt={match.awayTeam}
                               className="w-4 h-4 lg:w-6 lg:h-6 rounded-sm flex-shrink-0"
                             />
                           )}
                           <span className="font-medium text-sm lg:text-base truncate">{match.awayTeam}</span>
                         </div>
                            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                              <span className={cn(
                                "text-base lg:text-lg font-bold w-6 text-center",
                                match.status === "live" ? "text-live" : 
                                match.status === "finished" ? "text-white" : ""
                              )}>
                                {match.awayScore !== null ? match.awayScore : '-'}
                              </span>
                               <div className="w-12 text-center">
                                 {match.status === "upcoming" && !timeInfo.isToday && (
                                   <span className="text-xs text-muted-foreground">
                                     {timeInfo.timeStr}
                                   </span>
                                 )}
                               </div>
                           </div>
                         </div>
                       </div>

                        {/* Prediction - right side */}
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          {/* My Prediction */}
                          {(() => {
                            const predictionDisplay = getPredictionDisplay(match);
                            
                            // За предстоящи мачове без прогноза - показвай триъгълник
                            if (match.status === 'upcoming' && !match.myPrediction) {
                              return (
                                <TriangleAlert 
                                  className="w-6 h-6 text-black fill-yellow-500" 
                                />
                              );
                            }
                            
                            return (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs border-0 font-bold min-w-[24px] h-6 flex items-center justify-center",
                                  predictionDisplay.bgColor,
                                  predictionDisplay.textColor
                                )}
                              >
                                {predictionDisplay.text}
                              </Badge>
                            );
                          })()}
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
      />
    </Card>
  );
};

export default League;