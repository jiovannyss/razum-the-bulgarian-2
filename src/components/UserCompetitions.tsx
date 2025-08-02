import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { footballDataApi, Competition } from '@/services/footballDataApi';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export default function UserCompetitions() {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [availableCompetitions, setAvailableCompetitions] = useState<Competition[]>([]);
  const [userCompetitions, setUserCompetitions] = useState<Set<number>>(new Set());
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (user && userRole) {
      loadData();
    }
  }, [user, userRole]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load available competitions
      const competitions = await footballDataApi.getCompetitions();
      setAvailableCompetitions(competitions);

      // For super admin, show all available competitions
      if (userRole === 'super_admin') {
        setUserCompetitions(new Set(competitions.map(c => c.id)));
      } else {
        // Load user's current competitions for regular users
        const { data } = await (supabase as any)
          .from('user_competitions')
          .select('competition_id')
          .eq('user_id', user?.id)
          .eq('is_active', true);

        if (data) {
          setUserCompetitions(new Set(data.map((item: any) => item.competition_id)));
        }
      }
    } catch (error) {
      console.error('Error loading competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMode = () => {
    if (isEditMode) {
      // Save changes
      savePendingChanges();
    } else {
      // Enter edit mode
      setIsEditMode(true);
      setPendingChanges(new Set(userCompetitions));
    }
  };

  const toggleCompetitionInEditMode = (competitionId: number) => {
    if (!isEditMode) return;
    
    const newPendingChanges = new Set(pendingChanges);
    if (newPendingChanges.has(competitionId)) {
      newPendingChanges.delete(competitionId);
    } else {
      newPendingChanges.add(competitionId);
    }
    setPendingChanges(newPendingChanges);
  };

  const savePendingChanges = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get competitions to add and remove
      const toAdd = Array.from(pendingChanges).filter(id => !userCompetitions.has(id));
      const toRemove = Array.from(userCompetitions).filter(id => !pendingChanges.has(id));

      // Remove competitions
      for (const competitionId of toRemove) {
        await (supabase as any)
          .from('user_competitions')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .eq('competition_id', competitionId);
      }

      // Add competitions
      for (const competitionId of toAdd) {
        const competition = availableCompetitions.find(c => c.id === competitionId);
        if (competition) {
          // First try to update existing record
          const { error: updateError } = await (supabase as any)
            .from('user_competitions')
            .update({ is_active: true })
            .eq('user_id', user.id)
            .eq('competition_id', competitionId);

          // If no rows were updated, insert new record
          if (updateError || updateError?.code === 'PGRST116') {
            await (supabase as any)
              .from('user_competitions')
              .insert({
                user_id: user.id,
                competition_id: competitionId,
                competition_name: competition.name,
                competition_code: competition.code,
                area_name: competition.area.name,
                is_active: true
              });
          }
        }
      }

      // Update local state
      setUserCompetitions(new Set(pendingChanges));
      setIsEditMode(false);
      
      toast({
        title: "Changes saved",
        description: "Your league preferences have been updated",
      });
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
    <div className="relative">
      <Card>
        <CardHeader>
          <CardTitle>My Leagues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pb-20">
          {availableCompetitions.map((competition) => {
            const isSelected = isEditMode 
              ? pendingChanges.has(competition.id)
              : userCompetitions.has(competition.id);
            
            return (
              <div 
                key={competition.id} 
                className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${
                  isEditMode ? 'bg-background' : 'bg-muted/50'
                }`}
              >
                <Checkbox
                  id={`user-comp-${competition.id}`}
                  checked={isSelected}
                  disabled={userRole === 'super_admin' || !isEditMode}
                  onCheckedChange={() => toggleCompetitionInEditMode(competition.id)}
                />
                <label 
                  htmlFor={`user-comp-${competition.id}`} 
                  className={`flex-1 ${isEditMode ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className="font-medium">{competition.name}</div>
                  <div className="text-sm text-muted-foreground">{competition.area.name}</div>
                </label>
              </div>
            );
          })}
        </CardContent>
      </Card>
      
      {/* Sticky Change/Save button - hide for super admin */}
      {userRole !== 'super_admin' && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
          <Button 
            onClick={handleEditMode}
            disabled={loading}
            size="lg"
            className="shadow-lg"
          >
            {isEditMode ? 'Save' : 'Change'}
          </Button>
        </div>
      )}
    </div>
  );
}