import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Calendar, Coins } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CoinOffer {
  id: string;
  title: string;
  description: string;
  coin_amount: number;
  original_price: number;
  offer_price: number;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

interface OfferFormData {
  title: string;
  description: string;
  coin_amount: number;
  original_price: number;
  offer_price: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export default function AdminOffers() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<CoinOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<CoinOffer | null>(null);
  const [formData, setFormData] = useState<OfferFormData>({
    title: '',
    description: '',
    coin_amount: 0,
    original_price: 0,
    offer_price: 0,
    start_date: new Date().toISOString().slice(0, 16),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coin_offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error('Error loading offers:', error);
      toast({
        title: 'Грешка',
        description: 'Възникна грешка при зареждането на офертите.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      
      const offerData = {
        ...formData,
        created_by: user.id,
      };

      let error;
      if (editingOffer) {
        const { error: updateError } = await supabase
          .from('coin_offers')
          .update(offerData)
          .eq('id', editingOffer.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('coin_offers')
          .insert([offerData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: 'Успех',
        description: editingOffer ? 'Офертата е обновена успешно.' : 'Офертата е създадена успешно.',
      });

      setDialogOpen(false);
      resetForm();
      loadOffers();
    } catch (error) {
      console.error('Error saving offer:', error);
      toast({
        title: 'Грешка',
        description: 'Възникна грешка при запазването на офертата.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (offer: CoinOffer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description || '',
      coin_amount: offer.coin_amount,
      original_price: offer.original_price,
      offer_price: offer.offer_price,
      start_date: new Date(offer.start_date).toISOString().slice(0, 16),
      end_date: new Date(offer.end_date).toISOString().slice(0, 16),
      is_active: offer.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (offerId: string) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете тази оферта?')) return;

    try {
      const { error } = await supabase
        .from('coin_offers')
        .delete()
        .eq('id', offerId);

      if (error) throw error;

      toast({
        title: 'Успех',
        description: 'Офертата е изтрита успешно.',
      });

      loadOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast({
        title: 'Грешка',
        description: 'Възникна грешка при изтриването на офертата.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEditingOffer(null);
    setFormData({
      title: '',
      description: '',
      coin_amount: 0,
      original_price: 0,
      offer_price: 0,
      start_date: new Date().toISOString().slice(0, 16),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      is_active: true,
    });
  };

  const calculateDiscount = () => {
    if (formData.original_price > 0 && formData.offer_price > 0) {
      return Math.round(((formData.original_price - formData.offer_price) / formData.original_price) * 100);
    }
    return 0;
  };

  const getStatusBadge = (offer: CoinOffer) => {
    const now = new Date();
    const endDate = new Date(offer.end_date);
    const startDate = new Date(offer.start_date);

    if (!offer.is_active) {
      return <Badge variant="secondary">Неактивна</Badge>;
    }
    if (now < startDate) {
      return <Badge variant="outline">Предстояща</Badge>;
    }
    if (now > endDate) {
      return <Badge variant="destructive">Изтекла</Badge>;
    }
    return <Badge variant="default">Активна</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Управление на оферти</h3>
          <p className="text-sm text-muted-foreground">
            Създавайте и управлявайте оферти за монети
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Нова оферта
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingOffer ? 'Редактиране на оферта' : 'Нова оферта'}
              </DialogTitle>
              <DialogDescription>
                {editingOffer ? 'Редактирайте данните на офертата.' : 'Създайте нова оферта за монети.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Заглавие</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Заглавие на офертата"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Описание на офертата"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coin_amount">Брой монети</Label>
                  <Input
                    id="coin_amount"
                    type="number"
                    value={formData.coin_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, coin_amount: parseInt(e.target.value) || 0 }))}
                    min="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_price">Обичайна цена (лв)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, original_price: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="offer_price">Цена на офертата (лв)</Label>
                  <Input
                    id="offer_price"
                    type="number"
                    step="0.01"
                    value={formData.offer_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, offer_price: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Отстъпка</Label>
                  <div className="flex items-center justify-center h-10 bg-muted rounded-md">
                    <span className="text-sm font-medium">{calculateDiscount()}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Начало</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">Край</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Активна оферта</Label>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Запазване...' : editingOffer ? 'Обнови' : 'Създай'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <Card key={offer.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{offer.title}</CardTitle>
                  {getStatusBadge(offer)}
                </div>
                <CardDescription>{offer.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4" />
                    <span className="font-medium">{offer.coin_amount.toLocaleString()} монети</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{offer.offer_price.toFixed(2)} лв</span>
                    <span className="text-sm text-muted-foreground line-through">
                      {offer.original_price.toFixed(2)} лв
                    </span>
                    <Badge variant="secondary" className="ml-auto">
                      -{offer.discount_percentage}%
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(offer.start_date).toLocaleDateString('bg-BG')} - {new Date(offer.end_date).toLocaleDateString('bg-BG')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(offer)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Редактирай
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(offer.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && offers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Няма създадени оферти</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}