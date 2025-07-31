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
    return response.competitions.filter(comp => comp.plan === 'TIER_FOUR');
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

  // Get current matchday for competition with smart logic
  async getCurrentMatchday(competitionId: number): Promise<number> {
    try {
      const competitions = await this.getCompetitions();
      const competition = competitions.find(c => c.id === competitionId);
      const officialCurrentMatchday = competition?.currentSeason.currentMatchday || 1;
      
      // Get smart matchday based on match times
      const smartMatchday = await this.getSmartCurrentMatchday(competitionId, officialCurrentMatchday);
      return smartMatchday;
    } catch (error) {
      console.log('Error getting current matchday, using default');
      return 18; // Default to matchday 18
    }
  }

  // Smart logic to determine which matchday to show based on match times
  async getSmartCurrentMatchday(competitionId: number, officialCurrentMatchday: number): Promise<number> {
    try {
      console.log(`🧠 Getting smart matchday for competition ${competitionId}, official: ${officialCurrentMatchday}`);
      
      const now = new Date();
      
      // Get matches from current matchday
      const currentMatches = await this.getMatches(competitionId, officialCurrentMatchday);
      
      if (!currentMatches || currentMatches.length === 0) {
        console.log('📅 No matches in current matchday, using official');
        return officialCurrentMatchday;
      }
      
      // Find the last match from current matchday
      const currentMatchdayDates = currentMatches.map(m => new Date(m.utcDate));
      const lastMatchOfCurrentRound = new Date(Math.max(...currentMatchdayDates.map(d => d.getTime())));
      
      console.log(`📅 Last match of GW${officialCurrentMatchday}: ${lastMatchOfCurrentRound.toISOString()}`);
      
      // Check if 24 hours have passed since the last match of current round
      const hoursSinceLastMatch = (now.getTime() - lastMatchOfCurrentRound.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastMatch >= 24) {
        console.log(`📅 24+ hours since last match (${hoursSinceLastMatch.toFixed(1)}h), loading next round`);
        return officialCurrentMatchday + 1;
      }
      
      // Get matches from next matchday to check gap
      const nextMatches = await this.getMatches(competitionId, officialCurrentMatchday + 1);
      
      if (!nextMatches || nextMatches.length === 0) {
        console.log('📅 No matches in next matchday, staying with current');
        return officialCurrentMatchday;
      }
      
      // Find the first match from next matchday
      const nextMatchdayDates = nextMatches.map(m => new Date(m.utcDate));
      const firstMatchOfNextRound = new Date(Math.min(...nextMatchdayDates.map(d => d.getTime())));
      
      console.log(`📅 First match of GW${officialCurrentMatchday + 1}: ${firstMatchOfNextRound.toISOString()}`);
      
      // Check the gap between last match of current round and first match of next round
      const gapBetweenRounds = (firstMatchOfNextRound.getTime() - lastMatchOfCurrentRound.getTime()) / (1000 * 60 * 60);
      
      if (gapBetweenRounds < 24) {
        // If gap is less than 24 hours, check if 8 hours have passed since the last match started
        const hoursSinceLastMatchStarted = (now.getTime() - lastMatchOfCurrentRound.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastMatchStarted >= 8) {
          console.log(`📅 Gap between rounds is ${gapBetweenRounds.toFixed(1)}h, 8+ hours since last match (${hoursSinceLastMatchStarted.toFixed(1)}h), loading next round`);
          return officialCurrentMatchday + 1;
        } else {
          console.log(`📅 Gap between rounds is ${gapBetweenRounds.toFixed(1)}h, but only ${hoursSinceLastMatchStarted.toFixed(1)}h since last match, staying with current`);
          return officialCurrentMatchday;
        }
      }
      
      console.log(`📅 Using current matchday ${officialCurrentMatchday}`);
      return officialCurrentMatchday;
      
    } catch (error) {
      console.log('Error in smart matchday calculation, using official:', error);
      return officialCurrentMatchday;
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
          
          // Get current matchday first
          const currentMatchday = await this.getCurrentMatchday(competition.id);
          console.log(`📅 Current matchday for ${competition.name}: ${currentMatchday}`);
          
          // Only fetch current matchday and next few matchdays to avoid rate limits
          const matchdaysToFetch = [currentMatchday, currentMatchday + 1, currentMatchday + 2];
          
          for (const matchday of matchdaysToFetch) {
            try {
              const matches = await this.getMatches(competition.id, matchday);
              if (matches && matches.length > 0) {
                allMatches.push(...matches);
                console.log(`✅ Added ${matches.length} matches from ${competition.name} GW${matchday}`);
              }
              
              // Add delay to avoid hitting rate limits
              await new Promise(resolve => setTimeout(resolve, 300));
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

  // Test function to check Brazilian league matches for round 21
  async testBrazilianLeague21(): Promise<void> {
    try {
      console.log('🇧🇷 Testing Brazilian League API for Round 21...');
      
      // Get all competitions first
      const competitions = await this.getCompetitions();
      console.log('🏆 Available competitions:', competitions.map(c => ({
        id: c.id,
        name: c.name,
        code: c.code,
        plan: c.plan
      })));
      
      // Find Brazilian championship
      const brasileirao = competitions.find(c => 
        c.name.includes('Brasileiro') || c.code === 'BSA' || c.name.includes('Brazil')
      );
      
      if (!brasileirao) {
        console.log('❌ Brazilian championship not found in free competitions');
        console.log('🔍 Available competitions:', competitions.map(c => c.name));
        return;
      }
      
      console.log('🇧🇷 Found Brazilian championship:', brasileirao);
      
      // Get matches for round 21
      const matches = await this.getMatches(brasileirao.id, 21);
      console.log('⚽ Matches from Round 21:');
      matches.forEach(m => {
        console.log(`${m.homeTeam.name} vs ${m.awayTeam.name} - Matchday: ${m.matchday} - Date: ${m.utcDate} - Status: ${m.status}`);
      });
      
      return;
      
    } catch (error) {
      console.error('❌ Brazilian League API Test failed:', error);
    }
  }
}

export const footballDataApi = new FootballDataApiService();