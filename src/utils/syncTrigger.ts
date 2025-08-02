// Utility to trigger football data sync manually
import { supabase } from "@/integrations/supabase/client";

export const triggerFootballDataSync = async (
  syncType: 'all' | 'competitions' | 'teams' | 'standings' | 'fixtures' | 'brazil-standings' | 'h2h' | 'team-form' = 'all',
  options: {
    batchSize?: number;
    resumeFrom?: number;
  } = {}
) => {
  try {
    console.log(`🚀 Triggering football data sync: ${syncType}`, options);
    
    // За бразилските класирания подаваме специален параметър
    const body = syncType === 'brazil-standings' 
      ? { 
          syncType: 'standings', 
          competitionIds: [2013],  // ID на Campeonato Brasileiro Série A
          batchSize: options.batchSize || 3,
          resumeFrom: options.resumeFrom || null
        }
      : { 
          syncType,
          batchSize: options.batchSize || 3,
          resumeFrom: options.resumeFrom || null
        };
    
    const { data, error } = await supabase.functions.invoke('sync-football-data', {
      body
    });

    if (error) {
      console.error('❌ Sync failed:', error);
      throw error;
    }

    console.log('✅ Sync completed:', data);
    return data;
  } catch (error) {
    console.error('❌ Error triggering sync:', error);
    throw error;
  }
};

// Функция за възобновяване на спряна синхронизация
export const resumeSync = async (nextBatch: number, batchSize: number = 3) => {
  console.log(`🔄 Resuming sync from batch ${nextBatch}`);
  return triggerFootballDataSync('fixtures', { 
    batchSize, 
    resumeFrom: nextBatch * batchSize 
  });
};

// Функция за проверка на прогреса на синхронизация
export const getSyncProgress = async () => {
  try {
    const { data, error } = await supabase
      .from('sync_progress')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching sync progress:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Error getting sync progress:', error);
    return null;
  }
};