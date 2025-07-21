import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Target, 
  Users, 
  Zap, 
  Menu,
  User,
  Settings,
  LogOut,
  Crown,
  Bell,
  TrendingUp
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
  const userPoints = 1247;
  const userRank = "Gold";
  
  return (
    <header className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div>
              <span className="text-2xl font-bold text-gradient">
                Glowter
              </span>
              <div className="text-sm text-muted-foreground">Live Prediction</div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 text-foreground hover:text-primary transition-all duration-200 font-medium"
            >
              <Zap className="w-4 h-4" />
              Live Scores
            </button>
            <button 
              onClick={() => navigate('/available-leagues')}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-200"
            >
              <Trophy className="w-4 h-4" />
              Available Leagues
            </button>
            <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-200">
              <Target className="w-4 h-4" />
              My Predictions
            </a>
            <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-200">
              <Trophy className="w-4 h-4" />
              Special Games
            </a>
            <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-200">
              <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center text-xs">💬</div>
              Chat
            </a>
          </nav>
          
          {/* CTA Button */}
          <div className="hidden md:block">
            <Button 
              variant="hero" 
              size="lg"
              className="px-8 py-3 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
              onClick={() => navigate('/make-prediction')}
            >
              <TrendingUp className="w-6 h-6 mr-2" />
              Make Prediction
            </Button>
          </div>
          
          {/* User Section */}
          <div className="flex items-center gap-4">
            {/* User Stats */}
            <div className="hidden md:flex items-center gap-3">
              <Badge variant="secondary" className="gap-1">
                <Crown className="w-3 h-3" />
                {userRank}
              </Badge>
              <div className="text-right">
                <div className="text-sm font-semibold text-foreground">{userPoints.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>
            </div>
            
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
                  <span className="hidden sm:inline">John Player</span>
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
            
            {/* Mobile Menu */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-border/50">
            <nav className="flex flex-col gap-3">
              <button 
                onClick={() => navigate('/')} 
                className="flex items-center gap-2 text-foreground hover:text-primary transition-all duration-200 p-2 rounded-lg hover:bg-muted/50 w-full text-left"
              >
                <Zap className="w-4 h-4" />
                Live Scores
              </button>
              <button 
                onClick={() => navigate('/available-leagues')}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-200 p-2 rounded-lg hover:bg-muted/50 w-full text-left"
              >
                <Trophy className="w-4 h-4" />
                Available Leagues
              </button>
              <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-200 p-2 rounded-lg hover:bg-muted/50">
                <Target className="w-4 h-4" />
                My Predictions
              </a>
              <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-200 p-2 rounded-lg hover:bg-muted/50">
                <Trophy className="w-4 h-4" />
                Special Games
              </a>
              <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-200 p-2 rounded-lg hover:bg-muted/50">
                <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center text-xs">💬</div>
                Chat
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;