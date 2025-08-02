import { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';

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
        .from('wallets' as any)
        .select('balance')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error loading chips:', error);
        return;
      }

      setChips((data as any)?.balance || 0);
    } catch (error) {
      console.error('Error loading chips:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-full">
      <div className="relative">
        <Coins className="w-4 h-4 text-yellow-500" />
        <div className="absolute inset-0 text-yellow-600 font-bold text-xs flex items-center justify-center">
          G
        </div>
      </div>
      <span className="text-xs font-medium text-yellow-200 min-w-[2rem]">
        {chips.toLocaleString()}
      </span>
    </div>
  );
};