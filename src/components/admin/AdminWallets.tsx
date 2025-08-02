import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, User, Building2, TrendingUp, Users, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WalletData {
  id: string;
  user_id: string | null;
  balance: number;
  is_glowter_wallet: boolean;
  wallet_name: string | null;
  created_at: string;
  profiles?: {
    username: string | null;
    full_name: string | null;
    email: string | null;
  };
}

interface WalletStats {
  totalUsers: number;
  totalChips: number;
  glowterBalance: number;
  averageBalance: number;
}

export function AdminWallets() {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [stats, setStats] = useState<WalletStats>({
    totalUsers: 0,
    totalChips: 0,
    glowterBalance: 0,
    averageBalance: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWallets = async () => {
    setLoading(true);
    try {
      // Извличане на всички портфейли
      const { data: walletsData, error: walletsError } = await supabase
        .from('wallets')
        .select('*')
        .order('balance', { ascending: false });

      if (walletsError) {
        console.error('Error fetching wallets:', walletsError);
        toast({
          title: "Грешка",
          description: "Не успях да заредя портфейлите",
          variant: "destructive"
        });
        return;
      }

      // Извличане на профилните данни отделно
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, username, full_name, email');

      // Комбиниране на данните
      const walletsWithProfiles = (walletsData || []).map(wallet => ({
        ...wallet,
        profiles: wallet.is_glowter_wallet 
          ? undefined 
          : profilesData?.find(p => p.user_id === wallet.user_id)
      }));

      setWallets(walletsWithProfiles as WalletData[]);

      // Изчисляване на статистики
      const userWallets = walletsWithProfiles.filter(w => !w.is_glowter_wallet);
      const totalChips = walletsWithProfiles.reduce((sum, w) => sum + w.balance, 0);
      const glowterWallet = walletsWithProfiles.find(w => w.is_glowter_wallet);
      const glowterBalance = glowterWallet?.balance || 0;
      const averageBalance = userWallets.length > 0 
        ? userWallets.reduce((sum, w) => sum + w.balance, 0) / userWallets.length 
        : 0;

      setStats({
        totalUsers: userWallets.length,
        totalChips,
        glowterBalance,
        averageBalance: Math.round(averageBalance)
      });

    } catch (error) {
      console.error('Error in fetchWallets:', error);
      toast({
        title: "Грешка",
        description: "Възникна неочаквана грешка",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDisplayName = (wallet: WalletData) => {
    if (wallet.is_glowter_wallet) {
      return wallet.wallet_name || 'Glowter Портфейл';
    }
    return wallet.profiles?.username || 
           wallet.profiles?.full_name || 
           wallet.profiles?.email || 
           'Неизвестен потребител';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Управление на Портфейли</h2>
          <p className="text-muted-foreground">
            Преглед и управление на чипове в системата
          </p>
        </div>
        <Button onClick={fetchWallets} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Обнови
        </Button>
      </div>

      {/* Статистики */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общо Потребители</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общо Чипове</CardTitle>
            <Coins className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChips.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Glowter Баланс</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.glowterBalance.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Среден Баланс</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageBalance.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Списък с портфейли */}
      <Card>
        <CardHeader>
          <CardTitle>Всички Портфейли</CardTitle>
          <CardDescription>
            Детайлен преглед на всички портфейли в системата
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Зареждане...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Потребител</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead className="text-right">Баланс</TableHead>
                  <TableHead>Създаден</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallets.map((wallet) => (
                  <TableRow key={wallet.id}>
                    <TableCell className="font-medium">
                      {getDisplayName(wallet)}
                    </TableCell>
                    <TableCell>
                      {wallet.is_glowter_wallet ? (
                        <Badge variant="default">Системен</Badge>
                      ) : (
                        <Badge variant="secondary">Потребител</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Coins className="h-4 w-4 text-yellow-500" />
                        <span className="font-mono">
                          {wallet.balance.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(wallet.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}