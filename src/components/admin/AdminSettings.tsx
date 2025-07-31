import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminSettingsProps {
  userRole: string | null;
}

export function AdminSettings({ userRole }: AdminSettingsProps) {
  return (
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
  );
}