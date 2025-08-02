import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ShoppingBag, X } from 'lucide-react';

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

interface BuyCoinsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offers: CoinOffer[];
  timeLeft: { [key: string]: string };
}

export function BuyCoinsModal({ open, onOpenChange, offers, timeLeft }: BuyCoinsModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleBuyCoins = async (offer: CoinOffer) => {
    setLoading(offer.id);
    
    try {
      // TODO: Integrate with Stripe payment
      console.log('Buying coins for offer:', offer);
      
      // Placeholder for Stripe integration
      // const { data } = await supabase.functions.invoke('create-payment', {
      //   body: {
      //     amount: Math.round(offer.offer_price * 100), // Convert to cents
      //     currency: 'usd',
      //     offerTitle: offer.title,
      //     coinAmount: offer.coin_amount
      //   }
      // });
      
      // if (data?.url) {
      //   window.open(data.url, '_blank');
      // }
      
    } catch (error) {
      console.error('Error creating payment:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              Buy Coins - Special Offers
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {offers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No active offers at the moment
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Check back later for special deals on coins!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {offers.map((offer) => (
                <Card key={offer.id} className="relative border-2 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{offer.title}</CardTitle>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        -{offer.discount_percentage}% OFF
                      </Badge>
                    </div>
                    {offer.description && (
                      <p className="text-sm text-muted-foreground">{offer.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Coin amount */}
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          {offer.coin_amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">coins</div>
                      </div>
                      
                      {/* Pricing */}
                      <div className="text-center space-y-1">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-2xl font-bold text-green-600">
                            ${offer.offer_price.toFixed(2)}
                          </span>
                          <span className="text-lg text-muted-foreground line-through">
                            ${offer.original_price.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Save ${(offer.original_price - offer.offer_price).toFixed(2)}!
                        </div>
                      </div>

                      {/* Time countdown */}
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {timeLeft[offer.id] === 'Expired' ? (
                            <span className="text-red-500 font-medium">Offer Expired</span>
                          ) : (
                            <>Time left: <span className="font-medium">{timeLeft[offer.id] || 'Calculating...'}</span></>
                          )}
                        </span>
                      </div>

                      {/* Buy button */}
                      <Button 
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 text-lg"
                        disabled={timeLeft[offer.id] === 'Expired' || loading === offer.id}
                        onClick={() => handleBuyCoins(offer)}
                      >
                        {loading === offer.id ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            Processing...
                          </div>
                        ) : timeLeft[offer.id] === 'Expired' ? (
                          'Offer Expired'
                        ) : (
                          <>
                            <ShoppingBag className="h-5 w-5 mr-2" />
                            Buy Now - ${offer.offer_price.toFixed(2)}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}