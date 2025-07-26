import { Heart, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const links = {
    platform: [
      { name: "Как работи", href: "#" },
      { name: "Стаи", href: "#" },
      { name: "Турнири", href: "#" },
      { name: "Класиране", href: "#" },
    ],
    support: [
      { name: "Помощ", href: "#" },
      { name: "Често задавани въпроси", href: "#" },
      { name: "Контакти", href: "#" },
      { name: "Правила", href: "#" },
    ],
    legal: [
      { name: "Общи условия", href: "#" },
      { name: "Поверителност", href: "#" },
      { name: "Отговорна игра", href: "#" },
    ],
  };

  return (
    <footer className="bg-section-background backdrop-blur-sm border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gradient">Glowter</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Най-иновативната платформа за футболни прогнози. 
              Превърнете знанията си в награди!
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@glowter.bg</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+359 888 123 456</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>София, България</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Платформа</h4>
            <ul className="space-y-2">
              {links.platform.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-muted-foreground hover:text-secondary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Поддръжка</h4>
            <ul className="space-y-2">
              {links.support.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-muted-foreground hover:text-secondary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Правна информация</h4>
            <ul className="space-y-2">
              {links.legal.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-muted-foreground hover:text-secondary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2024 Glowter. Всички права запазени.
          </p>
          <div className="flex items-center space-x-1 text-muted-foreground text-sm mt-4 md:mt-0">
            <span>Направено с</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span>в България</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;