import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, Check, Sparkles, Zap, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';

/**
 * Landing Page
 * 
 * Marketing homepage with hero, features, and CTA.
 * 
 * @module marketing
 */
export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              SSS TanStack
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Login
            </Link>
            <Link 
              to="/signup" 
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700"
            >
              Get Started
            </Link>
          </nav>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-background to-blue-50 dark:from-purple-950/20 dark:via-background dark:to-blue-950/20" />
        
        <div className="container relative px-4">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium bg-background shadow-sm">
              <Sparkles className="mr-2 h-4 w-4 text-purple-600" />
              <span>Built with TanStack Start</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Full-stack SaaS{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                with SSR power
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
              Production-ready boilerplate with TanStack Start, Supabase auth, 
              Stripe payments, and type-safe routing.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/app"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium border rounded-lg hover:bg-muted"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stop reinventing the wheel. Focus on what makes your product unique.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl border p-8 hover:border-purple-500/50 transition-colors"
              >
                <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-3">
                  <feature.icon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SSS TanStack. Built with SSS Methodology.</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Shield,
    title: "TanStack Start SSR",
    description: "Server-side rendering with type-safe routing and automatic code splitting.",
  },
  {
    icon: Zap,
    title: "Supabase Auth",
    description: "Complete authentication with email, OAuth, and row-level security.",
  },
  {
    icon: Sparkles,
    title: "Stripe Payments",
    description: "Subscription billing, one-time payments, and usage-based pricing.",
  },
  {
    icon: Shield,
    title: "React Query",
    description: "Powerful data fetching with caching, background updates, and optimistic UI.",
  },
  {
    icon: Zap,
    title: "Type-Safe Routes",
    description: "Full TypeScript support with autocomplete for routes and params.",
  },
  {
    icon: Sparkles,
    title: "Modern Stack",
    description: "Tailwind CSS, Radix UI, and all the modern tooling you need.",
  },
];
