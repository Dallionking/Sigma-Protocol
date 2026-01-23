"use client";

import { useEffect, useState, useRef } from "react";
import { Users, ListTodo, Coins, ArrowRight } from "lucide-react";

interface FeaturesProps {
  className?: string;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  glowColor: string;
  index: number;
  isVisible: boolean;
}

export function Features({ className = "" }: FeaturesProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "AI Collaboration",
      description:
        "Watch your AI agents coordinate in real-time. Assign roles, see their reasoning, and guide collaboration through an intuitive interface.",
      gradient: "from-floor-highlight via-gradient-cyan to-floor-highlight",
      glowColor: "rgba(0, 112, 243, 0.4)",
    },
    {
      icon: <ListTodo className="w-6 h-6" />,
      title: "Task Management",
      description:
        "Kanban boards, priority queues, and automatic task distribution. Your AI team stays organized and focused on what matters.",
      gradient: "from-gradient-purple via-gradient-pink to-gradient-purple",
      glowColor: "rgba(121, 40, 202, 0.4)",
    },
    {
      icon: <Coins className="w-6 h-6" />,
      title: "Token Analytics",
      description:
        "Track usage across providers with detailed cost breakdowns. Optimize spending while maximizing output quality.",
      gradient: "from-gradient-orange via-gradient-pink to-gradient-orange",
      glowColor: "rgba(245, 166, 35, 0.4)",
    },
  ];

  return (
    <section
      ref={sectionRef}
      aria-labelledby="features-heading"
      className={`
        relative
        border-t border-floor-border
        overflow-hidden
        ${className}
      `}
    >
      {/* Background effects */}
      <FeaturesBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div
            className={`
              inline-flex items-center gap-2
              px-4 py-1.5
              rounded-full
              bg-floor-card/50
              border border-floor-border
              backdrop-blur-sm
              mb-6
              transform transition-all duration-700 ease-out
              ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
            `}
            style={{ transitionDelay: "0ms" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gradient-cyan opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-cyan" />
            </span>
            <span className="text-sm text-floor-muted">Core Features</span>
          </div>

          <h2
            id="features-heading"
            className={`
              text-3xl sm:text-4xl lg:text-5xl
              font-bold tracking-tight
              text-floor-text
              mb-6
              transform transition-all duration-700 ease-out
              ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
            `}
            style={{ transitionDelay: "100ms" }}
          >
            How it works
          </h2>

          <p
            className={`
              text-lg sm:text-xl
              text-floor-muted
              max-w-2xl mx-auto
              leading-relaxed
              transform transition-all duration-700 ease-out
              ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
            `}
            style={{ transitionDelay: "200ms" }}
          >
            Visualize your AI team collaborating in real-time, with full
            transparency into their reasoning and actions.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              {...feature}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>

        {/* Bottom accent */}
        <div
          className={`
            mt-20 text-center
            transform transition-all duration-700 ease-out
            ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
          style={{ transitionDelay: "600ms" }}
        >
          <a
            href="/docs"
            className="
              group
              inline-flex items-center gap-2
              text-floor-muted hover:text-floor-text
              text-sm font-medium
              transition-colors duration-200
            "
          >
            <span>Explore all features in the docs</span>
            <ArrowRight className="
              w-4 h-4
              transform transition-transform duration-200
              group-hover:translate-x-1
            " />
          </a>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
  glowColor,
  index,
  isVisible,
}: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group
        relative
        p-8
        rounded-2xl
        bg-floor-card/80
        backdrop-blur-sm
        border border-floor-border
        transition-all duration-500 ease-out
        hover:border-floor-muted/60
        hover:bg-floor-card
        transform
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
      `}
      style={{
        transitionDelay: `${300 + index * 100}ms`,
        boxShadow: isHovered
          ? `0 20px 40px -10px ${glowColor}, 0 0 60px -20px ${glowColor}`
          : "none",
      }}
    >
      {/* Gradient border on hover */}
      <div
        className={`
          absolute inset-0
          rounded-2xl
          p-[1px]
          bg-gradient-to-r ${gradient}
          opacity-0 group-hover:opacity-100
          transition-opacity duration-500
          -z-10
        `}
      >
        <div className="w-full h-full rounded-2xl bg-floor-card" />
      </div>

      {/* Top gradient accent line */}
      <div
        className={`
          absolute top-0 left-8 right-8
          h-[2px]
          bg-gradient-to-r ${gradient}
          opacity-0 group-hover:opacity-100
          transition-all duration-500
          transform origin-center
          group-hover:left-4 group-hover:right-4
        `}
      />

      {/* Icon container */}
      <div className="mb-6 relative">
        <div
          className={`
            w-14 h-14
            flex items-center justify-center
            rounded-xl
            bg-floor-accent
            border border-floor-border
            text-floor-text
            transition-all duration-300
            group-hover:border-transparent
            group-hover:bg-gradient-to-br ${gradient.replace('from-', 'from-').split(' ')[0]}/20
          `}
        >
          {icon}
        </div>

        {/* Floating particles on hover */}
        <div
          className={`
            absolute -top-1 -right-1
            w-2 h-2
            rounded-full
            bg-gradient-to-r ${gradient}
            opacity-0 group-hover:opacity-100
            transition-all duration-500 delay-100
            transform group-hover:-translate-y-2 group-hover:translate-x-2
          `}
        />
        <div
          className={`
            absolute top-2 -right-2
            w-1.5 h-1.5
            rounded-full
            bg-gradient-to-r ${gradient}
            opacity-0 group-hover:opacity-100
            transition-all duration-500 delay-200
            transform group-hover:-translate-y-1 group-hover:translate-x-1
          `}
        />
      </div>

      {/* Content */}
      <h3
        className="
          text-xl font-semibold
          text-floor-text
          mb-3
          transition-colors duration-300
        "
      >
        {title}
      </h3>

      <p
        className="
          text-floor-muted
          leading-relaxed
          text-[15px]
        "
      >
        {description}
      </p>

      {/* Learn more link */}
      <div
        className="
          mt-6 pt-4
          border-t border-floor-border/50
          opacity-0 group-hover:opacity-100
          transform translate-y-2 group-hover:translate-y-0
          transition-all duration-300
        "
      >
        <span
          className={`
            inline-flex items-center gap-1.5
            text-sm font-medium
            bg-gradient-to-r ${gradient}
            bg-clip-text text-transparent
          `}
        >
          Learn more
          <ArrowRight className="w-3.5 h-3.5 text-floor-muted" />
        </span>
      </div>
    </article>
  );
}

function FeaturesBackground() {
  return (
    <>
      {/* Subtle grid */}
      <div
        className="
          absolute inset-0
          bg-grid
          opacity-20
          pointer-events-none
        "
      />

      {/* Gradient orbs */}
      <div
        className="
          absolute top-[20%] left-[10%]
          w-[300px] h-[300px]
          rounded-full
          bg-floor-highlight/10
          blur-[100px]
          pointer-events-none
        "
      />
      <div
        className="
          absolute bottom-[20%] right-[10%]
          w-[250px] h-[250px]
          rounded-full
          bg-gradient-purple/10
          blur-[100px]
          pointer-events-none
        "
      />

      {/* Top fade from hero */}
      <div
        className="
          absolute top-0 left-0 right-0
          h-32
          bg-gradient-to-b from-floor-bg to-transparent
          pointer-events-none
        "
      />
    </>
  );
}

export default Features;
