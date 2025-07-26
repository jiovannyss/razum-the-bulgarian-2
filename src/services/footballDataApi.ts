// Football-Data.org API Service with CORS proxy
// Documentation: https://www.football-data.org/documentation/api

export interface Competition {
  id: number;
  area: {
    id: number;
    name: string;
    code: string;
    flag?: string;
  };
  name: string;
  code: string;
  plan: string;
  currentSeason: {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
  };
}

export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface Match {
  id: number;
  competition: {
    id: number;
    name: string;
  };
  season: {
    id: number;
  };
  utcDate: string;
  status: string;
  matchday: number;
  homeTeam: Team;
  awayTeam: Team;
  score: {
    winner?: string;
    fullTime: {
      home?: number;
      away?: number;
    };
    halfTime: {
      home?: number;
      away?: number;
    };
  };
}

export interface CompetitionsResponse {
  count: number;
  competitions: Competition[];
}

export interface MatchesResponse {
  count: number;
  matches: Match[];
}

class FootballDataApiService {
  private baseUrl = 'https://api.football-data.org/v4';
  private corsProxy = 'https://corsproxy.io/?';
  private apiKey = '4c0b967130864749a36fb552c0755910';

  private async makeRequest<T>(endpoint: string): Promise<T> {
    console.log(`🌐 Making request to: ${this.baseUrl}${endpoint}`);
    
    // Use CORS proxy to bypass CORS restrictions
    const url = `${this.corsProxy}${encodeURIComponent(this.baseUrl + endpoint)}`;
    
    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`❌ API request failed: ${response.status} ${response.statusText}`);
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ API response received:`, data);
    return data;
  }

  // Get available competitions (free tier only)
  async getCompetitions(): Promise<Competition[]> {
    const response = await this.makeRequest<CompetitionsResponse>('/competitions');
    // Filter only free tier competitions
    return response.competitions.filter(comp => comp.plan === 'TIER_ONE');
  }

  // Get matches for a specific competition
  async getMatches(competitionId: number, matchday?: number): Promise<Match[]> {
    let endpoint = `/competitions/${competitionId}/matches`;
    
    const params = new URLSearchParams();
    if (matchday) {
      params.append('matchday', matchday.toString());
    }
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    const response = await this.makeRequest<MatchesResponse>(endpoint);
    return response.matches;
  }

  // Get current matchday for competition
  async getCurrentMatchday(competitionId: number): Promise<number> {
    try {
      const competitions = await this.getCompetitions();
      const competition = competitions.find(c => c.id === competitionId);
      return competition?.currentSeason.currentMatchday || 1;
    } catch (error) {
      console.log('Error getting current matchday, using default');
      return 18; // Default to matchday 18
    }
  }

  // Get all matchdays for a competition
  async getMatchdays(competitionId: number): Promise<number[]> {
    try {
      console.log(`📅 Getting all matchdays for competition: ${competitionId}`);
      
      // Get current matchday first
      const currentMatchday = await this.getCurrentMatchday(competitionId);
      console.log(`📅 Current matchday: ${currentMatchday}`);
      
      // For most leagues, return all typical matchdays (1-38)
      const maxMatchdays = 38;
      const allMatchdays = Array.from({ length: maxMatchdays }, (_, i) => i + 1);
      console.log(`📅 Returning all ${maxMatchdays} matchdays for competition ${competitionId}`);
      return allMatchdays;
    } catch (error) {
      console.log('Error getting matchdays, using defaults');
      return Array.from({ length: 38 }, (_, i) => i + 1); // Return 1-38 as fallback
    }
  }

  // Get upcoming matches across all competitions
  async getUpcomingMatches(): Promise<Match[]> {
    try {
      const competitions = await this.getCompetitions();
      console.log(`📋 Found ${competitions.length} free competitions`);
      
      let allMatches: Match[] = [];
      
      // Get matches from first 3 competitions to avoid rate limits
      for (const competition of competitions.slice(0, 3)) {
        try {
          console.log(`🎯 Getting matches for: ${competition.name}`);
          
          // Get all available matchdays for this competition
          const availableMatchdays = await this.getMatchdays(competition.id);
          console.log(`📅 Available matchdays for ${competition.name}: [${availableMatchdays.join(', ')}]`);
          
          // Fetch matches from all available matchdays
          for (const matchday of availableMatchdays) {
            try {
              const matches = await this.getMatches(competition.id, matchday);
              if (matches && matches.length > 0) {
                allMatches.push(...matches);
                console.log(`✅ Added ${matches.length} matches from ${competition.name} GW${matchday}`);
              }
              
              // Add small delay to avoid hitting rate limits too hard
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
              console.log(`❌ Error getting GW${matchday} for ${competition.name}:`, error);
            }
          }
        } catch (error) {
          console.log(`❌ Error getting matches for ${competition.name}:`, error);
        }
      }
      
      return allMatches;
    } catch (error) {
      console.error('Error getting upcoming matches:', error);
      throw error;
    }
  }
}

export const footballDataApi = new FootballDataApiService();