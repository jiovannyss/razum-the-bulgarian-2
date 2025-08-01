import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { triggerFootballDataSync } from '@/utils/syncTrigger';
import { useState } from 'react';
import { toast } from "sonner";

interface AdminSettingsProps {
  userRole: string | null;
}

export function AdminSettings({ userRole }: AdminSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async (syncType: 'all' | 'competitions' | 'teams' | 'standings' | 'fixtures') => {
    setIsLoading(true);
    try {
      await triggerFootballDataSync(syncType);
      toast.success(`Синхронизацията ${syncType} стартира успешно!`);
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Грешка при стартиране на синхронизацията');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-purple-700">
        <CardHeader>
          <CardTitle className="text-white">Синхронизация на данни</CardTitle>
          <CardDescription className="text-purple-200">
            Синхронизиране на данни от Football-Data.org API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button 
              onClick={() => handleSync('all')}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Всичко
            </Button>
            <Button 
              onClick={() => handleSync('competitions')}
              disabled={isLoading}
              variant="outline"
            >
              Турнири
            </Button>
            <Button 
              onClick={() => handleSync('teams')}
              disabled={isLoading}
              variant="outline"
            >
              Отбори
            </Button>
            <Button 
              onClick={() => handleSync('standings')}
              disabled={isLoading}
              variant="outline"
            >
              Класирания
            </Button>
            <Button 
              onClick={() => handleSync('fixtures')}
              disabled={isLoading}
              variant="outline"
            >
              Мачове
            </Button>
          </div>
          {isLoading && (
            <p className="text-purple-300 text-sm">⏳ Синхронизацията стартира...</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-purple-700">
        <CardHeader>
          <CardTitle className="text-white">Системни настройки</CardTitle>
          <CardDescription className="text-purple-200">
            Обща конфигурация на платформата
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-purple-300">Настройките ще бъдат добавени скоро...</p>
          <p className="text-sm text-purple-400 mt-2">Текуща роля: {userRole}</p>
        </CardContent>
      </Card>
    </div>
  );
}