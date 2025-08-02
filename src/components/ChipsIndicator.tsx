import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import glowterCoin from '@/assets/glowter-coin-round.png';

export const ChipsIndicator = () => {
  const [chips, setChips] = useState<number>(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadChips();
    }
  }, [user]);

  const loadChips = async () => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error loading chips:', error);
        return;
      }

      setChips(data?.balance || 0);
    } catch (error) {
      console.error('Error loading chips:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <img 
        src={glowterCoin} 
        alt="Glowter Chips" 
        className="w-5 h-5 drop-shadow-sm"
      />
      <span className="text-sm font-medium text-foreground">
        {chips.toLocaleString()}
      </span>
    </div>
  );
};