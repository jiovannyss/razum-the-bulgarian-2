import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Cleanup function за auth state
const cleanupAuthState = () => {
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: '',
    nationality: '',
    phone: '',
    gender: '',
    birthDate: ''
  });
  const [error, setError] = useState<string | null>(null);

  // Валидация на паролата
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('Паролата трябва да е поне 8 символа');
    if (!/[A-Z]/.test(password)) errors.push('Трябва да съдържа поне една главна буква');
    if (!/[a-z]/.test(password)) errors.push('Трябва да съдържа поне една малка буква');
    if (!/\d/.test(password)) errors.push('Трябва да съдържа поне една цифра');
    return errors;
  };

  // Валидация на възрастта
  const validateAge = (birthDate: string): boolean => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  useEffect(() => {
    // Проверяваме дали потребителят вече е логнат
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Валидация на паролата
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        setError('Паролата не отговаря на изискванията:\n' + passwordErrors.join('\n'));
        return;
      }

      // Проверка за съвпадение на паролите
      if (formData.password !== formData.confirmPassword) {
        setError('Паролите не съвпадат');
        return;
      }

      // Валидация на възрастта
      if (!validateAge(formData.birthDate)) {
        setError('Трябва да сте навършили поне 18 години');
        return;
      }

      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.fullName,
            username: formData.username,
            nationality: formData.nationality,
            phone: formData.phone,
            gender: formData.gender,
            birth_date: formData.birthDate
          }
        }
      });

      if (error) {
        // По-добро съобщение за грешка при съществуващ имейл
        if (error.message.includes('User already registered')) {
          setError('Потребител с този имейл вече съществува. Опитайте да влезете в профила си.');
        } else {
          throw error;
        }
        return;
      }

      if (data.user) {
        if (data.user.email_confirmed_at) {
          toast({
            title: "Успешна регистрация!",
            description: "Добре дошли в платформата!",
          });
          window.location.href = '/';
        } else {
          toast({
            title: "Регистрацията е успешна!",
            description: "Моля проверете имейла си за потвърждение.",
          });
        }
      }
    } catch (error: any) {
      console.error('Error during signup:', error);
      setError(error.message || 'Възникна грешка при регистрацията');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!formData.email) {
      setError('Моля въведете имейл адрес');
      return;
    }

    setIsResettingPassword(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth`
      });

      if (error) throw error;

      setResetEmailSent(true);
      toast({
        title: "Имейл за възстановяване изпратен",
        description: "Проверете пощата си за линк за възстановяване на паролата.",
      });
    } catch (error: any) {
      console.error('Error during password reset:', error);
      setError(error.message || 'Възникна грешка при изпращането на имейла');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Успешен вход!",
          description: "Добре дошли обратно!",
        });
        // Force page reload for clean state
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error('Error during signin:', error);
      setError(error.message || 'Възникна грешка при влизането');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-foreground to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button 
          onClick={() => navigate('/')} 
          variant="outline" 
          size="sm"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад към началото
        </Button>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Добре дошли!</CardTitle>
            <CardDescription>
              Влезте в профила си или се регистрирайте
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Вход</TabsTrigger>
                <TabsTrigger value="signup">Регистрация</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin" className="space-y-4 mt-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Имейл адрес</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="име@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Парола</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Вашата парола"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Влизане...' : 'Влезте в профила'}
                  </Button>
                  <div className="mt-4 text-center">
                    <Button 
                      type="button" 
                      variant="link" 
                      size="sm"
                      onClick={handlePasswordReset}
                      disabled={isResettingPassword || !formData.email}
                    >
                      {isResettingPassword ? 'Изпращане...' : 'Забравена парола?'}
                    </Button>
                    {resetEmailSent && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Имейл за възстановяване е изпратен!
                      </p>
                    )}
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname">Пълно име</Label>
                    <Input
                      id="signup-fullname"
                      type="text"
                      placeholder="Вашето пълно име"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Потребителско име</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="потребителско_име"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Имейл адрес</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="име@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-nationality">Националност</Label>
                    <Input
                      id="signup-nationality"
                      type="text"
                      placeholder="България"
                      value={formData.nationality}
                      onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Телефон</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+359 888 123 456"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-gender">Пол</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Изберете пол" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Мъж</SelectItem>
                        <SelectItem value="female">Жена</SelectItem>
                        <SelectItem value="other">Друго</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-birthdate">Дата на раждане</Label>
                    <Input
                      id="signup-birthdate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      required
                    />
                    <p className="text-sm text-muted-foreground">Трябва да сте навършили поне 18 години</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Парола</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Поне 8 символа, цифри, главни и малки букви"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                        minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Потвърдете паролата</Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Повторете паролата"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Регистриране...' : 'Създайте профил'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}