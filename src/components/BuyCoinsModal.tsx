import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Clock, ShoppingBag, X, Tag, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [selectedOffer, setSelectedOffer] = useState<CoinOffer | null>(null);

  const handleApplyPromoCode = async (offer: CoinOffer) => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast.error('Invalid promo code');
        return;
      }

      // Check if promo is still valid
      if (data.expires_at && new Date(data.expires_at) <= new Date()) {
        toast.error('Promo code has expired');
        return;
      }

      // Check usage limits
      if (data.max_uses && data.current_uses >= data.max_uses) {
        toast.error('Promo code usage limit reached');
        return;
      }

      // Check minimum purchase amount
      if (offer.offer_price < data.min_purchase_amount) {
        toast.error(`Minimum purchase amount for this promo is €${data.min_purchase_amount}`);
        return;
      }

      setAppliedPromo(data);
      setSelectedOffer(offer);
      toast.success(`Promo code applied! ${data.discount_type === 'percentage' ? data.discount_value + '%' : '€' + data.discount_value} discount`);
    } catch (error) {
      console.error('Error applying promo code:', error);
      toast.error('Error applying promo code');
    }
  };

  const calculateDiscountedPrice = (offer: CoinOffer) => {
    if (!appliedPromo || selectedOffer?.id !== offer.id) return offer.offer_price;
    
    let discount = 0;
    if (appliedPromo.discount_type === 'percentage') {
      discount = (offer.offer_price * appliedPromo.discount_value) / 100;
    } else if (appliedPromo.discount_type === 'fixed') {
      discount = Math.min(appliedPromo.discount_value, offer.offer_price);
    }
    
    return Math.max(offer.offer_price - discount, 0);
  };

  const handleBuyCoins = async (offer: CoinOffer) => {
    setLoading(offer.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          offerId: offer.id,
          promoCode: selectedOffer?.id === offer.id ? promoCode : ''
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        onOpenChange(false); // Close modal after payment starts
      }
      
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Error creating payment. Please try again.');
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
                            €{calculateDiscountedPrice(offer).toFixed(2)}
                          </span>
                          <span className="text-lg text-muted-foreground line-through">
                            €{offer.original_price.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Save €{(offer.original_price - calculateDiscountedPrice(offer)).toFixed(2)}!
                        </div>
                        {appliedPromo && selectedOffer?.id === offer.id && (
                          <div className="text-sm text-green-600 font-medium">
                            Promo applied: {appliedPromo.discount_type === 'percentage' ? appliedPromo.discount_value + '%' : '€' + appliedPromo.discount_value} off
                          </div>
                        )}
                      </div>

                      {/* Promo Code Section */}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Tag className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="Enter promo code"
                              value={promoCode}
                              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                              className="pl-10"
                              disabled={loading === offer.id}
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApplyPromoCode(offer)}
                            disabled={!promoCode.trim() || loading === offer.id}
                          >
                            {appliedPromo && selectedOffer?.id === offer.id ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              'Apply'
                            )}
                          </Button>
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
                            Buy Now - €{calculateDiscountedPrice(offer).toFixed(2)}
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