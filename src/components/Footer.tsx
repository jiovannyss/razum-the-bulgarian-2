import { Heart, Mail, Phone, MapPin, Plus, Minus } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";

const Footer = () => {
  const [openMobile, setOpenMobile] = useState<string | undefined>(undefined);
  
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
        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 mb-8">
          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground text-sm">Platform</h4>
            <ul className="space-y-1">
              {links.platform.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-muted-foreground hover:text-secondary transition-colors text-xs"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground text-sm">Support</h4>
            <ul className="space-y-1">
              {links.support.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-muted-foreground hover:text-secondary transition-colors text-xs"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground text-sm">Legal Information</h4>
            <ul className="space-y-1">
              {links.legal.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-muted-foreground hover:text-secondary transition-colors text-xs"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mobile Layout - Accordion */}
        <div className="md:hidden mb-8">
          <Accordion type="single" value={openMobile} onValueChange={setOpenMobile} collapsible>
            <AccordionItem value="platform" className="border-border">
              <AccordionTrigger className="text-sm font-medium hover:text-secondary">
                Platform
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pb-2">
                  {links.platform.map((link) => (
                    <li key={link.name}>
                      <a 
                        href={link.href}
                        className="text-muted-foreground hover:text-secondary transition-colors text-xs block"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="support" className="border-border">
              <AccordionTrigger className="text-sm font-medium hover:text-secondary">
                Support
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pb-2">
                  {links.support.map((link) => (
                    <li key={link.name}>
                      <a 
                        href={link.href}
                        className="text-muted-foreground hover:text-secondary transition-colors text-xs block"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="legal" className="border-border">
              <AccordionTrigger className="text-sm font-medium hover:text-secondary">
                Legal Information
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pb-2">
                  {links.legal.map((link) => (
                    <li key={link.name}>
                      <a 
                        href={link.href}
                        className="text-muted-foreground hover:text-secondary transition-colors text-xs block"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Contact and Copyright */}
        <div className="border-t border-border pt-6 text-center space-y-3">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground text-sm">
            <Mail className="h-4 w-4" />
            <span>info@glowter.bg</span>
          </div>
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} Glowter. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;