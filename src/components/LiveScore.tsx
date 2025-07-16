import { useState } from "react";
import { Clock, Users, TrendingUp, Calendar, Filter, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    odds: { home: 1.85, draw: 3.20, away: 4.50 }
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
    odds: { home: 2.10, draw: 3.40, away: 3.20 }
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
    odds: { home: 2.80, draw: 3.10, away: 2.40 }
  }
];

const LiveScore = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "Всички", count: 156 },
    { id: "live", label: "НА ЖИВО", count: 23 },
    { id: "upcoming", label: "ПРЕДСТОЯЩИ", count: 89 },
    { id: "finished", label: "ЗАВЪРШИЛИ", count: 44 }
  ];

  const getStatusBadge = (status: string, time: string) => {
    switch (status) {
      case "live":
        return <Badge className="bg-live text-white animate-pulse">{time}</Badge>;
      case "upcoming":
        return <Badge variant="outline" className="text-muted-foreground">{time}</Badge>;
      case "finished":
        return <Badge variant="secondary">{time}</Badge>;
      default:
        return <Badge variant="outline">{time}</Badge>;
    }
  };

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case "1": return "text-primary";
      case "X": return "text-accent";
      case "2": return "text-secondary";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Filters Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Филтри:</span>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.id)}
                  className="relative"
                >
                  {filter.label}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {filter.count}
                  </Badge>
                </Button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                16/07 Ср
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar - My Predictions */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border p-4 mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Моите прогнози
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span>Активни:</span>
                  <Badge variant="outline">12</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Точки днес:</span>
                  <Badge className="bg-primary text-primary-foreground">+47</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Позиция:</span>
                  <Badge variant="secondary">#234</Badge>
                </div>
              </div>
              <Button className="w-full mt-4" size="sm">
                Класиране
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-semibold mb-4">Статистики</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Мачове днес:</span>
                  <span className="font-medium">156</span>
                </div>
                <div className="flex justify-between">
                  <span>На живо:</span>
                  <span className="font-medium text-live">23</span>
                </div>
                <div className="flex justify-between">
                  <span>Прогнози общо:</span>
                  <span className="font-medium">12,847</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Matches Area */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              
              {/* Tournament Groups */}
              {Object.entries(
                mockMatches.reduce((acc, match) => {
                  const tournament = match.tournament;
                  if (!acc[tournament]) {
                    acc[tournament] = [];
                  }
                  acc[tournament].push(match);
                  return acc;
                }, {} as Record<string, typeof mockMatches>)
              ).map(([tournament, matches]) => (
                <div key={tournament} className="bg-card rounded-lg border overflow-hidden">
                  
                  {/* Tournament Header */}
                  <div className="bg-muted/50 px-4 py-3 border-b">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-primary rounded-full"></div>
                      {tournament}
                    </h3>
                  </div>

                  {/* Matches List */}
                  <div className="divide-y">
                    {matches.map((match) => (
                      <div key={match.id} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          
                          {/* Time/Status */}
                          <div className="col-span-2 flex flex-col items-center">
                            {getStatusBadge(match.status, match.time)}
                          </div>

                          {/* Teams & Score */}
                          <div className="col-span-5">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{match.homeTeam}</span>
                                {match.homeScore !== null && (
                                  <span className="font-bold text-lg">{match.homeScore}</span>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{match.awayTeam}</span>
                                {match.awayScore !== null && (
                                  <span className="font-bold text-lg">{match.awayScore}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Glowter Stats */}
                          <div className="col-span-3 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{match.predictions}</span>
                              <span className="text-xs text-muted-foreground">прогнози</span>
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <TrendingUp className="h-3 w-3 text-muted-foreground" />
                              <span className={`text-sm font-medium ${getPredictionColor(match.popularPrediction)}`}>
                                {match.popularPrediction} (67%)
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="col-span-2">
                            {match.status === "upcoming" ? (
                              <Button size="sm" className="w-full">
                                Прогноза
                              </Button>
                            ) : match.status === "live" ? (
                              <Button variant="outline" size="sm" className="w-full">
                                Гледай
                              </Button>
                            ) : (
                              <Button variant="ghost" size="sm" className="w-full">
                                Детайли
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveScore;