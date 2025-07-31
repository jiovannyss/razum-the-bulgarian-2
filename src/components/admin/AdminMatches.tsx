import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, Edit, Star, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { footballDataApi, type Match as ApiMatch } from '@/services/footballDataApi';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  competition: string;
  match_date: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
  admin_rating: number | null;
  external_id: string | null;
  created_at: string;
}

interface ApiMatchDisplay extends ApiMatch {
  admin_rating: number;
  db_id?: string;
}

export function AdminMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [apiMatches, setApiMatches] = useState<ApiMatchDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingApi, setLoadingApi] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all'); // 'all', 'database', 'api'
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [formData, setFormData] = useState({
    home_team: '',
    away_team: '',
    competition: '',
    match_date: '',
    home_score: '',
    away_score: '',
    status: 'scheduled',
    admin_rating: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMatches();
    loadApiMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Грешка",
        description: "Неуспешно зареждане на мачовете",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadApiMatches = async () => {
    setLoadingApi(true);
    try {
      const apiMatchesData = await footballDataApi.getUpcomingMatches();
      
      // Map API matches to display format with default rating of 1
      const mappedMatches: ApiMatchDisplay[] = apiMatchesData.map(match => ({
        ...match,
        admin_rating: 1, // Default rating
      }));

      // Check which matches already exist in database
      const existingMatches = await supabase
        .from('matches')
        .select('external_id, admin_rating, id')
        .in('external_id', mappedMatches.map(m => m.id.toString()));

      if (existingMatches.data) {
        // Update ratings from database
        mappedMatches.forEach(apiMatch => {
          const existing = existingMatches.data.find(db => db.external_id === apiMatch.id.toString());
          if (existing) {
            apiMatch.admin_rating = existing.admin_rating || 1;
            apiMatch.db_id = existing.id;
          }
        });
      }

      setApiMatches(mappedMatches);
      
      toast({
        title: "Успех",
        description: `Заредени ${mappedMatches.length} мача от API`,
      });
    } catch (error) {
      console.error('Error loading API matches:', error);
      toast({
        title: "Грешка",
        description: "Неуспешно зареждане на мачовете от API",
        variant: "destructive",
      });
    } finally {
      setLoadingApi(false);
    }
  };

  const updateApiMatchRating = async (apiMatch: ApiMatchDisplay, newRating: number) => {
    try {
      const matchData = {
        home_team: apiMatch.homeTeam.name,
        away_team: apiMatch.awayTeam.name,
        competition: apiMatch.competition.name,
        match_date: apiMatch.utcDate,
        home_score: apiMatch.score.fullTime.home,
        away_score: apiMatch.score.fullTime.away,
        status: apiMatch.status.toLowerCase(),
        admin_rating: newRating,
        external_id: apiMatch.id.toString(),
      };

      if (apiMatch.db_id) {
        // Update existing match
        const { error } = await supabase
          .from('matches')
          .update({ admin_rating: newRating })
          .eq('id', apiMatch.db_id);
        if (error) throw error;
      } else {
        // Insert new match
        const { data, error } = await supabase
          .from('matches')
          .insert(matchData)
          .select()
          .single();
        if (error) throw error;
        
        // Update local state with db_id
        apiMatch.db_id = data.id;
      }

      // Update local state
      setApiMatches(prev => prev.map(match => 
        match.id === apiMatch.id 
          ? { ...match, admin_rating: newRating }
          : match
      ));

      toast({
        title: "Успех",
        description: "Рейтингът е обновен успешно",
      });
    } catch (error) {
      console.error('Error updating rating:', error);
      toast({
        title: "Грешка",
        description: "Неуспешно обновяване на рейтинга",
        variant: "destructive",
      });
    }
  };

  const saveMatch = async () => {
    try {
      const matchData = {
        home_team: formData.home_team,
        away_team: formData.away_team,
        competition: formData.competition,
        match_date: formData.match_date,
        home_score: formData.home_score ? parseInt(formData.home_score) : null,
        away_score: formData.away_score ? parseInt(formData.away_score) : null,
        status: formData.status,
        admin_rating: formData.admin_rating ? parseInt(formData.admin_rating) : null,
      };

      if (editingMatch) {
        const { error } = await supabase
          .from('matches')
          .update(matchData)
          .eq('id', editingMatch.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('matches')
          .insert(matchData);
        if (error) throw error;
      }

      toast({
        title: "Успех",
        description: editingMatch ? "Мачът е обновен успешно" : "Мачът е добавен успешно",
      });

      fetchMatches();
      setEditingMatch(null);
      setFormData({
        home_team: '',
        away_team: '',
        competition: '',
        match_date: '',
        home_score: '',
        away_score: '',
        status: 'scheduled',
        admin_rating: ''
      });
    } catch (error) {
      console.error('Error saving match:', error);
      toast({
        title: "Грешка",
        description: "Неуспешно запазване на мача",
        variant: "destructive",
      });
    }
  };

  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.home_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.away_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.competition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || match.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const filteredApiMatches = apiMatches.filter(match => {
    const matchesSearch = match.homeTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.awayTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.competition.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || match.status.toLowerCase() === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const displayMatches = selectedSource === 'database' ? filteredMatches : 
                        selectedSource === 'api' ? [] : filteredMatches;
  const displayApiMatches = selectedSource === 'database' ? [] : 
                           selectedSource === 'api' ? filteredApiMatches : filteredApiMatches;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-600';
      case 'finished': return 'bg-blue-600';
      case 'postponed': return 'bg-yellow-600';
      case 'timed': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Планиран';
      case 'timed': return 'Планиран';
      case 'live': return 'На живо';
      case 'finished': return 'Завършен';
      case 'postponed': return 'Отложен';
      default: return status;
    }
  };

  if (loading) {
    return <div className="text-white">Зарежда се...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Управление на мачове</h2>
          <p className="text-purple-200">
            База данни: {matches.length} мача | API: {apiMatches.length} мача
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={loadApiMatches}
            disabled={loadingApi}
            variant="outline"
            className="border-purple-600 text-purple-200 hover:bg-purple-900"
          >
            {loadingApi ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {loadingApi ? 'Зарежда...' : 'Обнови от API'}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  setEditingMatch(null);
                  setFormData({
                    home_team: '',
                    away_team: '',
                    competition: '',
                    match_date: '',
                    home_score: '',
                    away_score: '',
                    status: 'scheduled',
                    admin_rating: ''
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Добави мач
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-purple-700 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingMatch ? 'Редактиране на мач' : 'Добавяне на мач'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-purple-200">Домакин</Label>
                    <Input
                      value={formData.home_team}
                      onChange={(e) => setFormData({...formData, home_team: e.target.value})}
                      className="bg-slate-700 border-purple-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-purple-200">Гост</Label>
                    <Input
                      value={formData.away_team}
                      onChange={(e) => setFormData({...formData, away_team: e.target.value})}
                      className="bg-slate-700 border-purple-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-purple-200">Първенство</Label>
                  <Input
                    value={formData.competition}
                    onChange={(e) => setFormData({...formData, competition: e.target.value})}
                    className="bg-slate-700 border-purple-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-purple-200">Дата и час</Label>
                  <Input
                    type="datetime-local"
                    value={formData.match_date}
                    onChange={(e) => setFormData({...formData, match_date: e.target.value})}
                    className="bg-slate-700 border-purple-600 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-purple-200">Резултат домакин</Label>
                    <Input
                      type="number"
                      value={formData.home_score}
                      onChange={(e) => setFormData({...formData, home_score: e.target.value})}
                      className="bg-slate-700 border-purple-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-purple-200">Резултат гост</Label>
                    <Input
                      type="number"
                      value={formData.away_score}
                      onChange={(e) => setFormData({...formData, away_score: e.target.value})}
                      className="bg-slate-700 border-purple-600 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-purple-200">Статус</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                      <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Планиран</SelectItem>
                        <SelectItem value="live">На живо</SelectItem>
                        <SelectItem value="finished">Завършен</SelectItem>
                        <SelectItem value="postponed">Отложен</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-purple-200">Рейтинг (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.admin_rating}
                      onChange={(e) => setFormData({...formData, admin_rating: e.target.value})}
                      className="bg-slate-700 border-purple-600 text-white"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={saveMatch} className="bg-purple-600 hover:bg-purple-700">
                  {editingMatch ? 'Запази промените' : 'Добави мач'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Филтри */}
      <Card className="bg-slate-800/50 border-purple-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label className="text-purple-200">Търсене</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                <Input
                  placeholder="Търсене по отбори или първенство..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-purple-600 text-white"
                />
              </div>
            </div>
            <div>
              <Label className="text-purple-200">Филтър по статус</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48 bg-slate-700 border-purple-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всички статуси</SelectItem>
                  <SelectItem value="scheduled">Планиран</SelectItem>
                  <SelectItem value="timed">Планиран</SelectItem>
                  <SelectItem value="live">На живо</SelectItem>
                  <SelectItem value="finished">Завършен</SelectItem>
                  <SelectItem value="postponed">Отложен</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-purple-200">Източник</Label>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger className="w-48 bg-slate-700 border-purple-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всички</SelectItem>
                  <SelectItem value="api">API мачове</SelectItem>
                  <SelectItem value="database">База данни</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблица с мачове */}
      <Card className="bg-slate-800/50 border-purple-700">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-purple-700">
                <TableHead className="text-purple-200">Мач</TableHead>
                <TableHead className="text-purple-200">Първенство</TableHead>
                <TableHead className="text-purple-200">Дата</TableHead>
                <TableHead className="text-purple-200">Резултат</TableHead>
                <TableHead className="text-purple-200">Статус</TableHead>
                <TableHead className="text-purple-200">Рейтинг</TableHead>
                <TableHead className="text-purple-200">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Database matches */}
              {displayMatches.map((match) => (
                <TableRow key={match.id} className="border-purple-700">
                  <TableCell>
                    <div className="text-white">
                      <div className="font-medium">{match.home_team} vs {match.away_team}</div>
                      <div className="text-xs text-purple-300">База данни</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-purple-200">{match.competition}</TableCell>
                  <TableCell className="text-purple-200">
                    {new Date(match.match_date).toLocaleDateString('bg-BG')}
                  </TableCell>
                  <TableCell className="text-white">
                    {match.home_score !== null && match.away_score !== null 
                      ? `${match.home_score} - ${match.away_score}` 
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusBadgeColor(match.status)} text-white`}>
                      {getStatusLabel(match.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {match.admin_rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-white">{match.admin_rating}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-600 text-purple-200 hover:bg-purple-900"
                          onClick={() => {
                            setEditingMatch(match);
                            setFormData({
                              home_team: match.home_team,
                              away_team: match.away_team,
                              competition: match.competition,
                              match_date: match.match_date.slice(0, 16),
                              home_score: match.home_score?.toString() || '',
                              away_score: match.away_score?.toString() || '',
                              status: match.status,
                              admin_rating: match.admin_rating?.toString() || ''
                            });
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 border-purple-700 max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-white">Редактиране на мач</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-purple-200">Домакин</Label>
                              <Input
                                value={formData.home_team}
                                onChange={(e) => setFormData({ ...formData, home_team: e.target.value })}
                                className="bg-slate-700 border-purple-600 text-white"
                              />
                            </div>
                            <div>
                              <Label className="text-purple-200">Гост</Label>
                              <Input
                                value={formData.away_team}
                                onChange={(e) => setFormData({ ...formData, away_team: e.target.value })}
                                className="bg-slate-700 border-purple-600 text-white"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-purple-200">Първенство</Label>
                            <Input
                              value={formData.competition}
                              onChange={(e) => setFormData({ ...formData, competition: e.target.value })}
                              className="bg-slate-700 border-purple-600 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-purple-200">Дата и час</Label>
                            <Input
                              type="datetime-local"
                              value={formData.match_date}
                              onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
                              className="bg-slate-700 border-purple-600 text-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-purple-200">Резултат домакин</Label>
                              <Input
                                type="number"
                                value={formData.home_score}
                                onChange={(e) => setFormData({ ...formData, home_score: e.target.value })}
                                className="bg-slate-700 border-purple-600 text-white"
                              />
                            </div>
                            <div>
                              <Label className="text-purple-200">Резултат гост</Label>
                              <Input
                                type="number"
                                value={formData.away_score}
                                onChange={(e) => setFormData({ ...formData, away_score: e.target.value })}
                                className="bg-slate-700 border-purple-600 text-white"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-purple-200">Статус</Label>
                              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                                <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="scheduled">Планиран</SelectItem>
                                  <SelectItem value="live">На живо</SelectItem>
                                  <SelectItem value="finished">Завършен</SelectItem>
                                  <SelectItem value="postponed">Отложен</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-purple-200">Рейтинг (1-5)</Label>
                              <Input
                                type="number"
                                min="1"
                                max="5"
                                value={formData.admin_rating}
                                onChange={(e) => setFormData({ ...formData, admin_rating: e.target.value })}
                                className="bg-slate-700 border-purple-600 text-white"
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={saveMatch} className="bg-purple-600 hover:bg-purple-700">
                            Запази промените
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
              
              {/* API matches */}
              {displayApiMatches.map((apiMatch) => (
                <TableRow key={`api-${apiMatch.id}`} className="border-purple-700">
                  <TableCell>
                    <div className="text-white">
                      <div className="font-medium">{apiMatch.homeTeam.name} vs {apiMatch.awayTeam.name}</div>
                      <div className="text-xs text-green-300">API</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-purple-200">{apiMatch.competition.name}</TableCell>
                  <TableCell className="text-purple-200">
                    {new Date(apiMatch.utcDate).toLocaleDateString('bg-BG')}
                  </TableCell>
                  <TableCell className="text-white">
                    {apiMatch.score.fullTime.home !== null && apiMatch.score.fullTime.away !== null 
                      ? `${apiMatch.score.fullTime.home} - ${apiMatch.score.fullTime.away}` 
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusBadgeColor(apiMatch.status.toLowerCase())} text-white`}>
                      {getStatusLabel(apiMatch.status.toLowerCase())}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select 
                        value={apiMatch.admin_rating.toString()} 
                        onValueChange={(value) => updateApiMatchRating(apiMatch, parseInt(value))}
                      >
                        <SelectTrigger className="w-20 h-8 bg-slate-700 border-purple-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-purple-200 text-sm">
                      Рейтинг: {apiMatch.admin_rating}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}