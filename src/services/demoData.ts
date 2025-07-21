// Demo Football Data - temporary solution for CORS issues
export const demoCompetitions = [
  {
    id: 2021,
    area: { id: 2072, name: "England", code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    name: "Premier League",
    code: "PL",
    plan: "TIER_ONE",
    currentSeason: {
      id: 1564,
      startDate: "2024-08-16",
      endDate: "2025-05-25",
      currentMatchday: 18
    }
  },
  {
    id: 2014,
    area: { id: 2224, name: "Spain", code: "ESP", flag: "🇪🇸" },
    name: "La Liga",
    code: "PD",
    plan: "TIER_ONE",
    currentSeason: {
      id: 1565,
      startDate: "2024-08-18",
      endDate: "2025-05-25",
      currentMatchday: 17
    }
  },
  {
    id: 2019,
    area: { id: 2114, name: "Italy", code: "ITA", flag: "🇮🇹" },
    name: "Serie A",
    code: "SA",
    plan: "TIER_ONE",
    currentSeason: {
      id: 1566,
      startDate: "2024-08-17",
      endDate: "2025-05-25",
      currentMatchday: 16
    }
  }
];

export const demoMatches = [
  // Premier League Matchday 18
  {
    id: 327253,
    competition: { id: 2021, name: "Premier League" },
    season: { id: 1564 },
    utcDate: "2025-01-27T17:30:00Z",
    status: "SCHEDULED",
    matchday: 18,
    homeTeam: {
      id: 57,
      name: "Arsenal",
      shortName: "Arsenal",
      tla: "ARS",
      crest: "https://crests.football-data.org/57.png"
    },
    awayTeam: {
      id: 65,
      name: "Manchester City",
      shortName: "Man City",
      tla: "MCI",
      crest: "https://crests.football-data.org/65.png"
    },
    score: {
      fullTime: { home: null, away: null },
      halfTime: { home: null, away: null }
    }
  },
  {
    id: 327254,
    competition: { id: 2021, name: "Premier League" },
    season: { id: 1564 },
    utcDate: "2025-01-27T20:00:00Z",
    status: "SCHEDULED",
    matchday: 18,
    homeTeam: {
      id: 61,
      name: "Chelsea",
      shortName: "Chelsea",
      tla: "CHE",
      crest: "https://crests.football-data.org/61.png"
    },
    awayTeam: {
      id: 66,
      name: "Manchester United",
      shortName: "Man United",
      tla: "MUN",
      crest: "https://crests.football-data.org/66.png"
    },
    score: {
      fullTime: { home: null, away: null },
      halfTime: { home: null, away: null }
    }
  },
  {
    id: 327255,
    competition: { id: 2021, name: "Premier League" },
    season: { id: 1564 },
    utcDate: "2025-01-28T19:45:00Z",
    status: "SCHEDULED",
    matchday: 18,
    homeTeam: {
      id: 64,
      name: "Liverpool",
      shortName: "Liverpool",
      tla: "LIV",
      crest: "https://crests.football-data.org/64.png"
    },
    awayTeam: {
      id: 73,
      name: "Tottenham Hotspur",
      shortName: "Spurs",
      tla: "TOT",
      crest: "https://crests.football-data.org/73.png"
    },
    score: {
      fullTime: { home: null, away: null },
      halfTime: { home: null, away: null }
    }
  },
  // La Liga Matchday 17
  {
    id: 327300,
    competition: { id: 2014, name: "La Liga" },
    season: { id: 1565 },
    utcDate: "2025-01-27T16:15:00Z",
    status: "SCHEDULED",
    matchday: 17,
    homeTeam: {
      id: 81,
      name: "FC Barcelona",
      shortName: "Barcelona",
      tla: "FCB",
      crest: "https://crests.football-data.org/81.png"
    },
    awayTeam: {
      id: 86,
      name: "Real Madrid CF",
      shortName: "Real Madrid",
      tla: "RMA",
      crest: "https://crests.football-data.org/86.png"
    },
    score: {
      fullTime: { home: null, away: null },
      halfTime: { home: null, away: null }
    }
  },
  {
    id: 327301,
    competition: { id: 2014, name: "La Liga" },
    season: { id: 1565 },
    utcDate: "2025-01-27T18:30:00Z",
    status: "SCHEDULED",
    matchday: 17,
    homeTeam: {
      id: 78,
      name: "Atlético Madrid",
      shortName: "Atlético",
      tla: "ATM",
      crest: "https://crests.football-data.org/78.png"
    },
    awayTeam: {
      id: 90,
      name: "Real Betis",
      shortName: "Betis",
      tla: "BET",
      crest: "https://crests.football-data.org/90.png"
    },
    score: {
      fullTime: { home: null, away: null },
      halfTime: { home: null, away: null }
    }
  },
  // Serie A Matchday 16
  {
    id: 327400,
    competition: { id: 2019, name: "Serie A" },
    season: { id: 1566 },
    utcDate: "2025-01-27T17:00:00Z",
    status: "SCHEDULED",
    matchday: 16,
    homeTeam: {
      id: 98,
      name: "AC Milan",
      shortName: "Milan",
      tla: "MIL",
      crest: "https://crests.football-data.org/98.png"
    },
    awayTeam: {
      id: 109,
      name: "Juventus FC",
      shortName: "Juventus",
      tla: "JUV",
      crest: "https://crests.football-data.org/109.png"
    },
    score: {
      fullTime: { home: null, away: null },
      halfTime: { home: null, away: null }
    }
  },
  {
    id: 327401,
    competition: { id: 2019, name: "Serie A" },
    season: { id: 1566 },
    utcDate: "2025-01-27T19:45:00Z",
    status: "SCHEDULED",
    matchday: 16,
    homeTeam: {
      id: 113,
      name: "SSC Napoli",
      shortName: "Napoli",
      tla: "NAP",
      crest: "https://crests.football-data.org/113.png"
    },
    awayTeam: {
      id: 108,
      name: "Inter",
      shortName: "Inter",
      tla: "INT",
      crest: "https://crests.football-data.org/108.png"
    },
    score: {
      fullTime: { home: null, away: null },
      halfTime: { home: null, away: null }
    }
  }
];

export const getAllDemoMatches = () => demoMatches;
export const getDemoMatchesByCompetition = (competitionId: number) => 
  demoMatches.filter(match => match.competition.id === competitionId);
export const getDemoMatchesByMatchday = (competitionId: number, matchday: number) =>
  demoMatches.filter(match => match.competition.id === competitionId && match.matchday === matchday);