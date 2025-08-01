// Utility to trigger football data sync manually
import { supabase } from "@/integrations/supabase/client";

export const triggerFootballDataSync = async (syncType: 'all' | 'competitions' | 'teams' | 'standings' | 'fixtures' = 'all') => {
  try {
    console.log(`🚀 Triggering football data sync: ${syncType}`);
    
    const { data, error } = await supabase.functions.invoke('sync-football-data', {
      body: { syncType }
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