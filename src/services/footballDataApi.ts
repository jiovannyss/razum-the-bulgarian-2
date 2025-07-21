// Football-Data.org API Service
// Documentation: https://www.football-data.org/documentation/api
import { demoCompetitions, getAllDemoMatches, getDemoMatchesByCompetition, getDemoMatchesByMatchday } from './demoData';

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
  private apiKeyStorageKey = 'football_data_api_key';

  private getApiKey(): string | null {
    // Use provided API key as default
    const providedKey = '4c0b967130864749a36fb552c0755910';
    return localStorage.getItem(this.apiKeyStorageKey) || providedKey;
  }

  public setApiKey(apiKey: string): void {
    localStorage.setItem(this.apiKeyStorageKey, apiKey);
  }

  public hasApiKey(): boolean {
    return !!this.getApiKey();
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('API key not set. Please set your Football-Data.org API key first.');
    }

    console.log(`🌐 Making request to: ${this.baseUrl}${endpoint}`);
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'X-Auth-Token': apiKey,
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

  // Get available competitions (with demo fallback for CORS issues)
  async getCompetitions(): Promise<Competition[]> {
    try {
      const response = await this.makeRequest<CompetitionsResponse>('/competitions');
      return response.competitions.filter(comp => comp.plan === 'TIER_ONE');
    } catch (error) {
      console.log('🔄 Using demo data due to CORS restrictions');
      return demoCompetitions;
    }
  }

  // Get matches for a specific competition (with demo fallback)
  async getMatches(competitionId: number, matchday?: number): Promise<Match[]> {
    try {
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
    } catch (error) {
      console.log('🔄 Using demo matches due to CORS restrictions');
      if (matchday) {
        return getDemoMatchesByMatchday(competitionId, matchday);
      }
      return getDemoMatchesByCompetition(competitionId);
    }
  }

  // Get current matchday for competition (with demo fallback)
  async getCurrentMatchday(competitionId: number): Promise<number> {
    try {
      const competitions = await this.getCompetitions();
      const competition = competitions.find(c => c.id === competitionId);
      return competition?.currentSeason.currentMatchday || 1;
    } catch (error) {
      // Use demo data matchday
      const demoComp = demoCompetitions.find(c => c.id === competitionId);
      return demoComp?.currentSeason.currentMatchday || 18;
    }
  }

  // Get all matchdays for a competition (with demo fallback)
  async getMatchdays(competitionId: number): Promise<number[]> {
    try {
      const allMatches = await this.getMatches(competitionId);
      const matchdays = [...new Set(allMatches.map(m => m.matchday))].sort((a, b) => a - b);
      return matchdays;
    } catch (error) {
      // Return demo matchdays
      return [16, 17, 18, 19, 20];
    }
  }
}

export const footballDataApi = new FootballDataApiService();