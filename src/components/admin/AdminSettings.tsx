import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { triggerFootballDataSync, getSyncProgress, resumeSync } from '@/utils/syncTrigger';
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

interface AdminSettingsProps {
  userRole: string | null;
}

export function AdminSettings({ userRole }: AdminSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<any>(null);
  const [syncProgress, setSyncProgress] = useState<any>(null);
  const [syncCounts, setSyncCounts] = useState({
    competitions: 0,
    teams: 0,
    fixtures: 0,
    standings: 0
  });

  // Load last sync info and data counts
  useEffect(() => {
    loadSyncInfo();
    loadDataCounts();
    loadSyncProgress();
    
    // Проверяваме прогреса на всеки 10 секунди
    const interval = setInterval(() => {
      loadSyncProgress();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadSyncInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('sync_logs' as any)
        .select('*')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading sync info:', error);
        return;
      }

      if (data) {
        setLastSync(data);
      }
    } catch (error) {
      console.error('Error loading sync info:', error);
    }
  };

  const loadDataCounts = async () => {
    try {
      const [competitionsRes, teamsRes, fixturesRes, standingsRes] = await Promise.all([
        supabase.from('cached_competitions' as any).select('id', { count: 'exact', head: true }),
        supabase.from('cached_teams' as any).select('id', { count: 'exact', head: true }),
        supabase.from('cached_fixtures' as any).select('id', { count: 'exact', head: true }),
        supabase.from('cached_standings' as any).select('id', { count: 'exact', head: true })
      ]);

      setSyncCounts({
        competitions: competitionsRes.count || 0,
        teams: teamsRes.count || 0,
        fixtures: fixturesRes.count || 0,
        standings: standingsRes.count || 0
      });
    } catch (error) {
      console.error('Error loading data counts:', error);
    }
  };

  const loadSyncProgress = async () => {
    try {
      const progress = await getSyncProgress();
      setSyncProgress(progress);
    } catch (error) {
      console.error('Error loading sync progress:', error);
    }
  };

  const handleSync = async (syncType: 'all' | 'competitions' | 'teams' | 'standings' | 'fixtures' | 'brazil-standings' | 'h2h' | 'team-form') => {
    setIsLoading(true);
    try {
      const result = await triggerFootballDataSync(syncType);
      
      if (result?.paused) {
        toast.warning(`Синхронизацията е паузирана поради ограничения във времето. Обработени ${result.nextBatch * 3} турнира.`);
      } else {
        toast.success(`Синхронизацията ${syncType} стартира успешно!`);
      }
      
      // Reload sync info after a delay to catch the new sync
      setTimeout(() => {
        loadSyncInfo();
        loadDataCounts();
        loadSyncProgress();
      }, 3000);
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Грешка при стартиране на синхронизацията');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeSync = async () => {
    if (!syncProgress) return;
    
    setIsLoading(true);
    try {
      const nextBatch = syncProgress.current_batch + 1;
      await resumeSync(nextBatch, syncProgress.batch_size);
      toast.success('Синхронизацията се възобновява...');
      
      setTimeout(() => {
        loadSyncInfo();
        loadDataCounts();
        loadSyncProgress();
      }, 3000);
    } catch (error) {
      console.error('Resume failed:', error);
      toast.error('Грешка при възобновяване на синхронизацията');
    } finally {
      setIsLoading(false);
    }
  };

  // Format sync duration
  const getSyncDuration = () => {
    if (!lastSync?.started_at || !lastSync?.completed_at) return null;
    
    const start = new Date(lastSync.started_at);
    const end = new Date(lastSync.completed_at);
    const durationMs = end.getTime() - start.getTime();
    const durationSeconds = Math.round(durationMs / 1000);
    
    return durationSeconds;
  };

  // Format last sync date
  const getLastSyncDate = () => {
    if (!lastSync?.completed_at) return null;
    
    const date = new Date(lastSync.completed_at);
    return format(date, 'dd.MM.yyyy HH:mm:ss');
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
          {/* Last sync info */}
          {lastSync && (
            <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
              <h4 className="text-white font-medium mb-2">📊 Последна синхронизация</h4>
              <div className="space-y-1 text-sm">
                <p className="text-purple-200">
                  <span className="text-purple-400">Време:</span> {getLastSyncDate()}
                </p>
                <p className="text-purple-200">
                  <span className="text-purple-400">Продължителност:</span> ~{getSyncDuration()} секунди
                </p>
                <p className="text-purple-200">
                  <span className="text-purple-400">Тип:</span> {lastSync.sync_type}
                </p>
                <p className="text-purple-200">
                  <span className="text-purple-400">Обработени записи:</span> {lastSync.records_processed}
                </p>
              </div>
              
              {/* Data counts */}
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-purple-400">Турнири</div>
                  <div className="text-white font-bold">{syncCounts.competitions}</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400">Отбори</div>
                  <div className="text-white font-bold">{syncCounts.teams}</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400">Мачове</div>
                  <div className="text-white font-bold">{syncCounts.fixtures}</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400">Класирания</div>
                  <div className="text-white font-bold">{syncCounts.standings}</div>
                </div>
              </div>
            </div>
          )}

          {/* Sync Progress */}
          {syncProgress && syncProgress.status !== 'completed' && (
            <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
              <h4 className="text-white font-medium mb-2">🔄 Текуща синхронизация</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-purple-200">Статус: {syncProgress.status}</span>
                  <span className="text-purple-200">
                    {syncProgress.processed_items}/{syncProgress.total_items} турнира
                  </span>
                </div>
                
                <Progress 
                  value={(syncProgress.processed_items / syncProgress.total_items) * 100} 
                  className="w-full h-2"
                />
                
                <div className="flex justify-between text-xs text-purple-300">
                  <span>Порция {syncProgress.current_batch + 1} от {Math.ceil(syncProgress.total_items / syncProgress.batch_size)}</span>
                  <span>Размер на порцията: {syncProgress.batch_size}</span>
                </div>
                
                {syncProgress.status === 'paused' && (
                  <Button 
                    onClick={handleResumeSync}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white w-full"
                  >
                    🔄 Възобнови синхронизацията
                  </Button>
                )}
              </div>
            </div>
          )}

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
              Турнири/Competitions
            </Button>
            <Button 
              onClick={() => handleSync('teams')}
              disabled={isLoading}
              variant="outline"
            >
              Отбори/Teams
            </Button>
            <Button 
              onClick={() => handleSync('standings')}
              disabled={isLoading}
              variant="outline"
            >
              Класирания/Standings
            </Button>
            <Button 
              onClick={() => handleSync('fixtures')}
              disabled={isLoading}
              variant="outline"
            >
              Мачове/Fixtures
            </Button>
            <Button 
              onClick={() => handleSync('h2h')}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              🤝 H2H мачове (10г)/H2H
            </Button>
            <Button 
              onClick={() => handleSync('team-form')}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              📈 Форма отбори/Form
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