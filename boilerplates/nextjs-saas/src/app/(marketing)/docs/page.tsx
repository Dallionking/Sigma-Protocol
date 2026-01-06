"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";

const docCategories = [
  {
    icon: "🚀",
    title: "Getting Started",
    slug: "getting-started",
    description: "Set up your project in under 5 minutes",
    links: [
      { label: "Installation", slug: "installation" },
      { label: "Configuration", slug: "configuration" },
      { label: "First Steps", slug: "first-steps" },
    ],
    color: "emerald",
  },
  {
    icon: "🔐",
    title: "Authentication",
    slug: "authentication",
    description: "Secure user management with Supabase",
    links: [
      { label: "Email/Password", slug: "email-password" },
      { label: "OAuth Providers", slug: "oauth-providers" },
      { label: "Session Management", slug: "session-management" },
    ],
    color: "blue",
  },
  {
    icon: "💳",
    title: "Payments",
    slug: "payments",
    description: "Stripe integration for subscriptions",
    links: [
      { label: "Checkout Flow", slug: "checkout-flow" },
      { label: "Webhooks", slug: "webhooks" },
      { label: "Customer Portal", slug: "customer-portal" },
    ],
    color: "purple",
  },
  {
    icon: "🤖",
    title: "AI Integration",
    slug: "ai-integration",
    description: "Build AI features with Vercel AI SDK",
    links: [
      { label: "Streaming Responses", slug: "streaming-responses" },
      { label: "Chat Interface", slug: "chat-interface" },
      { label: "Credits System", slug: "credits-system" },
    ],
    color: "pink",
  },
  {
    icon: "📊",
    title: "Analytics",
    slug: "analytics",
    description: "Track user behavior with PostHog",
    links: [
      { label: "Event Tracking", slug: "event-tracking" },
      { label: "Feature Flags", slug: "feature-flags" },
      { label: "A/B Testing", slug: "ab-testing" },
    ],
    color: "orange",
  },
  {
    icon: "📧",
    title: "Email",
    slug: "email",
    description: "Transactional emails with Resend",
    links: [
      { label: "Templates", slug: "templates" },
      { label: "Sending Emails", slug: "sending-emails" },
      { label: "Webhooks", slug: "webhooks" },
    ],
    color: "cyan",
  },
];

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchMessage, setShowSearchMessage] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchMessage(true);
      setTimeout(() => setShowSearchMessage(false), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-6">
              Documentation
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Build faster with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                our guides
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Everything you need to get started, integrate features, and ship
              your product.
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-20 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
              <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-700 rounded text-xs text-slate-400">
                ⌘K
              </kbd>
            </div>
            {showSearchMessage && (
              <p className="text-center text-emerald-400 mt-3 text-sm animate-pulse">
                Full-text search coming soon! Browse categories below.
              </p>
            )}
          </form>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docCategories.map((category) => (
              <div
                key={category.slug}
                className="group p-6 bg-slate-800/30 border border-slate-700/50 rounded-2xl hover:border-slate-600 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  {category.title}
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  {category.description}
                </p>
                <ul className="space-y-2">
                  {category.links.map((link) => (
                    <li key={link.slug}>
                      <Link
                        href={`/docs/${category.slug}/${link.slug}`}
                        className="text-sm text-slate-500 hover:text-emerald-400 transition-colors flex items-center gap-2"
                      >
                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
