import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApiCompetition {
  id: number;
  name: string;
  code: string;
  type: string; // НОВO: LEAGUE, CUP, etc.
  area: {
    name: string;
    code: string;
  };
  emblem: string;
  currentSeason?: {
    currentMatchday: number;
  };
  plan: string;
}

interface ApiTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  address?: string;
  website?: string;
  founded?: number;
  clubColors?: string;
  venue?: string;
  coach?: { // НОВО
    name: string;
    nationality: string;
  };
  leagueRank?: number; // НОВО
}

interface ApiStanding {
  position: number;
  team: ApiTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form?: string;
}

interface ApiMatch {
  id: number;
  competition: {
    id: number;
  };
  season?: {
    id: number;
  };
  matchday: number;
  stage: string;
  group?: string;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
  utcDate: string;
  status: string;
  minute?: number; // НОВО
  injuryTime?: number; // НОВО
  attendance?: number; // НОВО
  score: {
    winner?: string;
    duration?: string;
    fullTime: {
      home?: number;
      away?: number;
    };
  };
  venue?: string;
  referees?: Array<{ name: string; }>;
}

serve(async (req) => {
  console.log('🚀 Football Data Sync function started');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Инициализиране на Supabase клиент
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const footballApiKey = Deno.env.get('FOOTBALL_API_KEY');

    if (!footballApiKey) {
      throw new Error('FOOTBALL_API_KEY не е конфигуриран');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Парсиране на заявката
    const { syncType = 'all', competitionIds } = await req.json().catch(() => ({}));

    console.log(`📊 Започва синхронизация тип: ${syncType}`);

    // Създаване на sync log запис
    const { data: syncLog, error: syncLogError } = await supabase
      .from('sync_logs')
      .insert({
        sync_type: syncType,
        status: 'running'
      })
      .select()
      .single();

    if (syncLogError) {
      console.error('❌ Грешка при създаване на sync log:', syncLogError);
      throw syncLogError;
    }

    let syncLogId = syncLog.id;
    let totalProcessed = 0;

    // Helper функция за API заявки с увеличен rate limiting
    let lastRequestTime = 0;
    const RATE_LIMIT_DELAY = 7000; // 7 секунди между заявки (безплатен план = 10/минута)
    
    const makeApiRequest = async (endpoint: string) => {
      // Rate limiting - чакаме между заявките
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
        const waitTime = RATE_LIMIT_DELAY - timeSinceLastRequest;
        console.log(`⏳ Чакаме ${waitTime}ms преди следваща заявка...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      console.log(`🌐 API заявка: ${endpoint}`);
      const response = await fetch(`https://api.football-data.org/v4${endpoint}`, {
        headers: {
          'X-Auth-Token': footballApiKey
        }
      });

      lastRequestTime = Date.now();

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit hit - чакаме повече и пробваме отново
          console.log('🚫 Rate limit достигнат, чакаме 60 секунди...');
          await new Promise(resolve => setTimeout(resolve, 60000));
          return makeApiRequest(endpoint); // Опитваме отново
        }
        throw new Error(`API грешка ${response.status}: ${response.statusText}`);
      }

      return response.json();
    };

    // Синхронизация на турнири
    const syncCompetitions = async () => {
      console.log('🏆 Синхронизиране на турнири...');
      const data = await makeApiRequest('/competitions');
      const competitions: ApiCompetition[] = data.competitions;
      console.log(`🔍 Общо ${competitions.length} турнира от API:`, competitions.map(c => `${c.name} (${c.code}) - ${c.plan}`));

      for (const comp of competitions) {
        await supabase
          .from('cached_competitions')
          .upsert({
            id: comp.id,
            name: comp.name,
            code: comp.code,
            type: comp.type, // НОВО
            area_name: comp.area.name,
            area_code: comp.area.code,
            emblem_url: comp.emblem,
            current_matchday: comp.currentSeason?.currentMatchday || null,
            plan: comp.plan,
            last_updated: new Date().toISOString()
          });
        totalProcessed++;
      }

      console.log(`✅ Синхронизирани ${competitions.length} турнира`);
      return competitions.map(c => c.id);
    };

    // Синхронизация на отбори за даден турнир
    const syncTeamsForCompetition = async (competitionId: number) => {
      console.log(`👥 Синхронизиране на отбори за турнир ${competitionId}...`);
      try {
        const data = await makeApiRequest(`/competitions/${competitionId}/teams`);
        const teams: ApiTeam[] = data.teams || [];

        for (const team of teams) {
          await supabase
            .from('cached_teams')
            .upsert({
              id: team.id,
              name: team.name,
              short_name: team.shortName,
              tla: team.tla,
              crest_url: team.crest,
              address: team.address,
              website: team.website,
              founded: team.founded,
              club_colors: team.clubColors,
              venue: team.venue,
              coach_name: team.coach?.name, // НОВО
              coach_nationality: team.coach?.nationality, // НОВО
              league_rank: team.leagueRank, // НОВО
              last_updated: new Date().toISOString()
            });
          totalProcessed++;
        }

        console.log(`✅ Синхронизирани ${teams.length} отбора за турнир ${competitionId}`);
      } catch (error) {
        console.warn(`⚠️ Не можах да синхронизирам отборите за турнир ${competitionId}:`, error);
      }
    };

    // Helper функция за изчисляване на форма от последни мачове
    const calculateTeamForm = async (teamId: number, limit: number = 5): Promise<string> => {
      try {
        console.log(`🔍 Изчисляване на форма за отбор ${teamId}...`);
        const matchesData = await makeApiRequest(`/teams/${teamId}/matches?limit=${limit}&status=FINISHED`);
        
        if (!matchesData.matches || matchesData.matches.length === 0) {
          console.log(`⚠️ Няма мачове за отбор ${teamId}`);
          return '';
        }

        const form = [];
        
        for (const match of matchesData.matches.slice(0, limit)) {
          const isHome = match.homeTeam.id === teamId;
          
          let result;
          if (match.score.winner === 'DRAW') {
            result = 'D';
          } else if (
            (isHome && match.score.winner === 'HOME_TEAM') ||
            (!isHome && match.score.winner === 'AWAY_TEAM')
          ) {
            result = 'W';
          } else {
            result = 'L';
          }
          
          form.push(result);
        }
        
        const formString = form.join('');
        console.log(`✅ Отбор ${teamId}: форма = "${formString}"`);
        return formString;
      } catch (error) {
        console.error(`❌ Грешка при изчисляване на форма за отбор ${teamId}:`, error);
        return '';
      }
    };

    // Синхронизация на класирания за даден турнир
    const syncStandingsForCompetition = async (competitionId: number) => {
      console.log(`📊 Синхронизиране на класирания за турнир ${competitionId}...`);
      try {
        const data = await makeApiRequest(`/competitions/${competitionId}/standings`);
        
        console.log(`🔍 Debug: За турнир ${competitionId} получихме ${data.standings?.length || 0} standings tables`);
        
        // Логваме всички standings types
        if (data.standings) {
          data.standings.forEach((standing: any, index: number) => {
            console.log(`  Table ${index}: type="${standing.type}", stage="${standing.stage}", entries=${standing.table?.length || 0}`);
          });
        }
        
        // Търсим TOTAL standings table (не HOME/AWAY), защото само там има form данни
        const totalStanding = data.standings?.find((s: any) => 
          s.type === 'TOTAL' || !s.type || s.stage === 'REGULAR_SEASON'
        );
        
        console.log(`🎯 Избрахме standing: type="${totalStanding?.type}", table entries=${totalStanding?.table?.length || 0}`);
        
        const standings: ApiStanding[] = totalStanding?.table || [];

        // Първо изтриваме старите записи за този турнир
        await supabase
          .from('cached_standings')
          .delete()
          .eq('competition_id', competitionId);

        // Обработваме всеки отбор и изчисляваме формата му
        const standingsToInsert = [];
        
        for (const standing of standings) {
          console.log(`🔍 Обработване на ${standing.team?.name} (ID: ${standing.team?.id})...`);
          
          // Проверяваме дали team.id съществува
          if (!standing.team?.id) {
            console.warn(`⚠️ Missing team_id for team: ${standing.team?.name}`);
            continue;
          }
          
          // Изчисляваме формата от последни мачове
          const calculatedForm = await calculateTeamForm(standing.team.id);
          
          standingsToInsert.push({
            competition_id: competitionId,
            team_id: standing.team.id,
            position: standing.position,
            played_games: standing.playedGames,
            won: standing.won,
            draw: standing.draw,
            lost: standing.lost,
            points: standing.points,
            goals_for: standing.goalsFor,
            goals_against: standing.goalsAgainst,
            goal_difference: standing.goalDifference,
            form: calculatedForm || null,
            last_updated: new Date().toISOString()
          });
          
          // Увеличена пауза за да не натоварваме API-то
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 секунди между отборите
        }

        // Записваме всички наведнъж
        if (standingsToInsert.length > 0) {
          await supabase
            .from('cached_standings')
            .insert(standingsToInsert);
          
          totalProcessed += standingsToInsert.length;
        }

        console.log(`✅ Синхронизирани ${standingsToInsert.length} позиции в класирането за турнир ${competitionId} с изчислена форма`);
      } catch (error) {
        console.warn(`⚠️ Не можах да синхронизирам класирането за турнир ${competitionId}:`, error);
      }
    };

    // Синхронизация на мачове за даден турнир
    const syncFixturesForCompetition = async (competitionId: number) => {
      console.log(`⚽ Синхронизиране на мачове за турнир ${competitionId}...`);
      try {
        const data = await makeApiRequest(`/competitions/${competitionId}/matches`);
        const matches: ApiMatch[] = data.matches || [];

        for (const match of matches) {
          await supabase
            .from('cached_fixtures')
            .upsert({
              id: match.id,
              competition_id: match.competition.id,
              season_id: match.season?.id,
              matchday: match.matchday,
              stage: match.stage,
              group_name: match.group,
              home_team_id: match.homeTeam.id,
              away_team_id: match.awayTeam.id,
              utc_date: match.utcDate,
              status: match.status,
              minute: match.minute, // НОВО
              injury_time: match.injuryTime, // НОВО
              attendance: match.attendance, // НОВО
              home_score: match.score.fullTime.home,
              away_score: match.score.fullTime.away,
              winner: match.score.winner,
              duration: match.score.duration,
              venue: match.venue,
              referee: match.referees?.[0]?.name,
              last_updated: new Date().toISOString()
            });
          totalProcessed++;
        }

        console.log(`✅ Синхронизирани ${matches.length} мача за турнир ${competitionId}`);
      } catch (error) {
        console.warn(`⚠️ Не можах да синхронизирам мачовете за турнир ${competitionId}:`, error);
      }
    };

    // Синхронизация на H2H мачове
    const syncH2HMatches = async () => {
      console.log(`🤝 Синхронизиране на H2H мачове...`);
      
      try {
        // Вземаме всички отбори от кеша
        const { data: teams, error: teamsError } = await supabase
          .from('cached_teams')
          .select('id')
          .limit(1000);
        
        if (teamsError || !teams) {
          console.error('❌ Грешка при зареждане на отбори:', teamsError);
          return;
        }

        console.log(`🔍 Ще синхронизирам H2H за ${teams.length} отбора...`);
        
        let processedPairs = 0;
        const currentYear = new Date().getFullYear();
        const previousSeasons = Array.from({length: 10}, (_, i) => currentYear - 1 - i);
        
        // Генерираме всички възможни двойки отбори
        for (let i = 0; i < teams.length; i++) {
          for (let j = i + 1; j < teams.length; j++) {
            const team1Id = teams[i].id;
            const team2Id = teams[j].id;
            
            console.log(`🔍 H2H: ${team1Id} vs ${team2Id} (${processedPairs + 1}/${(teams.length * (teams.length - 1)) / 2})`);
            
            let h2hMatches: any[] = [];
            
            // Търсим H2H мачове за последните 10 години
            for (const seasonYear of previousSeasons) {
              try {
                const data = await makeApiRequest(`/teams/${team1Id}/matches?season=${seasonYear}&status=FINISHED`);
                
                if (data.matches) {
                  const h2hInSeason = data.matches.filter((match: ApiMatch) => 
                    (match.homeTeam.id === team1Id && match.awayTeam.id === team2Id) ||
                    (match.homeTeam.id === team2Id && match.awayTeam.id === team1Id)
                  );
                  
                  h2hMatches.push(...h2hInSeason);
                }
                
                // Пауза между заявките за сезони
                await new Promise(resolve => setTimeout(resolve, 1000));
              } catch (seasonError) {
                console.log(`⚠️ Грешка при търсене на H2H за сезон ${seasonYear}:`, seasonError);
                continue;
              }
            }
            
            // Записваме намерените H2H мачове
            for (const match of h2hMatches) {
              const minTeamId = Math.min(team1Id, team2Id);
              const maxTeamId = Math.max(team1Id, team2Id);
              
              await supabase
                .from('cached_h2h_matches')
                .upsert({
                  team1_id: minTeamId,
                  team2_id: maxTeamId,
                  match_id: match.id,
                  competition_id: match.competition.id,
                  season_year: new Date(match.utcDate).getFullYear(),
                  utc_date: match.utcDate,
                  home_team_id: match.homeTeam.id,
                  away_team_id: match.awayTeam.id,
                  home_score: match.score.fullTime.home,
                  away_score: match.score.fullTime.away,
                  status: match.status,
                  winner: match.score.winner,
                  venue: match.venue,
                  last_updated: new Date().toISOString()
                });
              
              totalProcessed++;
            }
            
            processedPairs++;
            console.log(`✅ H2H ${team1Id} vs ${team2Id}: ${h2hMatches.length} мача`);
            
            // Пауза между двойките отбори
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
        
        console.log(`✅ H2H синхронизация завършена: ${processedPairs} двойки отбори`);
      } catch (error) {
        console.error('❌ Грешка при H2H синхронизация:', error);
      }
    };

    // Синхронизация на форма на отборите
    const syncTeamForm = async () => {
      console.log(`📈 Синхронизиране на форма на отборите...`);
      
      try {
        // Вземаме всички отбори от кеша
        const { data: teams, error: teamsError } = await supabase
          .from('cached_teams')
          .select('id')
          .limit(1000);
        
        if (teamsError || !teams) {
          console.error('❌ Грешка при зареждане на отбори:', teamsError);
          return;
        }

        console.log(`🔍 Ще синхронизирам форма за ${teams.length} отбора...`);
        
        for (const team of teams) {
          try {
            console.log(`📊 Форма за отбор ${team.id}...`);
            
            // Вземаме последните 5 мача на отбора
            const data = await makeApiRequest(`/teams/${team.id}/matches?limit=5&status=FINISHED`);
            
            const matches = data.matches || [];
            
            // Изчисляваме резултатите (W/D/L)
            const formResults = [];
            for (let i = 0; i < 5; i++) {
              if (i < matches.length) {
                const match = matches[i];
                const isHome = match.homeTeam.id === team.id;
                
                let result = '';
                if (match.score.winner === 'DRAW') {
                  result = 'D';
                } else if (
                  (isHome && match.score.winner === 'HOME_TEAM') ||
                  (!isHome && match.score.winner === 'AWAY_TEAM')
                ) {
                  result = 'W';
                } else {
                  result = 'L';
                }
                formResults.push(result);
              } else {
                formResults.push(null);
              }
            }
            
            // Записваме формата в таблицата
            await supabase
              .from('cached_team_form')
              .upsert({
                team_id: team.id,
                match1_result: formResults[0], // най-скорошен мач
                match2_result: formResults[1],
                match3_result: formResults[2],
                match4_result: formResults[3],
                match5_result: formResults[4], // най-стар от 5те мача
                last_updated: new Date().toISOString()
              });
            
            totalProcessed++;
            console.log(`✅ Отбор ${team.id}: форма = "${formResults.join('')}"`);
            
            // Пауза между отборите
            await new Promise(resolve => setTimeout(resolve, 1500));
          } catch (teamError) {
            console.warn(`⚠️ Грешка при синхронизация на форма за отбор ${team.id}:`, teamError);
            continue;
          }
        }
        
        console.log(`✅ Форма синхронизация завършена за ${teams.length} отбора`);
      } catch (error) {
        console.error('❌ Грешка при синхронизация на форма:', error);
      }
    };

    // Главна логика за синхронизация
    let competitions: number[] = [];

    if (syncType === 'all' || syncType === 'competitions') {
      competitions = await syncCompetitions();
    } else if (competitionIds) {
      competitions = competitionIds;
    } else {
      // Ако синхронизираме standings, teams или fixtures, първо вземаме списъка с турнири
      console.log('📋 Зареждане на списък с турнири от кеша...');
      const { data: cachedCompetitions, error } = await supabase
        .from('cached_competitions')
        .select('id')
        .order('id');
      
      if (error || !cachedCompetitions) {
        console.log('⚠️ Няма турнири в кеша, зареждаме от API...');
        competitions = await syncCompetitions();
      } else {
        competitions = cachedCompetitions.map(c => c.id);
        console.log(`📋 Заредени ${competitions.length} турнира от кеша`);
      }
    }

    // Синхронизация на H2H и форма (независимо от турнири)
    if (syncType === 'h2h') {
      await syncH2HMatches();
    } else if (syncType === 'team-form') {
      await syncTeamForm();
    } else {
      // Синхронизиране на данни за избраните турнири
      for (const competitionId of competitions) {
        if (syncType === 'all' || syncType === 'teams') {
          await syncTeamsForCompetition(competitionId);
        }
        
        if (syncType === 'all' || syncType === 'standings') {
          await syncStandingsForCompetition(competitionId);
        }
        
        if (syncType === 'all' || syncType === 'fixtures') {
          await syncFixturesForCompetition(competitionId);
        }

        // Увеличена пауза между турнирите за да спазваме rate limit
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3 секунди между турнирите
      }
    }

    // Обновяване на sync log като завършен
    await supabase
      .from('sync_logs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        records_processed: totalProcessed
      })
      .eq('id', syncLogId);

    console.log(`🎉 Синхронизацията завърши успешно! Обработени ${totalProcessed} записа`);

    return new Response(JSON.stringify({
      success: true,
      syncLogId,
      recordsProcessed: totalProcessed,
      competitions: competitions.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Грешка при синхронизация:', error);

    // Обновяване на sync log като неуспешен (ако е създаден)
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Проверяваме дали syncLogId съществува преди да го обновим
      if (typeof syncLogId !== 'undefined') {
        await supabase
          .from('sync_logs')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            errors: error.message,
            records_processed: totalProcessed
          })
          .eq('id', syncLogId);
      }
    } catch (logError) {
      console.error('❌ Грешка при обновяване на sync log:', logError);
    }

    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});