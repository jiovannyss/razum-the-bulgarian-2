import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Coins, User, Building2 } from 'lucide-react';

interface WalletData {
  id: string;
  user_id: string | null;
  balance: number;
  is_system_wallet: boolean;
  created_at: string;
  profile?: {
    username: string;
    full_name: string;
    email: string;
  };
}

export function AdminWallets() {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [totalChips, setTotalChips] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      setLoading(true);
      
      // Load all wallets with profile data
      const { data: walletsData, error } = await supabase
        .from('wallets' as any)
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            email
          )
        `)
        .order('balance', { ascending: false });

      if (error) {
        console.error('Error loading wallets:', error);
        return;
      }

      setWallets((walletsData as any) || []);
      
      // Calculate total chips
      const total = (walletsData as any)?.reduce((sum: number, wallet: any) => sum + wallet.balance, 0) || 0;
      setTotalChips(total);

    } catch (error) {
      console.error('Error loading wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserDisplay = (wallet: WalletData) => {
    if (wallet.is_system_wallet) {
      return 'Glowter System';
    }
    
    const profile = wallet.profile;
    if (!profile) return 'Unknown User';
    
    return profile.username || profile.full_name || profile.email || 'Unknown User';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-purple-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-200">Общо чипове в играта</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold text-white">{totalChips.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-200">Активни портфейли</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold text-white">{wallets.filter(w => !w.is_system_wallet).length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-200">Системни портфейли</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold text-white">{wallets.filter(w => w.is_system_wallet).length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallets Table */}
      <Card className="bg-slate-800/50 border-purple-700">
        <CardHeader>
          <CardTitle className="text-white">Всички портфейли</CardTitle>
          <CardDescription className="text-purple-200">
            Преглед на всички портфейли в системата
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-purple-700/50">
                  <TableHead className="text-purple-200">Потребител</TableHead>
                  <TableHead className="text-purple-200">Тип</TableHead>
                  <TableHead className="text-purple-200 text-right">Чипове</TableHead>
                  <TableHead className="text-purple-200">Създаден</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-purple-300 py-8">
                      Зареждане...
                    </TableCell>
                  </TableRow>
                ) : wallets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-purple-300 py-8">
                      Няма намерени портфейли
                    </TableCell>
                  </TableRow>
                ) : (
                  wallets.map((wallet) => (
                    <TableRow key={wallet.id} className="border-purple-700/30 hover:bg-purple-900/20">
                      <TableCell className="text-white">
                        <div className="flex items-center gap-2">
                          {wallet.is_system_wallet ? (
                            <Building2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <User className="w-4 h-4 text-blue-500" />
                          )}
                          {getUserDisplay(wallet)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={wallet.is_system_wallet ? "default" : "secondary"}
                          className={wallet.is_system_wallet ? "bg-green-600 text-white" : "bg-blue-600 text-white"}
                        >
                          {wallet.is_system_wallet ? 'Системен' : 'Потребителски'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Coins className="w-4 h-4 text-yellow-500" />
                          <span className="text-white font-medium">
                            {wallet.balance.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-purple-300 text-sm">
                        {formatDate(wallet.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}