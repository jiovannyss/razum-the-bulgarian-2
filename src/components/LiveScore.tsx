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
import League from "./League";

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

const LiveScore = () => {
  const [activeTab, setActiveTab] = useState("matches");
  const [matches, setMatches] = useState<ProcessedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [competitionsWithCurrentMatchday, setCompetitionsWithCurrentMatchday] = useState<Array<Competition & { currentMatchday: number }>>([]);
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
      homeScore: apiMatch.score.fullTime.home,
      awayScore: apiMatch.score.fullTime.away,
      time,
      status,
      homeLogo: apiMatch.homeTeam.crest,
      awayLogo: apiMatch.awayTeam.crest,
      predictions: Math.floor(Math.random() * 500) + 50,
      popularPrediction: ['1', 'X', '2'][Math.floor(Math.random() * 3)],
      rank: Math.floor(Math.random() * 3) + 1,
      myPrediction: null,
      myPredictionCorrect: null,
      round: apiMatch.matchday.toString()
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
        const transformedMatches = newMatches.map(transformMatch);
        
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
          description: `No matches found for ${leagueName} Round ${matchday}`,
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

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading Football-Data.org matches...');

      // Get competitions and their current matchdays
      const competitions = await footballDataApi.getCompetitions();
      const competitionsWithCurrentMatchday = await Promise.all(
        competitions.slice(0, 3).map(async (comp) => {
          try {
            const currentMatchday = await footballDataApi.getCurrentMatchday(comp.id);
            return { ...comp, currentMatchday };
          } catch (error) {
            console.log(`❌ Error getting current matchday for ${comp.name}:`, error);
            return { ...comp, currentMatchday: 1 };
          }
        })
      );

      // Get upcoming matches from Football-Data.org
      const upcomingMatches = await footballDataApi.getUpcomingMatches();
      console.log(`📊 Found ${upcomingMatches.length} total matches`);
      
      // Log rounds from the matches
      const roundsInMatches = [...new Set(upcomingMatches.map(m => m.matchday))];
      console.log(`📋 Rounds in API matches: [${roundsInMatches.sort((a, b) => a - b).join(', ')}]`);

      if (upcomingMatches.length === 0) {
        console.log('⚠️ No upcoming matches found - creating demo data');
        // Create demo data if no matches are available
        const demoMatches: ProcessedMatch[] = [
          {
            id: "demo1",
            tournament: "Premier League",
            homeTeam: "Liverpool",
            awayTeam: "Arsenal", 
            homeScore: null,
            awayScore: null,
            time: "2025-07-22T20:00:00Z",
            status: "upcoming",
            round: "1"
          },
          {
            id: "demo2", 
            tournament: "Premier League",
            homeTeam: "Manchester City",
            awayTeam: "Chelsea",
            homeScore: null,
            awayScore: null,
            time: "2025-07-22T17:30:00Z", 
            status: "upcoming",
            round: "1"
          }
        ];
        setMatches(demoMatches);
        return;
      }

      const transformedMatches = upcomingMatches.map(transformMatch);
      console.log(`🏁 Transformed ${transformedMatches.length} matches`);
      console.log(`📅 Competitions with current matchday:`, competitionsWithCurrentMatchday);
      setMatches(transformedMatches);
      setCompetitionsWithCurrentMatchday(competitionsWithCurrentMatchday);
        
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестна грешка';
      setError(errorMessage);
      console.error('❌ Error loading Football-Data.org matches:', err);
      toast({
        title: "Грешка при зареждане",
        description: `Неуспешно зареждане на мачовете: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
    // Test Brazilian League API
    footballDataApi.testBrazilianLeague21();
  }, []);

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

  return (
    <main className="min-h-screen bg-gradient-subtle p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="space-y-2 w-full lg:w-auto">
            <div className="flex flex-wrap items-center gap-2 lg:gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs lg:text-sm">
                <div className="w-2 h-2 bg-live rounded-full animate-pulse"></div>
                <span className="text-live font-medium">{liveMatchesCount} Live Matches</span>
              </div>
              <div className="flex items-center gap-2 text-xs lg:text-sm">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">{todayMatchesCount} Matches Today</span>
              </div>
              <div className="flex items-center gap-2 text-xs lg:text-sm">
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
              <span className="hidden sm:inline">{loading ? 'Loading...' : 'Refresh'}</span>
              <span className="sm:hidden">↻</span>
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
            <Card className="p-6 max-w-md mx-auto">
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
            <Card className="p-6 max-w-md mx-auto text-center">
              <div className="flex items-center justify-center gap-3 text-muted-foreground mb-4">
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">No matches found</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                No upcoming matches available from Football-Data.org. Try refreshing.
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
            // Find current matchday for this league
            const competitionInfo = competitionsWithCurrentMatchday.find(comp => comp.name === leagueName);
            const currentMatchday = competitionInfo?.currentMatchday || 1;
            
            console.log(`🎯 League: ${leagueName}, Found competition:`, competitionInfo, `Current matchday: ${currentMatchday}`);
            
            return (
              <League
                key={leagueName}
                leagueName={leagueName}
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
          <Card className="card-hover bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-card rounded-xl border border-border/50">
                  <div className="font-bold text-2xl text-gradient">87%</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
                <div className="text-center p-4 bg-gradient-card rounded-xl border border-border/50">
                  <div className="font-bold text-2xl text-gradient">1,247</div>
                  <div className="text-xs text-muted-foreground">Points</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">This Week</span>
                  <span className="font-semibold text-success">+156 pts</span>
                </div>
                <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-primary h-3 rounded-full transition-all duration-1000 animate-fade-in-up" style={{ width: "78%" }}></div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div className="text-center">
                    <div className="font-medium text-foreground">12</div>
                    <div>Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">3</div>
                    <div>Wrong</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">5</div>
                    <div>Pending</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="card-hover bg-card/50 backdrop-blur-sm border-border/50">
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