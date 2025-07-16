import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Trophy, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: "Стаи", href: "#", icon: Users },
    { name: "Класиране", href: "#", icon: Trophy },
    { name: "Статистики", href: "#", icon: TrendingUp },
  ];

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gradient">Glowter</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-1 text-muted-foreground hover:text-secondary transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </a>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost">Вход</Button>
            <Button variant="hero">Регистрация</Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          "md:hidden transition-all duration-300 ease-in-out",
          isMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        )}>
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border mt-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 text-muted-foreground hover:text-secondary transition-colors block px-3 py-2 rounded-md"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </a>
            ))}
            <div className="flex flex-col space-y-2 px-3 pt-4">
              <Button variant="ghost" className="w-full">Вход</Button>
              <Button variant="hero" className="w-full">Регистрация</Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;