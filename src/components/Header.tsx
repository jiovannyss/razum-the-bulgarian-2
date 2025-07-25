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
  MessageCircle
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  
  return (
    <>
      {/* Sticky Header with Title and Navigation */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section: Logo */}
            <div className="flex items-center">
              <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-secondary-glow to-secondary bg-clip-text text-transparent">
                Glowter - Live Prediction
              </h1>
            </div>
            
            {/* Right Section: User Area */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full text-xs flex items-center justify-center text-black font-bold">
                  3
                </div>
              </Button>
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      JP
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 text-red-600">
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Mobile Menu - Hidden since tabs are now always visible */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-border/30">
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
          <div className="md:hidden border-t border-border/30">
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
      <div className="h-24 bg-muted/20 border-b border-border/30 flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Advertisement Space</div>
      </div>
    </>
  );
};

export default Header;