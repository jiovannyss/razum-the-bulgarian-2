import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Users, Calendar, Trophy, Settings, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminMatches } from '@/components/admin/AdminMatches';
import { AdminSpecialGames } from '@/components/admin/AdminSpecialGames';
import { AdminRooms } from '@/components/admin/AdminRooms';
import { AdminSettings } from '@/components/admin/AdminSettings';

interface UserRole {
  role: 'super_admin' | 'admin' | 'moderator' | 'user';
}

export default function Admin() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      // Проверяваме ролята на потребителя
      const { data: roles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['super_admin', 'admin']);

      if (roleError) {
        console.error('Error checking user role:', roleError);
        setError('Грешка при проверка на правата за достъп');
        return;
      }

      if (!roles || roles.length === 0) {
        setError('Нямате администраторски права за достъп до този панел');
        return;
      }

      // Вземаме най-високата роля
      const highestRole = roles.find(r => r.role === 'super_admin') || roles[0];
      setUserRole(highestRole.role);
    } catch (err) {
      console.error('Error in admin access check:', err);
      setError('Възникна грешка при проверката на достъпа');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-background rounded-2xl shadow-2xl p-8">
          <div className="text-foreground text-xl">Проверява се достъпът...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-2">
        <Card className="w-full max-w-md bg-background rounded-2xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Грешка при достъп
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate('/')} 
              variant="outline" 
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад към началото
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2">
      <div className="min-h-screen bg-background rounded-2xl shadow-2xl overflow-hidden">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Начало
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Администраторски панел</h1>
                <p className="text-muted-foreground">Управление на платформата за прогнози</p>
              </div>
            </div>
            <Badge 
              variant={userRole === 'super_admin' ? 'default' : 'secondary'}
              className="text-sm px-3 py-1"
            >
              {userRole === 'super_admin' ? 'Супер администратор' : 'Администратор'}
            </Badge>
          </div>

          {/* Admin Tabs */}
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="users" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Потребители
                  </TabsTrigger>
                  <TabsTrigger value="matches" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Мачове
                  </TabsTrigger>
                  <TabsTrigger value="special-games" className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Специални игри
                  </TabsTrigger>
                  <TabsTrigger value="rooms" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Стаи
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Настройки
                  </TabsTrigger>
                </TabsList>

                <div className="p-6">
                  <TabsContent value="users" className="mt-0">
                    <AdminUsers userRole={userRole} />
                  </TabsContent>

                  <TabsContent value="matches" className="mt-0">
                    <AdminMatches />
                  </TabsContent>

                  <TabsContent value="special-games" className="mt-0">
                    <AdminSpecialGames />
                  </TabsContent>

                  <TabsContent value="rooms" className="mt-0">
                    <AdminRooms />
                  </TabsContent>

                  <TabsContent value="settings" className="mt-0">
                    <AdminSettings userRole={userRole} />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}