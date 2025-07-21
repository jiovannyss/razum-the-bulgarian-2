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
import { footballApi, type Match } from "@/services/footballApi";
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
}

const LiveScore = () => {
  const [activeTab, setActiveTab] = useState("matches");
  const [matches, setMatches] = useState<ProcessedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Generate demo matches for fallback
  const generateDemoMatches = (): ProcessedMatch[] => {
    const demoMatches = [
      {
        id: 'demo1',
        tournament: 'England: Premier League',
        homeTeam: 'Manchester City',
        awayTeam: 'Arsenal',
        homeScore: 2,
        awayScore: 1,
        time: 'FT',
        status: 'finished' as const,
        homeLogo: '',
        awayLogo: '',
        predictions: 1247,
        popularPrediction: '1',
        rank: 1
      },
      {
        id: 'demo2',
        tournament: 'Spain: La Liga',
        homeTeam: 'Real Madrid',
        awayTeam: 'Barcelona',
        homeScore: 1,
        awayScore: 1,
        time: '78\'',
        status: 'live' as const,
        homeLogo: '',
        awayLogo: '',
        predictions: 2156,
        popularPrediction: 'X',
        rank: 2
      },
      {
        id: 'demo3',
        tournament: 'Germany: Bundesliga',
        homeTeam: 'Bayern Munich',
        awayTeam: 'Borussia Dortmund',
        homeScore: null,
        awayScore: null,
        time: '20:30',
        status: 'upcoming' as const,
        homeLogo: '',
        awayLogo: '',
        predictions: 987,
        popularPrediction: '1',
        rank: 3
      },
      {
        id: 'demo4',
        tournament: 'Italy: Serie A',
        homeTeam: 'Juventus',
        awayTeam: 'AC Milan',
        homeScore: null,
        awayScore: null,
        time: '21:45',
        status: 'upcoming' as const,
        homeLogo: '',
        awayLogo: '',
        predictions: 743,
        popularPrediction: '2',
        rank: 1
      }
    ];
    return demoMatches;
  };

  // Transform API match to our format
  const transformMatch = (apiMatch: Match): ProcessedMatch => {
    let status: 'live' | 'upcoming' | 'finished' = 'upcoming';
    let time = apiMatch.match_time;

    if (apiMatch.match_status === 'Finished') {
      status = 'finished';
      time = 'FT';
    } else if (apiMatch.match_live === '1') {
      status = 'live';
      time = apiMatch.match_status || 'Live';
    }

    return {
      id: apiMatch.match_id,
      tournament: `${apiMatch.country_name}: ${apiMatch.league_name}`,
      homeTeam: apiMatch.match_hometeam_name,
      awayTeam: apiMatch.match_awayteam_name,
      homeScore: apiMatch.match_hometeam_score ? parseInt(apiMatch.match_hometeam_score) : null,
      awayScore: apiMatch.match_awayteam_score ? parseInt(apiMatch.match_awayteam_score) : null,
      time,
      status,
      homeLogo: apiMatch.team_home_badge,
      awayLogo: apiMatch.team_away_badge,
      predictions: Math.floor(Math.random() * 500) + 50,
      popularPrediction: ['1', 'X', '2'][Math.floor(Math.random() * 3)],
      rank: Math.floor(Math.random() * 3) + 1,
      myPrediction: null,
      myPredictionCorrect: null
    };
  };

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const today = footballApi.getTodayDate();
      const tomorrow = footballApi.getTomorrowDate();
      const yesterday = footballApi.getYesterdayDate();

      // Try to load matches from API first
      try {
        const [todayMatches, tomorrowMatches, yesterdayMatches] = await Promise.all([
          footballApi.getMatches(today, today),
          footballApi.getMatches(tomorrow, tomorrow),
          footballApi.getMatches(yesterday, yesterday)
        ]);

        const allMatches = [
          ...yesterdayMatches,
          ...todayMatches, 
          ...tomorrowMatches
        ].map(transformMatch);

        if (allMatches.length > 0) {
          setMatches(allMatches);
          return;
        }
      } catch (apiError) {
        console.log('API error, using demo data:', apiError);
      }

      // Fallback to demo data when API fails or returns no data
      const demoMatches = generateDemoMatches();
      setMatches(demoMatches);
      
      toast({
        title: "Demo режим",
        description: "Показват се демо данни поради ограничения в Free плана на API.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестна грешка';
      setError(errorMessage);
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
          // For demo purposes, consider all matches as "today" since API returns 404
          return true; 
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
              Make predictions, earn points, and climb the rankings with every match
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
              <span>Loading matches...</span>
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
                No matches available for the selected filter. Try refreshing or changing the filter.
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

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* My Predictions */}
            <Card className="card-hover bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-primary" />
                  My Predictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-card rounded-xl border border-border/50">
                  <div>
                    <div className="font-semibold text-sm">Chelsea vs Arsenal</div>
                    <div className="text-xs text-muted-foreground">2-1 (Your prediction)</div>
                  </div>
                  <Badge variant="secondary" className="animate-pulse">
                    Live
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-success/10 rounded-xl border border-success/20">
                  <div>
                    <div className="font-semibold text-sm">Man City vs Liverpool</div>
                    <div className="text-xs text-success font-medium">1-0 ✓ Correct!</div>
                  </div>
                  <Badge className="bg-success animate-fade-in-up">
                    +25 pts
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-xl border border-destructive/20">
                  <div>
                    <div className="font-semibold text-sm">Barcelona vs Madrid</div>
                    <div className="text-xs text-destructive">0-2 ✗ Wrong</div>
                  </div>
                  <Badge variant="destructive" className="opacity-75">
                    0 pts
                  </Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full card-hover">
                  View All Predictions
                </Button>
              </CardContent>
            </Card>

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

          {/* Leagues */}
          <div className="xl:col-span-3 space-y-6">
            {!loading && !error && Object.entries(matchesByLeague).map(([leagueName, leagueMatches]) => (
              <League
                key={leagueName}
                leagueName={leagueName}
                matches={leagueMatches}
                gameWeeks={38} // Standard number of game weeks
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default LiveScore;