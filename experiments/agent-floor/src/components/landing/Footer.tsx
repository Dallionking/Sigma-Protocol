"use client";

import Link from "next/link";
import { Github, Twitter, MessageCircle } from "lucide-react";

interface FooterProps {
  className?: string;
}

const footerLinks = {
  product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Changelog", href: "/changelog" },
    { label: "Roadmap", href: "/roadmap" },
  ],
  resources: [
    { label: "Documentation", href: "/docs" },
    { label: "API Reference", href: "/docs/api" },
    { label: "Examples", href: "/examples" },
    { label: "Blog", href: "/blog" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Brand", href: "/brand" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Security", href: "/security" },
  ],
};

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/agentfloor",
    icon: <Github className="w-5 h-5" />,
  },
  {
    label: "Twitter",
    href: "https://twitter.com/agentfloor",
    icon: <Twitter className="w-5 h-5" />,
  },
  {
    label: "Discord",
    href: "https://discord.gg/agentfloor",
    icon: <MessageCircle className="w-5 h-5" />,
  },
];

export function Footer({ className = "" }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className={`
        relative
        border-t border-floor-border
        bg-floor-bg
        ${className}
      `}
    >
      {/* Top gradient line */}
      <div
        className="
          absolute top-0 left-0 right-0
          h-[1px]
          bg-gradient-to-r from-transparent via-floor-highlight/50 to-transparent
        "
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
            {/* Brand column */}
            <div className="col-span-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 group"
                aria-label="AgentFloor home"
              >
                {/* Logo mark */}
                <div
                  className="
                    w-8 h-8
                    rounded-lg
                    bg-gradient-to-br from-floor-highlight to-gradient-purple
                    flex items-center justify-center
                    transition-transform duration-300
                    group-hover:scale-110
                  "
                >
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-lg font-semibold text-floor-text">
                  AgentFloor
                </span>
              </Link>

              <p className="mt-4 text-floor-muted text-sm leading-relaxed max-w-xs">
                Build with AI teams. Watch your agents think, collaborate, and
                ship code together in real-time.
              </p>

              {/* Social links */}
              <div className="flex items-center gap-4 mt-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="
                      text-floor-subtle
                      hover:text-floor-text
                      transition-colors duration-200
                    "
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Product links */}
            <div>
              <h3 className="text-sm font-semibold text-floor-text mb-4">
                Product
              </h3>
              <FooterLinkList links={footerLinks.product} />
            </div>

            {/* Resources links */}
            <div>
              <h3 className="text-sm font-semibold text-floor-text mb-4">
                Resources
              </h3>
              <FooterLinkList links={footerLinks.resources} />
            </div>

            {/* Company links */}
            <div>
              <h3 className="text-sm font-semibold text-floor-text mb-4">
                Company
              </h3>
              <FooterLinkList links={footerLinks.company} />
            </div>

            {/* Legal links */}
            <div>
              <h3 className="text-sm font-semibold text-floor-text mb-4">
                Legal
              </h3>
              <FooterLinkList links={footerLinks.legal} />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="
            py-6
            border-t border-floor-border/50
            flex flex-col sm:flex-row
            items-center justify-between
            gap-4
          "
        >
          {/* Copyright */}
          <p className="text-floor-subtle text-sm">
            &copy; {currentYear} AgentFloor. All rights reserved.
          </p>

          {/* Status indicator */}
          <div className="flex items-center gap-6">
            <a
              href="https://status.agentfloor.com"
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-2
                text-floor-subtle hover:text-floor-muted
                text-sm
                transition-colors duration-200
              "
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="
                    animate-ping
                    absolute inline-flex
                    h-full w-full
                    rounded-full
                    bg-gradient-cyan
                    opacity-75
                  "
                />
                <span
                  className="
                    relative inline-flex
                    rounded-full
                    h-2 w-2
                    bg-gradient-cyan
                  "
                />
              </span>
              All systems operational
            </a>

            {/* Theme toggle placeholder */}
            <button
              type="button"
              aria-label="Toggle theme"
              className="
                text-floor-subtle hover:text-floor-muted
                transition-colors duration-200
              "
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom glow effect */}
      <div
        className="
          absolute bottom-0 left-1/2 -translate-x-1/2
          w-[600px] h-[200px]
          rounded-full
          bg-floor-highlight/5
          blur-[100px]
          pointer-events-none
        "
      />
    </footer>
  );
}

function FooterLinkList({
  links,
}: {
  links: { label: string; href: string }[];
}) {
  return (
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="
              text-floor-muted
              hover:text-floor-text
              text-sm
              transition-colors duration-200
              inline-flex items-center gap-1
              group
            "
          >
            <span>{link.label}</span>
            <svg
              className="
                w-3 h-3
                opacity-0 -translate-x-1
                group-hover:opacity-100 group-hover:translate-x-0
                transition-all duration-200
              "
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default Footer;
