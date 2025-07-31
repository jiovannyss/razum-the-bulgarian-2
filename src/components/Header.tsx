import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Target, 
  Menu,
  User,
  Settings,
  LogOut,
  Bell,
  Home,
  Users,
  MessageCircle,
  Sun,
  Moon,
  Monitor
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeProvider";
import { useAuth } from "@/contexts/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [profile, setProfile] = useState<any>(null);
  const { setTheme, theme } = useTheme();
  const { user, userRole, signOut, loading } = useAuth();

  // Load user profile data
  useEffect(() => {
    if (user) {
      const loadProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('user_id', user.id)
          .single();
        setProfile(data);
      };
      loadProfile();
    }
  }, [user]);
  
  return (
    <>
      {/* Sticky Header with Title and Navigation */}
      <header className="sticky top-2 z-[60] bg-section-background backdrop-blur-lg border-b border-purple-700/50 rounded-t-2xl border border-purple-700 border-b-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section: User avatar and name */}
            <div className="flex items-center">
              {!loading && user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 flex items-center p-1 group">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="text-xs transition-all duration-200 group-hover:bg-black group-hover:text-white">
                          {profile?.full_name ? 
                            profile.full_name.split(' ').map((n: string) => n.charAt(0)).join('').toUpperCase().slice(0, 2) :
                            user.email?.charAt(0).toUpperCase() || 'U'
                          }
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <div className="text-sm font-medium">
                          {profile?.username || user.email?.split('@')[0]}
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>
                      <div>
                        <p className="text-sm font-medium">{user.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2" onClick={() => navigate('/profile')}>
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    {(userRole === 'admin' || userRole === 'super_admin') && (
                      <DropdownMenuItem className="gap-2" onClick={() => navigate('/admin')}>
                        <Settings className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="gap-2">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="gap-2">
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span>Theme</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
                          <Sun className="h-4 w-4" />
                          <span>Light</span>
                          {theme === "light" && <span className="ml-auto text-xs">✓</span>}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
                          <Moon className="h-4 w-4" />
                          <span>Dark</span>
                          {theme === "dark" && <span className="ml-auto text-xs">✓</span>}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2">
                          <Monitor className="h-4 w-4" />
                          <span>System</span>
                          {theme === "system" && <span className="ml-auto text-xs">✓</span>}
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2 text-red-600" onClick={signOut}>
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            {/* Right Section: Notifications */}
            <div className="flex items-center gap-[1vw]">
              {!loading && (
                <>
                  {user ? (
                    <>
                      {/* Notifications - only for logged in users */}
                      <Button variant="ghost" size="sm" className="relative">
                        <Bell className="w-[4vw] h-[4vw] md:w-[3vw] md:h-[3vw] lg:w-[2vw] lg:h-[2vw]" />
                        <div className="absolute -top-1 -right-1 w-[3vw] h-[3vw] md:w-[2.5vw] md:h-[2.5vw] lg:w-[1.5vw] lg:h-[1.5vw] min-w-[1.5vw] min-h-[1.5vw] bg-destructive rounded-full text-[2vw] md:text-[1.5vw] lg:text-[1vw] flex items-center justify-center text-white font-bold">
                          3
                        </div>
                      </Button>
                    </>
                  ) : (
                    // Auth buttons for non-logged in users
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/auth')}
                      >
                        Вход
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => navigate('/auth')}
                      >
                        Регистрация
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-purple-700/30">
          <div className="container mx-auto px-4">
            <nav className="flex w-full">
              {[
                { id: "home", label: "Home", icon: Home },
                { id: "rooms", label: "Rooms", icon: Users },
                { id: "predictions", label: "Predictions", icon: Target },
                { id: "special", label: "Special", icon: Trophy },
                { id: "chat", label: "Chat", icon: MessageCircle }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id === "home") navigate('/');
                    }}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 text-xs font-medium transition-all relative
                      ${isActive 
                        ? 'text-secondary border-b-2 border-secondary glow-secondary' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/10'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs opacity-80">{tab.label}</span>
                    {isActive && (
                      <div className="absolute inset-0 bg-secondary/5 pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-purple-700/30">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col gap-3">
                {[
                  { id: "home", label: "Home", icon: Home },
                  { id: "rooms", label: "My Rooms", icon: Users },
                  { id: "predictions", label: "My Predictions", icon: Target },
                  { id: "special", label: "Special Games", icon: Trophy },
                  { id: "chat", label: "Chat", icon: MessageCircle }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        if (tab.id === "home") navigate('/');
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all
                        ${isActive 
                          ? 'text-secondary bg-secondary/10 glow-secondary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/5'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </header>
      
      {/* Ad Space - Non-sticky */}
      <div className="h-24 bg-muted/20 border-b border-purple-700/30 flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Advertisement Space</div>
      </div>
    </>
  );
};

export default Header;