"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, Zap, Shield, Users } from "lucide-react";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleLogin = () => {
    // Prototype: OAuth integration placeholder
    // In production, this would redirect to Google OAuth flow
    // window.location.href = '/api/auth/google';
  };

  const handleGitHubLogin = () => {
    // Prototype: OAuth integration placeholder
    // In production, this would redirect to GitHub OAuth flow
    // window.location.href = '/api/auth/github';
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding & Features (hidden on mobile) */}
      <div className="
        hidden lg:flex lg:w-1/2 xl:w-[55%]
        relative
        flex-col
        justify-between
        p-12 xl:p-16
        bg-floor-panel
        overflow-hidden
      ">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Gradient orbs */}
          <div className="
            absolute top-[-10%] left-[-10%]
            w-[600px] h-[600px]
            rounded-full
            bg-floor-highlight/15
            blur-[150px]
          " />
          <div className="
            absolute bottom-[-20%] right-[-10%]
            w-[500px] h-[500px]
            rounded-full
            bg-gradient-purple/10
            blur-[120px]
          " />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-grid opacity-20" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link
            href="/"
            className="
              inline-flex items-center gap-3
              text-floor-text hover:text-white
              transition-colors duration-200
              group
            "
          >
            <div className="
              relative
              w-10 h-10
              rounded-xl
              bg-gradient-to-br from-floor-highlight via-gradient-purple to-gradient-pink
              flex items-center justify-center
              shadow-glow-blue
              group-hover:shadow-glow-purple
              transition-shadow duration-300
            ">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">AgentFloor</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-lg">
          <h1
            className={`
              text-4xl xl:text-5xl font-bold
              leading-tight
              mb-6
              transform transition-all duration-700 ease-out
              ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
            `}
          >
            <span className="text-floor-text">Build together with</span>
            <br />
            <span className="
              bg-gradient-to-r from-floor-highlight via-gradient-purple to-gradient-pink
              bg-clip-text text-transparent
            ">
              intelligent AI teams
            </span>
          </h1>

          <p
            className={`
              text-lg text-floor-muted
              leading-relaxed
              mb-10
              transform transition-all duration-700 ease-out delay-100
              ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
            `}
          >
            Watch your AI agents collaborate in real-time, each with unique personalities
            and specialized skills working together in a virtual workspace.
          </p>

          {/* Feature List */}
          <div
            className={`
              flex flex-col gap-5
              transform transition-all duration-700 ease-out delay-200
              ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
            `}
          >
            <FeatureItem
              icon={<Users className="w-5 h-5" />}
              title="Multi-agent collaboration"
              description="Agents work together, share context, and divide tasks"
            />
            <FeatureItem
              icon={<Zap className="w-5 h-5" />}
              title="Real-time visibility"
              description="See what each agent is thinking and doing live"
            />
            <FeatureItem
              icon={<Shield className="w-5 h-5" />}
              title="Enterprise-grade security"
              description="Your data stays private with end-to-end encryption"
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className={`
            relative z-10
            text-sm text-floor-subtle
            transform transition-all duration-700 ease-out delay-300
            ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
        >
          Trusted by teams building the future of AI-assisted development
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="
        w-full lg:w-1/2 xl:w-[45%]
        flex flex-col
        justify-center
        px-6 sm:px-12 lg:px-16 xl:px-20
        py-12
        bg-floor-bg
      ">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-10">
          <Link
            href="/"
            className="
              inline-flex items-center gap-2.5
              text-floor-text hover:text-white
              transition-colors duration-200
            "
          >
            <div className="
              w-9 h-9
              rounded-lg
              bg-gradient-to-br from-floor-highlight via-gradient-purple to-gradient-pink
              flex items-center justify-center
              shadow-glow-blue
            ">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">AgentFloor</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Header */}
          <div
            className={`
              mb-8
              transform transition-all duration-500 ease-out
              ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
            `}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-floor-text mb-2">
              Welcome back
            </h2>
            <p className="text-floor-muted">
              Sign in to continue to your workspace
            </p>
          </div>

          {/* OAuth Buttons */}
          <div
            className={`
              mb-6
              transform transition-all duration-500 ease-out delay-75
              ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
            `}
          >
            <OAuthButtons
              onGoogleClick={handleGoogleLogin}
              onGitHubClick={handleGitHubLogin}
            />
          </div>

          {/* Divider */}
          <div
            className={`
              flex items-center gap-4 mb-6
              transform transition-all duration-500 ease-out delay-100
              ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
            `}
          >
            <div className="flex-1 h-px bg-floor-border" />
            <span className="text-sm text-floor-subtle font-medium px-2">
              or continue with email
            </span>
            <div className="flex-1 h-px bg-floor-border" />
          </div>

          {/* Login Form */}
          <div
            className={`
              transform transition-all duration-500 ease-out delay-150
              ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
            `}
          >
            <LoginForm />
          </div>
        </div>

        {/* Footer Links - Mobile */}
        <div
          className={`
            lg:hidden
            mt-12
            text-center text-sm text-floor-subtle
            transform transition-all duration-500 ease-out delay-200
            ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
        >
          <p>
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-floor-muted hover:text-floor-text transition-colors">
              Terms of Service
            </Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-floor-muted hover:text-floor-text transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 group">
      <div className="
        flex-shrink-0
        w-10 h-10
        rounded-xl
        bg-floor-card
        border border-floor-border
        flex items-center justify-center
        text-floor-highlight
        group-hover:border-floor-highlight/50
        group-hover:shadow-glow-blue
        transition-all duration-300
      ">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-floor-text mb-0.5">{title}</h3>
        <p className="text-sm text-floor-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
