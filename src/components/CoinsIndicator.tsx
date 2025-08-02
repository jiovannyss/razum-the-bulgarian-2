import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { Coins } from 'lucide-react';

export const CoinsIndicator = () => {
  const [coins, setCoins] = useState<number>(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCoins();
      
      // Обновяване на монетите когато прозорецът получи фокус
      const handleFocus = () => {
        loadCoins();
      };
      
      window.addEventListener('focus', handleFocus);
      
      // Обновяване на монетите на всеки 30 секунди
      const interval = setInterval(loadCoins, 30000);
      
      return () => {
        window.removeEventListener('focus', handleFocus);
        clearInterval(interval);
      };
    }
  }, [user]);

  const loadCoins = async () => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error loading coins:', error);
        return;
      }

      setCoins(data?.balance || 0);
    } catch (error) {
      console.error('Error loading coins:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <Coins className="w-6 h-6 text-yellow-500" />
      <span className="text-sm font-medium text-foreground">
        {coins.toLocaleString()}
      </span>
    </div>
  );
};