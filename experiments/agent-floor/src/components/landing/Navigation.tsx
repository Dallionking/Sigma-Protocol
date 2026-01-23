"use client";

import Link from "next/link";
import { Building2, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = "" }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      role="banner"
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300 ease-out
        ${isScrolled
          ? "bg-floor-bg/80 backdrop-blur-xl border-b border-floor-border shadow-lg shadow-black/20"
          : "bg-transparent"
        }
        ${className}
      `}
    >
      <nav
        aria-label="Main navigation"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="
              flex items-center gap-2.5
              text-floor-text
              hover:text-white
              transition-colors duration-200
              group
            "
          >
            <div className="
              relative
              w-8 h-8 sm:w-9 sm:h-9
              rounded-lg
              bg-gradient-to-br from-floor-highlight via-gradient-purple to-gradient-pink
              flex items-center justify-center
              shadow-glow-blue
              group-hover:shadow-glow-purple
              transition-shadow duration-300
            ">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              {/* Animated ring on hover */}
              <div className="
                absolute inset-0
                rounded-lg
                bg-gradient-to-br from-floor-highlight to-gradient-pink
                opacity-0 group-hover:opacity-30
                blur-md
                transition-opacity duration-300
              " />
            </div>
            <span className="font-semibold text-lg tracking-tight">
              AgentFloor
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/features">Features</NavLink>
            <NavLink href="/pricing">Pricing</NavLink>
            <NavLink href="/docs">Docs</NavLink>
          </div>

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="
                text-floor-muted hover:text-floor-text
                font-medium text-sm
                px-4 py-2
                transition-colors duration-200
              "
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="
                relative overflow-hidden
                px-5 py-2.5
                rounded-lg
                font-medium text-sm
                text-white
                bg-white/10
                border border-white/20
                hover:bg-white/15
                hover:border-white/30
                transition-all duration-200
                group
              "
            >
              <span className="relative z-10">Get Started</span>
              {/* Gradient shine on hover */}
              <div className="
                absolute inset-0
                bg-gradient-to-r from-transparent via-white/10 to-transparent
                translate-x-[-100%]
                group-hover:translate-x-[100%]
                transition-transform duration-500
              " />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="
              md:hidden
              p-2
              text-floor-muted hover:text-floor-text
              transition-colors duration-200
            "
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`
            md:hidden
            overflow-hidden
            transition-all duration-300 ease-out
            ${isMobileMenuOpen ? "max-h-80 pb-6" : "max-h-0"}
          `}
        >
          <div className="flex flex-col gap-2 pt-4 border-t border-floor-border">
            <MobileNavLink
              href="/features"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </MobileNavLink>
            <MobileNavLink
              href="/pricing"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </MobileNavLink>
            <MobileNavLink
              href="/docs"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Docs
            </MobileNavLink>

            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-floor-border">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="
                  text-center
                  text-floor-muted hover:text-floor-text
                  font-medium
                  px-4 py-3
                  rounded-lg
                  border border-floor-border
                  hover:border-floor-muted
                  transition-all duration-200
                "
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="
                  text-center
                  font-medium
                  px-4 py-3
                  rounded-lg
                  text-white
                  bg-floor-highlight
                  hover:bg-floor-highlight/90
                  transition-colors duration-200
                  shadow-glow-blue
                "
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

function NavLink({
  href,
  children
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="
        px-4 py-2
        text-floor-muted hover:text-floor-text
        font-medium text-sm
        rounded-lg
        hover:bg-white/5
        transition-all duration-200
      "
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="
        px-4 py-3
        text-floor-text
        font-medium
        rounded-lg
        hover:bg-white/5
        transition-colors duration-200
      "
    >
      {children}
    </Link>
  );
}

export default Navigation;
