import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Coins, History, ShoppingBag, Clock } from 'lucide-react';
import { CoinsBalance } from '@/components/CoinsBalance';
import { toast } from '@/hooks/use-toast';
import { BuyCoinsModal } from '@/components/BuyCoinsModal';

interface WalletTransaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

interface CoinOffer {
  id: string;
  title: string;
  description: string;
  coin_amount: number;
  original_price: number;
  offer_price: number;
  discount_percentage: number;
  end_date: string;
  is_active: boolean;
}

export default function MyWallet() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [offers, setOffers] = useState<CoinOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({});
  const [buyCoinsModalOpen, setBuyCoinsModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      loadWalletData();
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Update countdown timers every second
    const interval = setInterval(() => {
      const newTimeLeft: { [key: string]: string } = {};
      offers.forEach(offer => {
        const now = new Date().getTime();
        const endTime = new Date(offer.end_date).getTime();
        const difference = endTime - now;
        
        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          
          newTimeLeft[offer.id] = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else {
          newTimeLeft[offer.id] = 'Expired';
        }
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [offers]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      
      // Load wallet transactions
      const { data: walletData } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (walletData) {
        const { data: transactionsData } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('wallet_id', walletData.id)
          .order('created_at', { ascending: false })
          .limit(50);

        setTransactions(transactionsData || []);
      }

      // Load active coin offers
      const { data: offersData } = await supabase
        .from('coin_offers')
        .select('*')
        .eq('is_active', true)
        .gt('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      setOffers(offersData || []);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while loading the data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'bonus': return 'Bonus';
      case 'win': return 'Win';
      case 'bet': return 'Bet';
      case 'purchase': return 'Purchase';
      case 'refund': return 'Refund';
      default: return type;
    }
  };

  const getTransactionIcon = (amount: number) => {
    return amount > 0 ? '↗️' : '↙️';
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-foreground to-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="gap-2 bg-background hover:bg-accent hover:text-accent-foreground border-border"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-black">My Wallet</h1>
            </div>
          </div>

          {/* Текуща наличност */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <CoinsBalance className="text-3xl font-bold" />
                <Button 
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 gap-2"
                  onClick={() => setBuyCoinsModalOpen(true)}
                >
                  <ShoppingBag className="h-5 w-5" />
                  Buy Coins
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Transaction History
              </CardTitle>
              <CardDescription>
                Overview of all incoming and outgoing transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No transactions to display
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {getTransactionIcon(transaction.amount)}
                        </span>
                        <div>
                          <p className="font-medium">
                            {formatTransactionType(transaction.transaction_type)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: '2-digit', 
                              year: 'numeric'
                            }).replace(/\//g, '.')} {new Date(transaction.created_at).toLocaleTimeString('en-GB', {
                              hour12: false,
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className={`font-medium ${getTransactionColor(transaction.amount)}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} coins
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Buy Coins Modal */}
          <BuyCoinsModal 
            open={buyCoinsModalOpen}
            onOpenChange={setBuyCoinsModalOpen}
            offers={offers}
            timeLeft={timeLeft}
          />
        </div>
      </div>
    </div>
  );
}