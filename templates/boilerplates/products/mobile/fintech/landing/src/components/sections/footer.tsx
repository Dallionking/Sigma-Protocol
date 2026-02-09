import { Icons, AppLogo } from "@/components/icons";
import { siteConfig } from "@/lib/config";
import Link from "next/link";

const footerLinks = [
  { href: "#features", text: "Features" },
  { href: "#pricing", text: "Pricing" },
  { href: "#faq", text: "FAQ" },
  { href: "#waitlist", text: "Join Waitlist" },
];

const socialLinks = [
  { icon: <Icons.twitter className="w-5 h-5" />, href: siteConfig.links.twitter, label: "Twitter" },
  { icon: <Icons.discord className="w-5 h-5" />, href: siteConfig.links.discord, label: "Discord" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border/50 bg-background/50">
      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-4 py-12 max-w-[var(--max-container-width)]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo & Brand */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                <AppLogo size={40} />
              </div>
              <span className="font-display font-bold text-xl text-primary">
                {siteConfig.name}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground text-center md:text-left max-w-xs">
              AI-powered trading intelligence for the modern trader.
            </p>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-wrap justify-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {link.text}
              </Link>
            ))}
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Trading Platform. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
