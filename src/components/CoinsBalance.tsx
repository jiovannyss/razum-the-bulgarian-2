import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { Coins } from 'lucide-react';

interface CoinsBalanceProps {
  className?: string;
}

export function CoinsBalance({ className = "" }: CoinsBalanceProps) {
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
    
    // Обновяване на баланса когато прозорецът получи фокус
    const handleFocus = () => {
      fetchBalance();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Обновяване на баланса на всеки 30 секунди
    const interval = setInterval(fetchBalance, 30000);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [user]);

  // Не показвай нищо ако потребителят не е логнат
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Coins className="w-6 h-6 text-yellow-500" />
        <span className="text-sm text-muted-foreground">...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Coins className="w-6 h-6 text-yellow-500" />
      <span className="text-sm font-medium text-foreground">
        {balance?.toLocaleString() || '0'}
      </span>
    </div>
  );
}