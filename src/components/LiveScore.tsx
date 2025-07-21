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
  const { toast } = useToast();

  // Transform Football-Data.org API match to our format
  const transformMatch = (apiMatch: Match): ProcessedMatch => {
    let status: 'live' | 'upcoming' | 'finished' = 'upcoming';
    let time = new Date(apiMatch.utcDate).toLocaleTimeString('bg-BG', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    if (apiMatch.status === 'FINISHED') {
      status = 'finished';
      time = 'FT';
    } else if (apiMatch.status === 'IN_PLAY' || apiMatch.status === 'PAUSED') {
      status = 'live';
      time = 'Live';
    } else if (apiMatch.status === 'SCHEDULED') {
      status = 'upcoming';
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

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading Football-Data.org matches...');

      // Get upcoming matches from Football-Data.org
      const upcomingMatches = await footballDataApi.getUpcomingMatches();
      console.log(`📊 Found ${upcomingMatches.length} total matches`);

      if (upcomingMatches.length === 0) {
        console.log('⚠️ No upcoming matches found');
        throw new Error('No upcoming matches available');
      }

      const transformedMatches = upcomingMatches.map(transformMatch);
      console.log(`🏁 Transformed ${transformedMatches.length} matches`);
      setMatches(transformedMatches);
        
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
  }, []);

  // Filter matches based on active tab
  const getFilteredMatches = (tabFilter: string) => {
    switch (tabFilter) {
      case "today":
        return matches.filter(match => {
          return match.status === 'upcoming' || match.status === 'live';
        });
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

  // Get live matches count
  const liveMatchesCount = matches.filter(m => m.status === 'live').length;
  const leagueCount = Object.keys(matchesByLeague).length;

  return (
    <main className="min-h-screen bg-gradient-subtle p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold text-gradient leading-tight">
              Live Football Scores
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Football-Data.org API • 12 Free Leagues • Real-time Data
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-live rounded-full animate-pulse"></div>
                <span className="text-live font-medium">{liveMatchesCount} Live Matches</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">Active Leagues: {leagueCount}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="gap-2 card-hover"
              onClick={loadMatches}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button className="gap-2 btn-glow">
              <Target className="w-4 h-4" />
              Make Prediction
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:w-fit">
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
          {!loading && !error && Object.entries(matchesByLeague).map(([leagueName, leagueMatches]) => (
            <League
              key={leagueName}
              leagueName={leagueName}
              matches={leagueMatches}
            />
          ))}
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