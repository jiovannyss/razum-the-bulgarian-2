import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AdminSettingsProps {
  userRole: string | null;
}

export function AdminSettings({ userRole }: AdminSettingsProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-purple-700">
        <CardHeader>
          <CardTitle className="text-white">Синхронизация на данни</CardTitle>
          <CardDescription className="text-purple-200">
            Управление на данните от Football-Data.org API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="bg-purple-600 hover:bg-purple-700 w-full"
          >
            🔄 Синхронизирай данни
          </Button>
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