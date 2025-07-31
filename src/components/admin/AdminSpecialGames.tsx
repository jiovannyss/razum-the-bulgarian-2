import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AdminSpecialGames() {
  return (
    <Card className="bg-slate-800/50 border-purple-700">
      <CardHeader>
        <CardTitle className="text-white">Специални игри</CardTitle>
        <CardDescription className="text-purple-200">
          Управление на специални игри и турнири
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-purple-300">Функционалността ще бъде добавена скоро...</p>
      </CardContent>
    </Card>
  );
}