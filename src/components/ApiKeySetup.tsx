import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { footballDataApi } from "@/services/footballDataApi";
import { Key, ExternalLink } from "lucide-react";

interface ApiKeySetupProps {
  onApiKeySet: () => void;
}

export const ApiKeySetup = ({ onApiKeySet }: ApiKeySetupProps) => {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast({
        title: "Грешка",
        description: "Моля въведете API ключ",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Set the API key and test it
      footballDataApi.setApiKey(apiKey.trim());
      
      // Test the API key by fetching competitions
      await footballDataApi.getCompetitions();
      
      toast({
        title: "Успех!",
        description: "API ключът е настроен успешно",
      });
      
      onApiKeySet();
    } catch (error) {
      console.error('Error testing API key:', error);
      toast({
        title: "Грешка",
        description: "Невалиден API ключ или проблем с връзката",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Key className="w-6 h-6 text-primary" />
            API Key Setup
          </CardTitle>
          <p className="text-muted-foreground">
            Въведете вашия Football-Data.org API ключ за достъп до футболни данни
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-medium">
                Football-Data.org API Key
              </label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Въведете вашия API ключ..."
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Проверяване..." : "Настрой API Key"}
            </Button>
          </form>
          
          <div className="space-y-3 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Нямате API ключ? Получете безплатен достъп до 12 лиги:
            </p>
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => window.open('https://www.football-data.org/client/register', '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
              Регистрирайте се безплатно
            </Button>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Безплатен план включва:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>12 лиги (Premier League, La Liga и др.)</li>
                <li>Мачове, класиранета, програми</li>
                <li>10 заявки/минута</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};