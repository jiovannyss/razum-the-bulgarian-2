// Utility to trigger football data sync manually
import { supabase } from "@/integrations/supabase/client";

export const triggerFootballDataSync = async (syncType: 'all' | 'competitions' | 'teams' | 'standings' | 'fixtures' | 'brazil-standings' | 'h2h' | 'team-form' = 'all') => {
  try {
    console.log(`🚀 Triggering football data sync: ${syncType}`);
    
    // За бразилските класирания подаваме специален параметър
    const body = syncType === 'brazil-standings' 
      ? { syncType: 'standings', competitionIds: [2013] }  // ID на Campeonato Brasileiro Série A
      : { syncType };
    
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