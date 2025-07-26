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
      const allMatches = await this.getMatches(competitionId);
      const matchdays = [...new Set(allMatches.map(m => m.matchday))].sort((a, b) => a - b);
      return matchdays;
    } catch (error) {
      console.log('Error getting matchdays, using defaults');
      return [16, 17, 18, 19, 20]; // Default matchdays
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
          const currentMatchday = await this.getCurrentMatchday(competition.id);
          
          // Get matches from current matchday and surrounding ones (±2 matchdays)
          const matchdaysToFetch = [
            currentMatchday - 2,
            currentMatchday - 1, 
            currentMatchday,
            currentMatchday + 1,
            currentMatchday + 2
          ].filter(md => md > 0 && md <= 38); // Filter valid matchdays
          
          for (const matchday of matchdaysToFetch) {
            try {
              const matches = await this.getMatches(competition.id, matchday);
              if (matches && matches.length > 0) {
                allMatches.push(...matches);
                console.log(`✅ Added ${matches.length} matches from ${competition.name} GW${matchday}`);
              }
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