// APIfootball.com service - restored and improved
const API_BASE_URL = 'https://apiv3.apifootball.com/';
const API_KEY = '31a9963dc17461814f5a4d2933da8b9784e53bca30abee4ad1478e5c64b6f466';

export interface League {
  country_id: string;
  country_name: string;
  league_id: string;
  league_name: string;
  league_season: string;
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
  match_hometeam_id: string;
  match_hometeam_name: string;
  match_hometeam_score: string;
  match_awayteam_name: string;
  match_awayteam_id: string;
  match_awayteam_score: string;
  match_hometeam_halftime_score: string;
  match_awayteam_halftime_score: string;
  match_hometeam_ft_score: string;
  match_awayteam_ft_score: string;
  match_live: string;
  match_round: string;
  match_stadium: string;
  team_home_badge: string;
  team_away_badge: string;
  league_logo: string;
  country_logo: string;
  league_year: string;
  stage_name: string;
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

    console.log(`🌐 Making request to: ${url.toString()}`);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error(`❌ API request failed: ${response.status} ${response.statusText}`);
      throw new Error(`${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ API response received:`, data);
    return data;
  }

  async getLeagues(): Promise<League[]> {
    return await this.makeRequest('get_leagues');
  }

  async getMatches(from: string, to: string, leagueId?: string): Promise<Match[]> {
    const params: Record<string, string> = {
      from,
      to
    };
    
    if (leagueId) {
      params.league_id = leagueId;
    }

    return await this.makeRequest('get_events', params);
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getYesterdayDate(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  // Get a date range that covers upcoming matches
  getUpcomingDateRange(): { from: string; to: string } {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    
    return {
      from: today.toISOString().split('T')[0],
      to: nextMonth.toISOString().split('T')[0]
    };
  }

  // Get matches for current and upcoming weeks
  async getUpcomingMatches(leagueId?: string): Promise<Match[]> {
    const { from, to } = this.getUpcomingDateRange();
    console.log(`📅 Getting upcoming matches from ${from} to ${to}`);
    
    try {
      return await this.getMatches(from, to, leagueId);
    } catch (error) {
      console.log(`❌ Failed to get upcoming matches, trying broader range`);
      // Fallback to a broader range
      const broader = new Date();
      broader.setDate(broader.getDate() - 7); // Start from 1 week ago
      const broaderEnd = new Date();
      broaderEnd.setDate(broaderEnd.getDate() + 14); // Go 2 weeks ahead
      
      return await this.getMatches(
        broader.toISOString().split('T')[0],
        broaderEnd.toISOString().split('T')[0],
        leagueId
      );
    }
  }
}

export const footballApi = new FootballApiService();