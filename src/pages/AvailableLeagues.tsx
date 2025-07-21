import { useState, useEffect } from "react";
import { footballApi, type League } from "@/services/footballApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Trophy, Globe, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AvailableLeagues = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadLeagues = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await footballApi.getLeagues();
      setLeagues(data);
      
      toast({
        title: "Leagues loaded successfully",
        description: `Found ${data.length} available leagues in your plan`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Error loading leagues",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeagues();
  }, []);

  // Group leagues by country
  const leaguesByCountry = leagues.reduce((acc, league) => {
    const country = league.country_name;
    if (!acc[country]) {
      acc[country] = [];
    }
    acc[country].push(league);
    return acc;
  }, {} as Record<string, League[]>);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading available leagues...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Card className="p-6 max-w-md mx-auto">
            <div className="flex items-center gap-3 text-destructive mb-4">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Error loading leagues</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadLeagues} size="sm" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Available Leagues
            </h1>
            <p className="text-muted-foreground mt-2">
              All leagues available in your Free plan
            </p>
          </div>
          <Button onClick={loadLeagues} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="gap-2">
            <Trophy className="w-4 h-4" />
            {leagues.length} Total Leagues
          </Badge>
          <Badge variant="secondary" className="gap-2">
            <Globe className="w-4 h-4" />
            {Object.keys(leaguesByCountry).length} Countries
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {Object.entries(leaguesByCountry).map(([country, countryLeagues]) => (
          <Card key={country}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {countryLeagues[0]?.country_logo && (
                  <img 
                    src={countryLeagues[0].country_logo} 
                    alt={country}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                )}
                <span>{country}</span>
                <Badge variant="outline">
                  {countryLeagues.length} leagues
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {countryLeagues.map((league) => (
                  <div 
                    key={league.league_id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors"
                  >
                    {league.league_logo ? (
                      <img 
                        src={league.league_logo} 
                        alt={league.league_name}
                        className="w-8 h-8 rounded object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                        <Trophy className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {league.league_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ID: {league.league_id}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {leagues.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No leagues found in your subscription plan
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailableLeagues;