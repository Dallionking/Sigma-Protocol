"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface HeroProps {
  className?: string;
}

export function Hero({ className = "" }: HeroProps) {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={heroRef}
      aria-labelledby="hero-heading"
      className={`
        relative
        min-h-[90vh]
        flex items-center justify-center
        overflow-hidden
        ${className}
      `}
    >
      {/* Background Effects */}
      <HeroBackground />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center">
          {/* Badge */}
          <div
            className={`
              inline-flex items-center gap-2
              px-4 py-1.5
              rounded-full
              bg-floor-card/50
              border border-floor-border
              backdrop-blur-sm
              mb-8
              transform transition-all duration-700 ease-out
              ${isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
              }
            `}
            style={{ transitionDelay: "0ms" }}
          >
            <Sparkles className="w-4 h-4 text-gradient-purple" />
            <span className="text-sm text-floor-muted">
              Now with Claude Code Integration
            </span>
          </div>

          {/* Headline */}
          <h1
            id="hero-heading"
            className={`
              text-4xl sm:text-5xl md:text-6xl lg:text-7xl
              font-bold
              tracking-tight
              leading-[1.1]
              mb-6
              transform transition-all duration-700 ease-out
              ${isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
              }
            `}
            style={{ transitionDelay: "100ms" }}
          >
            <span className="block text-floor-text">Build with</span>
            <span className="
              block mt-2
              bg-gradient-to-r from-floor-highlight via-gradient-purple to-gradient-pink
              bg-clip-text text-transparent
              bg-[length:200%_auto]
              animate-shimmer
            ">
              AI Teams
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className={`
              text-lg sm:text-xl md:text-2xl
              text-floor-muted
              max-w-2xl mx-auto
              leading-relaxed
              mb-10
              transform transition-all duration-700 ease-out
              ${isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
              }
            `}
            style={{ transitionDelay: "200ms" }}
          >
            Watch your AI agents think, collaborate, and ship code together
            in a real-time virtual workspace.
          </p>

          {/* CTAs */}
          <div
            className={`
              flex flex-col sm:flex-row items-center justify-center gap-4
              transform transition-all duration-700 ease-out
              ${isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
              }
            `}
            style={{ transitionDelay: "300ms" }}
          >
            {/* Primary CTA */}
            <Link
              href="/signup"
              className="
                group
                relative
                inline-flex items-center gap-2
                px-8 py-4
                rounded-xl
                font-semibold text-lg
                text-white
                bg-floor-highlight
                hover:bg-floor-highlight/90
                shadow-glow-blue
                hover:shadow-[0_0_40px_rgba(0,112,243,0.4)]
                transition-all duration-300
                overflow-hidden
              "
            >
              <span className="relative z-10">Get Started Free</span>
              <ArrowRight className="
                relative z-10
                w-5 h-5
                transform transition-transform duration-300
                group-hover:translate-x-1
              " />
              {/* Shimmer effect */}
              <div className="
                absolute inset-0
                bg-gradient-to-r from-transparent via-white/20 to-transparent
                translate-x-[-100%]
                group-hover:translate-x-[100%]
                transition-transform duration-700
              " />
            </Link>

            {/* Login Link */}
            <Link
              href="/login"
              className="
                inline-flex items-center gap-2
                px-6 py-3
                text-floor-muted hover:text-floor-text
                font-medium
                transition-colors duration-200
              "
            >
              Already have an account?
              <span className="text-floor-highlight">Login</span>
            </Link>
          </div>

          {/* Trust Indicator */}
          <p
            className={`
              mt-8
              text-sm text-floor-subtle
              transform transition-all duration-700 ease-out
              ${isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
              }
            `}
            style={{ transitionDelay: "400ms" }}
          >
            No credit card required. Start building in seconds.
          </p>
        </div>

        {/* Agent Preview Teaser */}
        <div
          className={`
            mt-16 sm:mt-24
            transform transition-all duration-1000 ease-out
            ${isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
            }
          `}
          style={{ transitionDelay: "500ms" }}
        >
          <AgentPreviewTeaser />
        </div>
      </div>
    </section>
  );
}

function HeroBackground() {
  return (
    <>
      {/* Gradient orbs */}
      <div className="
        absolute top-[-20%] left-[20%]
        w-[500px] h-[500px]
        rounded-full
        bg-floor-highlight/20
        blur-[120px]
        pointer-events-none
      " />
      <div className="
        absolute top-[10%] right-[10%]
        w-[400px] h-[400px]
        rounded-full
        bg-gradient-purple/15
        blur-[100px]
        pointer-events-none
      " />
      <div className="
        absolute bottom-[10%] left-[30%]
        w-[300px] h-[300px]
        rounded-full
        bg-gradient-pink/10
        blur-[80px]
        pointer-events-none
      " />

      {/* Grid pattern */}
      <div className="
        absolute inset-0
        bg-grid
        opacity-30
        pointer-events-none
      " />

      {/* Top radial glow */}
      <div className="
        absolute inset-0
        bg-glow-top
        pointer-events-none
      " />

      {/* Bottom fade */}
      <div className="
        absolute bottom-0 left-0 right-0
        h-32
        bg-gradient-to-t from-floor-bg to-transparent
        pointer-events-none
      " />
    </>
  );
}

function AgentPreviewTeaser() {
  return (
    <div className="
      relative
      max-w-4xl mx-auto
      p-1
      rounded-2xl
      bg-gradient-to-r from-floor-highlight/50 via-gradient-purple/50 to-gradient-pink/50
    ">
      {/* Inner container */}
      <div className="
        relative
        bg-floor-card
        rounded-xl
        border border-floor-border
        overflow-hidden
      ">
        {/* Fake browser chrome */}
        <div className="
          flex items-center gap-2
          px-4 py-3
          border-b border-floor-border
          bg-floor-panel
        ">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-pink/80" />
            <div className="w-3 h-3 rounded-full bg-gradient-orange/80" />
            <div className="w-3 h-3 rounded-full bg-gradient-cyan/80" />
          </div>
          <div className="
            flex-1
            text-center
            text-xs text-floor-subtle
            font-mono
          ">
            localhost:3000/floor/dev-team
          </div>
        </div>

        {/* Preview content placeholder */}
        <div className="
          relative
          aspect-[16/9]
          bg-floor-bg
          flex items-center justify-center
        ">
          {/* Animated agent placeholders */}
          <div className="flex items-end gap-8">
            <AgentPlaceholder
              color="from-floor-highlight to-gradient-purple"
              delay="0ms"
              label="Frontend"
            />
            <AgentPlaceholder
              color="from-gradient-purple to-gradient-pink"
              delay="100ms"
              label="Backend"
            />
            <AgentPlaceholder
              color="from-gradient-cyan to-floor-highlight"
              delay="200ms"
              label="Architect"
            />
          </div>

          {/* Coming soon overlay */}
          <div className="
            absolute inset-0
            flex items-center justify-center
            bg-floor-bg/60
            backdrop-blur-sm
          ">
            <span className="
              px-4 py-2
              rounded-lg
              bg-floor-card/80
              border border-floor-border
              text-floor-muted text-sm
            ">
              Interactive preview coming soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentPlaceholder({
  color,
  delay,
  label
}: {
  color: string;
  delay: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`
          w-12 h-12 sm:w-16 sm:h-16
          rounded-full
          bg-gradient-to-br ${color}
          animate-pulse-slow
        `}
        style={{ animationDelay: delay }}
      />
      <span className="text-xs text-floor-subtle font-medium">
        {label}
      </span>
    </div>
  );
}

export default Hero;
