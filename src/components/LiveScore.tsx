import { useState } from "react";
import { 
  Clock, 
  Users, 
  TrendingUp, 
  Calendar, 
  Target, 
  Trophy,
  BarChart3,
  MoreHorizontal,
  Eye,
  Timer,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mockMatches = [
  {
    id: 1,
    tournament: "ЕВРОПА: Шампионска лига - Квалификация",
    homeTeam: "Лудогорец",
    awayTeam: "Дин. Минск",
    homeScore: null,
    awayScore: null,
    time: "14:45",
    status: "upcoming",
    predictions: 147,
    popularPrediction: "1",
    rank: 3,
    myPrediction: null
  },
  {
    id: 2,
    tournament: "ЕВРОПА: Лига на конференциите - Квалификация", 
    homeTeam: "Ауда",
    awayTeam: "Ларн",
    homeScore: 1,
    awayScore: 0,
    time: "67'",
    status: "live",
    predictions: 89,
    popularPrediction: "1",
    rank: 2,
    myPrediction: "1",
    myPredictionCorrect: null // still playing
  },
  {
    id: 3,
    tournament: "БЪЛГАРИЯ: Първа лига",
    homeTeam: "ЦСКА 1948",
    awayTeam: "Левски",
    homeScore: 2,
    awayScore: 1,
    time: "FT",
    status: "finished",
    predictions: 324,
    popularPrediction: "X",
    rank: 2,
    myPrediction: "1",
    myPredictionCorrect: true
  },
  {
    id: 4,
    tournament: "ЕВРОПА: Шампионска лига - Квалификация",
    homeTeam: "Арсенал",
    awayTeam: "Челси",
    homeScore: null,
    awayScore: null,
    time: "16:30",
    status: "upcoming",
    predictions: 892,
    popularPrediction: "2",
    rank: 3,
    myPrediction: "X",
    myPredictionCorrect: false
  },
  {
    id: 5,
    tournament: "БЪЛГАРИЯ: Първа лига",
    homeTeam: "Ботев Пд",
    awayTeam: "Черно море",
    homeScore: 0,
    awayScore: 0,
    time: "23'",
    status: "live",
    predictions: 156,
    popularPrediction: "X",
    rank: 1,
    myPrediction: null
  }
];

const LiveScore = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [collapsedTournaments, setCollapsedTournaments] = useState<Record<string, boolean>>({});
  const [currentGameWeek, setCurrentGameWeek] = useState(1);

  const filters = ["All", "Live", "Upcoming", "Finished"];

  // Group matches by tournament
  const matchesByTournament = mockMatches.reduce((acc, match) => {
    const tournament = match.tournament;
    if (!acc[tournament]) {
      acc[tournament] = [];
    }
    acc[tournament].push(match);
    return acc;
  }, {} as Record<string, typeof mockMatches>);

  const getStatusBadge = (status: string, time: string) => {
    switch (status) {
      case "live":
        return (
          <Badge className="bg-live text-white animate-pulse gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            {time}
          </Badge>
        );
      case "upcoming":
        return (
          <Badge variant="outline" className="text-muted-foreground gap-1">
            <Timer className="w-3 h-3" />
            {time}
          </Badge>
        );
      case "finished":
        return <Badge variant="secondary">{time}</Badge>;
      default:
        return <Badge variant="outline">{time}</Badge>;
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

  const renderStars = (rank: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rank ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  const getMyPredictionDisplay = (match: any) => {
    if (!match.myPrediction) {
      return (
        <Button size="sm" variant="outline" className="gap-2">
          <Target className="w-3 h-3" />
          Predict
        </Button>
      );
    }

    if (match.status === "finished") {
      if (match.myPredictionCorrect) {
        return (
          <div className="px-3 py-1 bg-green-500/20 text-green-600 border border-green-500/30 rounded-md text-sm font-medium">
            {match.myPrediction} ✓
          </div>
        );
      } else {
        return (
          <div className="px-3 py-1 bg-red-500/20 text-red-600 border border-red-500/30 rounded-md text-sm font-medium">
            {match.myPrediction} ✗
          </div>
        );
      }
    }

    return (
      <div className="px-3 py-1 bg-muted text-muted-foreground border border-border rounded-md text-sm font-medium">
        {match.myPrediction}
      </div>
    );
  };

  const toggleTournament = (tournament: string) => {
    setCollapsedTournaments(prev => ({
      ...prev,
      [tournament]: !prev[tournament]
    }));
  };

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
                <span className="text-live font-medium">3 Live Matches</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">Active Tournaments: 3</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">Game Week:</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentGameWeek(Math.max(1, currentGameWeek - 1))}
                    disabled={currentGameWeek === 1}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="font-medium min-w-[2rem] text-center">{currentGameWeek}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentGameWeek(currentGameWeek + 1)}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 card-hover">
              <Calendar className="w-4 h-4" />
              Today
            </Button>
            <Button className="gap-2 btn-glow">
              <Target className="w-4 h-4" />
              Make Prediction
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className={`transition-all duration-200 card-hover ${
                  activeFilter === filter ? 'btn-glow' : ''
                }`}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

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

          {/* Matches */}
          <div className="xl:col-span-3 space-y-8">
            {Object.entries(matchesByTournament).map(([tournament, matches]) => (
              <Card key={tournament} className="card-hover bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-4 cursor-pointer" onClick={() => toggleTournament(tournament)}>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl">{tournament}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {matches.length} matches
                    </Badge>
                    {collapsedTournaments[tournament] ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    )}
                  </CardTitle>
                </CardHeader>
                {!collapsedTournaments[tournament] && (
                  <CardContent>
                    <div className="space-y-3">
                      {matches.map((match) => (
                        <div
                          key={match.id}
                          className="flex items-center justify-between p-4 bg-gradient-card rounded-xl border border-border/50 hover:shadow-elegant transition-all duration-300 group"
                        >
                          {/* Rank Stars */}
                          <div className="flex items-center gap-3">
                            {renderStars(match.rank)}
                          </div>

                          {/* Time & Status */}
                          <div className="flex items-center gap-3">
                            {getStatusBadge(match.status, match.time)}
                          </div>

                          {/* Teams & Score */}
                          <div className="flex-1 mx-6">
                            <div className="flex items-center justify-center gap-4 text-center">
                              <div className="flex items-center gap-2 flex-1 justify-end">
                                <span className="font-semibold text-base">{match.homeTeam}</span>
                                <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium">
                                  {match.homeTeam.slice(0, 2).toUpperCase()}
                                </div>
                              </div>
                              <div className="text-xl font-bold text-gradient min-w-[80px]">
                                {match.homeScore !== null ? `${match.homeScore} - ${match.awayScore}` : "vs"}
                              </div>
                              <div className="flex items-center gap-2 flex-1">
                                <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium">
                                  {match.awayTeam.slice(0, 2).toUpperCase()}
                                </div>
                                <span className="font-semibold text-base">{match.awayTeam}</span>
                              </div>
                            </div>
                          </div>

                          {/* Predictions Count */}
                          <div className="text-center mr-6">
                            <div className="text-xs text-muted-foreground mb-1">Predictions</div>
                            <div className="font-bold text-sm text-primary">{match.predictions}</div>
                          </div>

                          {/* My Prediction */}
                          <div className="flex items-center gap-3">
                            {getMyPredictionDisplay(match)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default LiveScore;