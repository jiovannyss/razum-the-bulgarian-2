const API_BASE_URL = 'https://apiv3.apifootball.com';
const API_KEY = '31a9963dc17461814f5a4d2933da8b9784e53bca30abee4ad1478e5c64b6f466';

export interface Country {
  country_id: string;
  country_name: string;
  country_logo: string;
}

export interface League {
  league_id: string;
  league_name: string;
  country_id: string;
  country_name: string;
  league_logo: string;
  country_logo: string;
}

export interface Match {
  match_id: string;
  country_id: string;
  country_name: string;
  league_id: string;
  league_name: string;
  match_date: string;
  match_status: string;
  match_time: string;
  match_hometeam_name: string;
  match_awayteam_name: string;
  match_hometeam_score: string;
  match_awayteam_score: string;
  match_hometeam_halftime_score: string;
  match_awayteam_halftime_score: string;
  match_live: string;
  match_round: string;
  match_stadium: string;
  match_referee: string;
  team_home_badge: string;
  team_away_badge: string;
  league_logo: string;
  country_logo: string;
}

export interface Standing {
  country_name: string;
  league_id: string;
  league_name: string;
  team_id: string;
  team_name: string;
  overall_league_position: string;
  overall_league_payed: string;
  overall_league_W: string;
  overall_league_D: string;
  overall_league_L: string;
  overall_league_GF: string;
  overall_league_GA: string;
  overall_league_PTS: string;
  team_badge: string;
}

class FootballApiService {
  private async makeRequest(action: string, params: Record<string, string> = {}): Promise<any> {
    const url = new URL(API_BASE_URL);
    url.searchParams.set('action', action);
    url.searchParams.set('APIkey', API_KEY);
    
    // Add additional parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Handle API error responses
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Ensure we always return an array for consistency
      if (!Array.isArray(data)) {
        console.warn('API returned non-array response:', data);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getCountries(): Promise<Country[]> {
    return this.makeRequest('get_countries');
  }

  async getLeagues(countryId?: string): Promise<League[]> {
    const params = countryId ? { country_id: countryId } : {};
    return this.makeRequest('get_leagues', params);
  }

  async getMatches(
    from: string, 
    to: string, 
    leagueId?: string, 
    matchId?: string
  ): Promise<Match[]> {
    const params: Record<string, string> = {
      from,
      to
    };
    
    if (leagueId) params.league_id = leagueId;
    if (matchId) params.match_id = matchId;
    
    return this.makeRequest('get_events', params);
  }

  async getLiveMatches(): Promise<Match[]> {
    return this.makeRequest('get_events', { 
      from: this.getTodayDate(),
      to: this.getTodayDate(),
      live: 'true'
    });
  }

  async getStandings(leagueId: string): Promise<Standing[]> {
    return this.makeRequest('get_standings', { league_id: leagueId });
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  getYesterdayDate(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }
}

export const footballApi = new FootballApiService();