// API-Football.com API Service
// Documentation: https://www.api-football.com/documentation-v3

export interface Competition {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
  };
}

export interface Team {
  id: number;
  name: string;
  logo: string;
}

export interface Match {
  fixture: {
    id: number;
    referee: string;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number;
      second: number;
    };
    venue: {
      id: number;
      name: string;
      city: string;
    };
    status: {
      long: string;
      short: string;
      elapsed: number;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: Team;
    away: Team;
  };
  goals: {
    home: number;
    away: number;
  };
  score: {
    halftime: {
      home: number;
      away: number;
    };
    fulltime: {
      home: number;
      away: number;
    };
    extratime: {
      home: number;
      away: number;
    };
    penalty: {
      home: number;
      away: number;
    };
  };
}

export interface LeaguesResponse {
  response: Competition[];
}

export interface FixturesResponse {
  response: Match[];
}

class FootballDataApiService {
  private baseUrl = 'https://v3.football.api-sports.io';
  private apiKey = '31a9963dc17461814f5a4d2933da8b9784e53bca30abee4ad1478e5c64b6f466';

  private async makeRequest<T>(endpoint: string): Promise<T> {
    console.log(`🌐 Making request to: ${this.baseUrl}${endpoint}`);
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'x-apisports-key': this.apiKey,
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
    const response = await this.makeRequest<LeaguesResponse>('/leagues');
    return response.response;
  }

  // Get matches for a specific league
  async getMatches(leagueId: number, season?: number): Promise<Match[]> {
    let endpoint = `/fixtures?league=${leagueId}`;
    
    if (season) {
      endpoint += `&season=${season}`;
    } else {
      endpoint += `&season=2024`; // Default to current season
    }

    const response = await this.makeRequest<FixturesResponse>(endpoint);
    return response.response;
  }

  // Get current round for league
  async getCurrentRound(leagueId: number, season: number = 2024): Promise<string> {
    try {
      const endpoint = `/fixtures/rounds?league=${leagueId}&season=${season}&current=true`;
      const response = await this.makeRequest<{ response: string[] }>(endpoint);
      return response.response[0] || 'Regular Season - 1';
    } catch (error) {
      console.log('Error getting current round, using default');
      return 'Regular Season - 1';
    }
  }

  // Get all rounds for a league
  async getRounds(leagueId: number, season: number = 2024): Promise<string[]> {
    try {
      const endpoint = `/fixtures/rounds?league=${leagueId}&season=${season}`;
      const response = await this.makeRequest<{ response: string[] }>(endpoint);
      return response.response;
    } catch (error) {
      console.log('Error getting rounds, using defaults');
      return ['Regular Season - 1', 'Regular Season - 2', 'Regular Season - 3'];
    }
  }

  // Get upcoming and live matches
  async getUpcomingMatches(): Promise<Match[]> {
    try {
      // Get today's matches and next 7 days
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const endpoint = `/fixtures?from=${today}&to=${nextWeek}`;
      const response = await this.makeRequest<FixturesResponse>(endpoint);
      
      // Return first 20 matches to avoid rate limits
      return response.response.slice(0, 20);
    } catch (error) {
      console.error('Error getting upcoming matches:', error);
      
      // Return demo data if API fails
      return this.getDemoMatches();
    }
  }

  // Get live matches
  async getLiveMatches(): Promise<Match[]> {
    try {
      const endpoint = '/fixtures?live=all';
      const response = await this.makeRequest<FixturesResponse>(endpoint);
      return response.response;
    } catch (error) {
      console.error('Error getting live matches:', error);
      return [];
    }
  }

  private getDemoMatches(): Match[] {
    return [
      {
        fixture: {
          id: 1,
          referee: 'Demo Referee',
          timezone: 'UTC',
          date: new Date().toISOString(),
          timestamp: Date.now() / 1000,
          periods: { first: 0, second: 0 },
          venue: { id: 1, name: 'Demo Stadium', city: 'Demo City' },
          status: { long: 'Not Started', short: 'NS', elapsed: 0 }
        },
        league: {
          id: 39,
          name: 'Premier League',
          country: 'England',
          logo: 'https://media.api-sports.io/football/leagues/39.png',
          flag: 'https://media.api-sports.io/flags/gb.svg',
          season: 2024,
          round: 'Regular Season - 1'
        },
        teams: {
          home: { id: 1, name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png' },
          away: { id: 2, name: 'Chelsea', logo: 'https://media.api-sports.io/football/teams/49.png' }
        },
        goals: { home: 0, away: 0 },
        score: {
          halftime: { home: 0, away: 0 },
          fulltime: { home: 0, away: 0 },
          extratime: { home: 0, away: 0 },
          penalty: { home: 0, away: 0 }
        }
      }
    ];
  }
}

export const footballDataApi = new FootballDataApiService();