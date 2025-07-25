import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Target, 
  Zap, 
  Menu,
  User,
  Settings,
  LogOut,
  Bell,
  Home
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
  
  return (
    <header className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section: Navigation */}
          <div className="flex items-center gap-6">
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Button
                variant="hero"
                size="sm"
                onClick={() => navigate('/')} 
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
              <Button 
                variant="hero"
                size="sm"
                className="gap-2"
              >
                <Target className="w-4 h-4" />
                My Predictions
              </Button>
              <Button 
                variant="hero"
                size="sm"
                className="gap-2"
              >
                <Trophy className="w-4 h-4" />
                Special Games
              </Button>
              <Button 
                variant="hero"
                size="sm"
                className="gap-2"
              >
                <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center text-xs">💬</div>
                Chat
              </Button>
            </nav>
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
              <Button
                variant="hero"
                size="sm"
                onClick={() => navigate('/')} 
                className="gap-2 justify-start"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
              <Button 
                variant="hero"
                size="sm"
                className="gap-2 justify-start"
              >
                <Target className="w-4 h-4" />
                My Predictions
              </Button>
              <Button 
                variant="hero"
                size="sm"
                className="gap-2 justify-start"
              >
                <Trophy className="w-4 h-4" />
                Special Games
              </Button>
              <Button 
                variant="hero"
                size="sm"
                className="gap-2 justify-start"
              >
                <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center text-xs">💬</div>
                Chat
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;