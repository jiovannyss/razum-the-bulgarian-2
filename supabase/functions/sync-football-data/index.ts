import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Интерфейси за API данните
interface ApiCompetition {
  id: number;
  name: string;
  code: string;
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

    const syncLogId = syncLog.id;
    let totalProcessed = 0;

    // Helper функция за API заявки
    const makeApiRequest = async (endpoint: string) => {
      console.log(`🌐 API заявка: ${endpoint}`);
      const response = await fetch(`https://api.football-data.org/v4${endpoint}`, {
        headers: {
          'X-Auth-Token': footballApiKey
        }
      });

      if (!response.ok) {
        throw new Error(`API грешка ${response.status}: ${response.statusText}`);
      }

      return response.json();
    };

    // Синхронизация на турнири
    const syncCompetitions = async () => {
      console.log('🏆 Синхронизиране на турнири...');
      const data = await makeApiRequest('/competitions');
      const competitions: ApiCompetition[] = data.competitions.filter(
        (comp: ApiCompetition) => comp.plan === 'TIER_ONE'
      );

      for (const comp of competitions) {
        await supabase
          .from('cached_competitions')
          .upsert({
            id: comp.id,
            name: comp.name,
            code: comp.code,
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
              last_updated: new Date().toISOString()
            });
          totalProcessed++;
        }

        console.log(`✅ Синхронизирани ${teams.length} отбора за турнир ${competitionId}`);
      } catch (error) {
        console.warn(`⚠️ Не можах да синхронизирам отборите за турнир ${competitionId}:`, error);
      }
    };

    // Синхронизация на класирания за даден турнир
    const syncStandingsForCompetition = async (competitionId: number) => {
      console.log(`📊 Синхронизиране на класирания за турнир ${competitionId}...`);
      try {
        const data = await makeApiRequest(`/competitions/${competitionId}/standings`);
        const standings: ApiStanding[] = data.standings?.[0]?.table || [];

        // Първо изтриваме старите записи за този турнир
        await supabase
          .from('cached_standings')
          .delete()
          .eq('competition_id', competitionId);

        for (const standing of standings) {
          await supabase
            .from('cached_standings')
            .insert({
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
              form: standing.form,
              last_updated: new Date().toISOString()
            });
          totalProcessed++;
        }

        console.log(`✅ Синхронизирани ${standings.length} позиции в класирането за турнир ${competitionId}`);
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

    // Главна логика за синхронизация
    let competitions: number[] = [];

    if (syncType === 'all' || syncType === 'competitions') {
      competitions = await syncCompetitions();
    } else if (competitionIds) {
      competitions = competitionIds;
    }

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

      // Пауза между турнирите за да не преминем rate limit-а
      await new Promise(resolve => setTimeout(resolve, 1000));
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

    // Обновяване на sync log като неуспешен
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});