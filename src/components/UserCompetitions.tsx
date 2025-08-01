import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { footballDataApi, Competition } from '@/services/footballDataApi';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export default function UserCompetitions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [availableCompetitions, setAvailableCompetitions] = useState<Competition[]>([]);
  const [userCompetitions, setUserCompetitions] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load available competitions
      const competitions = await footballDataApi.getCompetitions();
      setAvailableCompetitions(competitions);

      // Load user's current competitions
      const { data } = await (supabase as any)
        .from('user_competitions')
        .select('competition_id')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (data) {
        setUserCompetitions(new Set(data.map((item: any) => item.competition_id)));
      }
    } catch (error) {
      console.error('Error loading competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCompetition = async (competitionId: number) => {
    if (!user) return;

    const competition = availableCompetitions.find(c => c.id === competitionId);
    if (!competition) return;

    const isCurrentlySelected = userCompetitions.has(competitionId);

    try {
      if (isCurrentlySelected) {
        // Remove competition
        await (supabase as any)
          .from('user_competitions')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .eq('competition_id', competitionId);
      } else {
        // Add competition
        await (supabase as any)
          .from('user_competitions')
          .upsert({
            user_id: user.id,
            competition_id: competitionId,
            competition_name: competition.name,
            competition_code: competition.code,
            area_name: competition.area.name,
            is_active: true
          });
      }

      // Update local state
      const newSelected = new Set(userCompetitions);
      if (isCurrentlySelected) {
        newSelected.delete(competitionId);
        toast({
          title: "League removed",
          description: `You've left ${competition.name}`,
        });
      } else {
        newSelected.add(competitionId);
        toast({
          title: "League joined",
          description: `You've joined ${competition.name}`,
        });
      }
      setUserCompetitions(newSelected);
    } catch (error) {
      console.error('Error updating competition:', error);
      toast({
        title: "Error",
        description: "Failed to update league subscription",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading leagues...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Leagues</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {availableCompetitions.map((competition) => {
          const isSelected = userCompetitions.has(competition.id);
          return (
            <div key={competition.id} className="flex items-center space-x-3 p-3 border rounded-lg">
              <Checkbox
                id={`user-comp-${competition.id}`}
                checked={isSelected}
                onCheckedChange={() => toggleCompetition(competition.id)}
              />
              <label htmlFor={`user-comp-${competition.id}`} className="flex-1 cursor-pointer">
                <div className="font-medium">{competition.name}</div>
                <div className="text-sm text-muted-foreground">{competition.area.name}</div>
              </label>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}