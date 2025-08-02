import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Coins, History, ShoppingBag, Clock } from 'lucide-react';
import { CoinsBalance } from '@/components/CoinsBalance';
import { toast } from '@/hooks/use-toast';

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
              variant="ghost"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">My Wallet</h1>
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
              <div className="text-center">
                <CoinsBalance className="justify-center text-lg" />
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="offers" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                Buy Coins
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
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
                                {new Date(transaction.created_at).toLocaleString('bg-BG')}
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
            </TabsContent>

            <TabsContent value="offers" className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : offers.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No active offers at the moment
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {offers.map((offer) => (
                    <Card key={offer.id} className="relative">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{offer.title}</CardTitle>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            -{offer.discount_percentage}%
                          </Badge>
                        </div>
                        <CardDescription>{offer.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-primary">
                              {offer.coin_amount.toLocaleString()} coins
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold">
                              ${offer.offer_price.toFixed(2)}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              ${offer.original_price.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Time left: {timeLeft[offer.id] || 'Calculating...'}</span>
                          </div>

                          <Button 
                            className="w-full" 
                            disabled={timeLeft[offer.id] === 'Expired'}
                          >
                            {timeLeft[offer.id] === 'Expired' ? 'Offer expired' : 'Buy now'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}