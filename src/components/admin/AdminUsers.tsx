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
import { Search, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  created_at: string;
}

interface UserRole {
  role: string;
}

interface AdminUsersProps {
  userRole: string | null;
}

export function AdminUsers({ userRole }: AdminUsersProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Зареждаме профилите
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Зареждаме ролите
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      setProfiles(profilesData || []);
      
      // Създаваме мап от user_id към роля
      const rolesMap: Record<string, string> = {};
      rolesData?.forEach(role => {
        rolesMap[role.user_id] = role.role;
      });
      setUserRoles(rolesMap);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Грешка",
        description: "Неуспешно зареждане на потребителите",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      // Първо изтриваме съществуващите роли
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // След това добавяме новата роля
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: role as 'super_admin' | 'admin' | 'moderator' | 'user' });

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Ролята е променена успешно",
      });

      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Грешка",
        description: "Неуспешна промяна на ролята",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = profiles.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const currentUserRole = userRoles[user.user_id] || 'user';
    const matchesRole = selectedRole === 'all' || currentUserRole === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-600';
      case 'admin': return 'bg-blue-600';
      case 'moderator': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Супер админ';
      case 'admin': return 'Администратор';
      case 'moderator': return 'Модератор';
      default: return 'Потребител';
    }
  };

  if (loading) {
    return <div className="text-white">Зарежда се...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Управление на потребители</h2>
          <p className="text-purple-200">Общо потребители: {profiles.length}</p>
        </div>
      </div>

      {/* Филтри */}
      <Card className="bg-slate-800/50 border-purple-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-purple-200">Търсене</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                <Input
                  id="search"
                  placeholder="Търсене по име или потребителско име..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-purple-600 text-white"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role-filter" className="text-purple-200">Филтър по роля</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-48 bg-slate-700 border-purple-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всички роли</SelectItem>
                  <SelectItem value="user">Потребител</SelectItem>
                  <SelectItem value="moderator">Модератор</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                  <SelectItem value="super_admin">Супер админ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблица с потребители */}
      <Card className="bg-slate-800/50 border-purple-700">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-purple-700">
                <TableHead className="text-purple-200">Потребител</TableHead>
                <TableHead className="text-purple-200">Роля</TableHead>
                <TableHead className="text-purple-200">Регистриран</TableHead>
                {userRole === 'super_admin' && (
                  <TableHead className="text-purple-200">Действия</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const role = userRoles[user.user_id] || 'user';
                return (
                  <TableRow key={user.id} className="border-purple-700">
                    <TableCell>
                      <div className="text-white">
                        <div className="font-medium">{user.full_name || 'Няма име'}</div>
                        <div className="text-sm text-purple-300">@{user.username || 'Няма потребителско име'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getRoleBadgeColor(role)} text-white`}>
                        {getRoleLabel(role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-purple-200">
                      {new Date(user.created_at).toLocaleDateString('bg-BG')}
                    </TableCell>
                    {userRole === 'super_admin' && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-purple-600 text-purple-200 hover:bg-purple-900"
                                onClick={() => {
                                  setEditingUser(user);
                                  setNewRole(role);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-800 border-purple-700">
                              <DialogHeader>
                                <DialogTitle className="text-white">Редактиране на роля</DialogTitle>
                                <DialogDescription className="text-purple-200">
                                  Променете ролята на {user.full_name || user.username}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="role" className="text-right text-purple-200">
                                    Роля
                                  </Label>
                                  <Select value={newRole} onValueChange={setNewRole}>
                                    <SelectTrigger className="col-span-3 bg-slate-700 border-purple-600 text-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="user">Потребител</SelectItem>
                                      <SelectItem value="moderator">Модератор</SelectItem>
                                      <SelectItem value="admin">Администратор</SelectItem>
                                      <SelectItem value="super_admin">Супер админ</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={() => editingUser && updateUserRole(editingUser.user_id, newRole)}
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  Запази промените
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}