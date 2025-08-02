import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { Coins } from 'lucide-react';

export const ChipsIndicator = () => {
  const [chips, setChips] = useState<number>(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadChips();
      
      // Обновяване на чиповете когато прозорецът получи фокус
      const handleFocus = () => {
        loadChips();
      };
      
      window.addEventListener('focus', handleFocus);
      
      // Обновяване на чиповете на всеки 30 секунди
      const interval = setInterval(loadChips, 30000);
      
      return () => {
        window.removeEventListener('focus', handleFocus);
        clearInterval(interval);
      };
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
      <Coins className="w-6 h-6 text-yellow-500" />
      <span className="text-sm font-medium text-foreground">
        {chips.toLocaleString()}
      </span>
    </div>
  );
};