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
  venue?: string;
}

export interface Standing {
  position: number;
  team: Team;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form: string;
}

export interface StandingsResponse {
  standings: {
    table: Standing[];
  }[];
}

export interface MatchInfo {
  venue?: string;
  capacity?: string;
  homePosition?: number;
  awayPosition?: number;
  homeForm?: string[];
  awayForm?: string[];
  headToHead?: {
    date: string;
    competition: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
  }[];
  standings?: Standing[];
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
  private lastRequestTime = 0;
  private minRequestInterval = 6000; // 6 seconds between requests (10 requests per minute max)

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  private async makeRequest<T>(endpoint: string, retryCount = 0): Promise<T> {
    await this.waitForRateLimit();
    
    console.log(`🌐 Making request to: ${this.baseUrl}${endpoint}`);
    
    // Use CORS proxy to bypass CORS restrictions
    const url = `${this.corsProxy}${encodeURIComponent(this.baseUrl + endpoint)}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'X-Auth-Token': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 429) {
        // Rate limit hit
        const retryAfter = response.headers.get('retry-after');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000; // Default to 1 minute
        
        console.log(`🚫 Rate limit hit (429). Retry after: ${waitTime}ms`);
        
        if (retryCount < 2) { // Max 2 retries
          console.log(`⏳ Waiting ${waitTime}ms before retry ${retryCount + 1}/2`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return this.makeRequest<T>(endpoint, retryCount + 1);
        } else {
          throw new Error('RATE_LIMIT_EXCEEDED');
        }
      }

      if (!response.ok) {
        console.error(`❌ API request failed: ${response.status} ${response.statusText}`);
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API response received:`, data);
      return data;
    } catch (error) {
      if (retryCount < 1 && error instanceof Error && error.message.includes('fetch')) {
        console.log(`🔄 Network error, retrying... (${retryCount + 1}/1)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.makeRequest<T>(endpoint, retryCount + 1);
      }
      throw error;
    }
  }

  // Get available competitions (free tier only)
  async getCompetitions(): Promise<Competition[]> {
    const response = await this.makeRequest<CompetitionsResponse>('/competitions');
    // Filter only free tier competitions
    return response.competitions.filter(comp => comp.plan === 'TIER_ONE' || comp.plan === 'TIER_FOUR');
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
      
      // Get matches only from first 2 competitions to stay under rate limit
      for (const competition of competitions.slice(0, 2)) {
        try {
          console.log(`🎯 Getting matches for: ${competition.name}`);
          
          // Get current matchday first
          const currentMatchday = await this.getCurrentMatchday(competition.id);
          console.log(`📅 Current matchday for ${competition.name}: ${currentMatchday}`);
          
          // Only fetch current matchday to minimize API calls
          const matchdaysToFetch = [currentMatchday];
          
          for (const matchday of matchdaysToFetch) {
            try {
              const matches = await this.getMatches(competition.id, matchday);
              if (matches && matches.length > 0) {
                allMatches.push(...matches);
                console.log(`✅ Added ${matches.length} matches from ${competition.name} GW${matchday}`);
              }
              
              // Add longer delay to avoid hitting rate limits
              await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
              console.log(`❌ Error getting GW${matchday} for ${competition.name}:`, error);
              // Don't throw, just skip this matchday
            }
          }
        } catch (error) {
          console.log(`❌ Error getting matches for ${competition.name}:`, error);
          // Don't throw, just skip this competition
        }
      }
      
      console.log(`📊 Total matches collected: ${allMatches.length}`);
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

  // Get match details including venue information
  async getMatchDetails(matchId: number): Promise<Match | null> {
    try {
      const response = await this.makeRequest<Match>(`/matches/${matchId}`);
      return response;
    } catch (error) {
      console.error('Error getting match details:', error);
      return null;
    }
  }

  // Get standings for a competition
  async getStandings(competitionId: number): Promise<Standing[]> {
    try {
      const response = await this.makeRequest<StandingsResponse>(`/competitions/${competitionId}/standings`);
      return response.standings[0]?.table || [];
    } catch (error) {
      console.error('Error getting standings:', error);
      return [];
    }
  }

  // Get head-to-head matches between two teams
  async getHeadToHead(team1Id: number, team2Id: number, limit: number = 5): Promise<Match[]> {
    try {
      const response = await this.makeRequest<MatchesResponse>(`/teams/${team1Id}/matches?limit=${limit * 2}`);
      // Filter matches where both teams played against each other
      return response.matches.filter(match => 
        (match.homeTeam.id === team1Id && match.awayTeam.id === team2Id) ||
        (match.homeTeam.id === team2Id && match.awayTeam.id === team1Id)
      ).slice(0, limit);
    } catch (error) {
      console.error('Error getting head-to-head:', error);
      return [];
    }
  }

  // Get comprehensive match information
  async getMatchInfo(match: Match): Promise<MatchInfo> {
    const info: MatchInfo = {
      venue: "Stadium TBD",
      capacity: "N/A"
    };

    try {
      // First try to get venue from match details
      const matchDetails = await this.getMatchDetails(match.id);
      if (matchDetails) {
        console.log('Raw match details:', matchDetails);
        info.venue = matchDetails.venue || `${match.homeTeam.name} Stadium` || "Stadium TBD";
        
        // Try to get capacity from venue info
        if (matchDetails.venue && matchDetails.venue !== "Stadium TBD") {
          // Mock capacity data based on team - in real app this would come from API
          const capacityMap: { [key: string]: string } = {
            'Mirassol FC Stadium': '15,000',
            'Arena Castelão': '63,903',
            'Maracanã': '78,838',
            'Neo Química Arena': '49,205',
            'Allianz Parque': '43,713',
            'Morumbi': '67,052',
            'Mineirão': '62,547',
            'Arena do Grêmio': '55,662'
          };
          info.capacity = capacityMap[matchDetails.venue] || "N/A";
        }
        
        console.log('Extracted venue info:', { venue: info.venue, capacity: info.capacity });
      }
      // Get standings to find team positions and form
      const standings = await this.getStandings(match.competition.id);
      info.standings = standings;

      if (standings.length > 0) {
        console.log('Looking for teams in standings:', {
          homeTeam: { id: match.homeTeam.id, name: match.homeTeam.name },
          awayTeam: { id: match.awayTeam.id, name: match.awayTeam.name }
        });

        const homeTeamStanding = standings.find(s => {
          const nameMatch = s.team.name === match.homeTeam.name || 
                          s.team.shortName === match.homeTeam.name ||
                          s.team.name === match.homeTeam.shortName ||
                          s.team.shortName === match.homeTeam.shortName;
          const idMatch = s.team.id === match.homeTeam.id;
          return nameMatch || idMatch;
        });
        
        const awayTeamStanding = standings.find(s => {
          const nameMatch = s.team.name === match.awayTeam.name || 
                          s.team.shortName === match.awayTeam.name ||
                          s.team.name === match.awayTeam.shortName ||
                          s.team.shortName === match.awayTeam.shortName;
          const idMatch = s.team.id === match.awayTeam.id;
          return nameMatch || idMatch;
        });

        console.log('Found team standings:', {
          homeTeamStanding: homeTeamStanding ? { position: homeTeamStanding.position, name: homeTeamStanding.team.name } : null,
          awayTeamStanding: awayTeamStanding ? { position: awayTeamStanding.position, name: awayTeamStanding.team.name } : null
        });

        info.homePosition = homeTeamStanding?.position;
        info.awayPosition = awayTeamStanding?.position;

        // Extract form from standings
        if (homeTeamStanding?.form) {
          info.homeForm = homeTeamStanding.form.split('').slice(-5);
        }
        if (awayTeamStanding?.form) {
          info.awayForm = awayTeamStanding.form.split('').slice(-5);
        }
      }

      // Get head-to-head matches (limited API calls)
      const h2h = await this.getHeadToHead(match.homeTeam.id, match.awayTeam.id, 5);
      info.headToHead = h2h.map(m => ({
        date: new Date(m.utcDate).toLocaleDateString('en-GB'),
        competition: m.competition.name.slice(0, 3).toUpperCase(),
        homeTeam: m.homeTeam.name,
        awayTeam: m.awayTeam.name,
        homeScore: m.score.fullTime.home || 0,
        awayScore: m.score.fullTime.away || 0
      }));

    } catch (error) {
      console.error('Error getting comprehensive match info:', error);
    }

    return info;
  }
}

export const footballDataApi = new FootballDataApiService();