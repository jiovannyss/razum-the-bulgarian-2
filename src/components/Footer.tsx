import { Heart, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const links = {
    platform: [
      { name: "How it works", href: "#" },
      { name: "Rooms", href: "#" },
      { name: "Tournaments", href: "#" },
      { name: "Leaderboard", href: "#" },
    ],
    support: [
      { name: "Help", href: "#" },
      { name: "FAQ", href: "#" },
      { name: "Contacts", href: "#" },
      { name: "Rules", href: "#" },
    ],
    legal: [
      { name: "Terms of Service", href: "#" },
      { name: "Privacy Policy", href: "#" },
      { name: "Responsible Gaming", href: "#" },
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
              The most innovative platform for football predictions. 
              Turn your knowledge into rewards and prestige!
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@glowter.bg</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Platform</h4>
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
            <h4 className="font-semibold text-foreground">Support</h4>
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
            <h4 className="font-semibold text-foreground">Legal Information</h4>
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
        <div className="border-t border-border mt-12 pt-8 flex justify-center items-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Glowter. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;