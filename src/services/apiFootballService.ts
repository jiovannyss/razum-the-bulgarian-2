// API-Football.com API Service
// Documentation: https://www.api-football.com/documentation-v3

export interface APIFootballCompetition {
  league: {
    id: number;
    name: string;
    type: string;
    logo: string;
  };
  country: {
    name: string;
    code: string;
    flag: string;
  };
  seasons: {
    year: number;
    start: string;
    end: string;
    current: boolean;
  }[];
}

export interface APIFootballTeam {
  team: {
    id: number;
    name: string;
    code: string;
    country: string;
    founded: number;
    national: boolean;
    logo: string;
  };
  venue: {
    id: number;
    name: string;
    address: string;
    city: string;
    capacity: number;
    surface: string;
    image: string;
  };
}

export interface APIFootballFixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number | null;
      second: number | null;
    };
    venue: {
      id: number;
      name: string;
      city: string;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
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
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
    extratime: {
      home: number | null;
      away: number | null;
    };
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
}

export interface APIFootballResponse<T> {
  get: string;
  parameters: Record<string, any>;
  errors: string[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T;
}

class APIFootballService {
  private baseUrl = 'https://v3.football.api-sports.io';
  private apiKey = '20c16a03ae141a3191402dfe9260d519';

  private async makeRequest<T>(endpoint: string): Promise<APIFootballResponse<T>> {
    console.log(`🌐 Making API-Football request to: ${this.baseUrl}${endpoint}`);
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'x-apisports-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`❌ API-Football request failed: ${response.status} ${response.statusText}`);
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ API-Football response received:`, data);
    return data;
  }

  // Get available leagues/competitions
  async getLeagues(): Promise<APIFootballCompetition[]> {
    const response = await this.makeRequest<APIFootballCompetition[]>('/leagues');
    return response.response;
  }

  // Get teams from a specific league and season
  async getTeams(leagueId: number, season: number): Promise<APIFootballTeam[]> {
    const response = await this.makeRequest<APIFootballTeam[]>(`/teams?league=${leagueId}&season=${season}`);
    return response.response;
  }

  // Get fixtures for a specific league and season
  async getFixtures(leagueId: number, season: number, round?: string): Promise<APIFootballFixture[]> {
    let endpoint = `/fixtures?league=${leagueId}&season=${season}`;
    
    if (round) {
      endpoint += `&round=${encodeURIComponent(round)}`;
    }

    const response = await this.makeRequest<APIFootballFixture[]>(endpoint);
    return response.response;
  }

  // Get fixtures by date
  async getFixturesByDate(date: string): Promise<APIFootballFixture[]> {
    const response = await this.makeRequest<APIFootballFixture[]>(`/fixtures?date=${date}`);
    return response.response;
  }

  // Get live fixtures
  async getLiveFixtures(): Promise<APIFootballFixture[]> {
    const response = await this.makeRequest<APIFootballFixture[]>('/fixtures?live=all');
    return response.response;
  }

  // Get next fixtures
  async getNextFixtures(count: number = 50): Promise<APIFootballFixture[]> {
    const response = await this.makeRequest<APIFootballFixture[]>(`/fixtures?next=${count}`);
    return response.response;
  }

  // Get rounds for a specific league and season
  async getRounds(leagueId: number, season: number): Promise<string[]> {
    const response = await this.makeRequest<string[]>(`/fixtures/rounds?league=${leagueId}&season=${season}`);
    return response.response;
  }

  // Get head to head between two teams
  async getHeadToHead(team1Id: number, team2Id: number, last: number = 10): Promise<APIFootballFixture[]> {
    const response = await this.makeRequest<APIFootballFixture[]>(`/fixtures/headtohead?h2h=${team1Id}-${team2Id}&last=${last}`);
    return response.response;
  }

  // Test function to check Premier League data
  async testPremierLeague(): Promise<void> {
    try {
      console.log('🏴󠁧󠁢󠁥󠁮󠁧󠁿 Testing Premier League API...');
      
      // Get all leagues first
      const leagues = await this.getLeagues();
      console.log('🏆 Available leagues:', leagues.slice(0, 10).map(l => ({
        id: l.league.id,
        name: l.league.name,
        country: l.country.name
      })));
      
      // Find Premier League
      const premierLeague = leagues.find(l => 
        l.league.name.includes('Premier League') && l.country.name === 'England'
      );
      
      if (!premierLeague) {
        console.log('❌ Premier League not found');
        return;
      }
      
      console.log('🏴󠁧󠁢󠁥󠁮󠁧󠁿 Found Premier League:', premierLeague);
      
      // Get current season
      const currentSeason = premierLeague.seasons.find(s => s.current);
      if (!currentSeason) {
        console.log('❌ No current season found');
        return;
      }
      
      console.log('📅 Current season:', currentSeason.year);
      
      // Get next fixtures
      const nextFixtures = await this.getNextFixtures(10);
      const plFixtures = nextFixtures.filter(f => f.league.id === premierLeague.league.id);
      
      console.log('⚽ Next Premier League fixtures:');
      plFixtures.forEach(f => {
        console.log(`${f.teams.home.name} vs ${f.teams.away.name} - Round: ${f.league.round} - Date: ${f.fixture.date} - Status: ${f.fixture.status.short}`);
      });
      
    } catch (error) {
      console.error('❌ Premier League API Test failed:', error);
    }
  }

  // Test function to run a quick API check
  async quickTest(): Promise<void> {
    try {
      console.log('🧪 Starting API-Football Quick Test...');
      
      // Test 1: Get leagues
      console.log('📋 Test 1: Getting leagues...');
      const leagues = await this.getLeagues();
      console.log(`✅ Found ${leagues.length} leagues`);
      console.log('🏆 Top 5 leagues:', leagues.slice(0, 5).map(l => ({
        id: l.league.id,
        name: l.league.name,
        country: l.country.name,
        type: l.league.type
      })));
      
      // Test 2: Get live fixtures
      console.log('\n📺 Test 2: Getting live fixtures...');
      const liveFixtures = await this.getLiveFixtures();
      console.log(`✅ Found ${liveFixtures.length} live fixtures`);
      
      if (liveFixtures.length > 0) {
        console.log('🔴 Live matches:');
        liveFixtures.slice(0, 3).forEach(f => {
          console.log(`${f.teams.home.name} ${f.goals.home || 0} - ${f.goals.away || 0} ${f.teams.away.name} (${f.fixture.status.short})`);
        });
      }
      
      // Test 3: Get next fixtures
      console.log('\n⏭️ Test 3: Getting next fixtures...');
      const nextFixtures = await this.getNextFixtures(5);
      console.log(`✅ Found ${nextFixtures.length} upcoming fixtures`);
      
      if (nextFixtures.length > 0) {
        console.log('📅 Upcoming matches:');
        nextFixtures.forEach(f => {
          const date = new Date(f.fixture.date).toLocaleDateString();
          console.log(`${f.teams.home.name} vs ${f.teams.away.name} - ${date} (${f.league.name})`);
        });
      }
      
      console.log('\n🎉 API-Football Quick Test completed successfully!');
      
    } catch (error) {
      console.error('❌ API-Football Quick Test failed:', error);
    }
  }
}

export const apiFootballService = new APIFootballService();