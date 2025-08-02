import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import glowterCoin from '@/assets/glowter-coin.png';

interface ChipsBalanceProps {
  className?: string;
}

export function ChipsBalance({ className = "" }: ChipsBalanceProps) {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    if (!user) {
      setBalance(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching wallet balance:', error);
        setBalance(0);
      } else {
        setBalance(data?.balance || 0);
      }
    } catch (error) {
      console.error('Error in fetchBalance:', error);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [user]);

  // Не показвай нищо ако потребителят не е логнат
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img 
          src={glowterCoin} 
          alt="Glowter Chips" 
          className="w-6 h-6 animate-pulse"
        />
        <span className="text-sm text-muted-foreground">...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src={glowterCoin} 
        alt="Glowter Chips" 
        className="w-6 h-6 drop-shadow-sm"
      />
      <span className="text-sm font-medium text-foreground">
        {balance?.toLocaleString() || '0'}
      </span>
    </div>
  );
}