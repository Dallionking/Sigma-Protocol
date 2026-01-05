export default function DocsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero */}
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
              Everything you need to get started, integrate features, and ship your product.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <input
                type="text"
                placeholder="Search documentation..."
                className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
              <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-700 rounded text-xs text-slate-400">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Doc Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🚀",
                title: "Getting Started",
                description: "Set up your project in under 5 minutes",
                links: ["Installation", "Configuration", "First Steps"],
                color: "emerald",
              },
              {
                icon: "🔐",
                title: "Authentication",
                description: "Secure user management with Supabase",
                links: ["Email/Password", "OAuth Providers", "Session Management"],
                color: "blue",
              },
              {
                icon: "💳",
                title: "Payments",
                description: "Stripe integration for subscriptions",
                links: ["Checkout Flow", "Webhooks", "Customer Portal"],
                color: "purple",
              },
              {
                icon: "🤖",
                title: "AI Integration",
                description: "Build AI features with Vercel AI SDK",
                links: ["Streaming Responses", "Chat Interface", "Credits System"],
                color: "pink",
              },
              {
                icon: "📊",
                title: "Analytics",
                description: "Track user behavior with PostHog",
                links: ["Event Tracking", "Feature Flags", "A/B Testing"],
                color: "orange",
              },
              {
                icon: "📧",
                title: "Email",
                description: "Transactional emails with Resend",
                links: ["Templates", "Sending Emails", "Webhooks"],
                color: "cyan",
              },
            ].map((category, i) => (
              <div
                key={i}
                className="group p-6 bg-slate-800/30 border border-slate-700/50 rounded-2xl hover:border-slate-600 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  {category.title}
                </h3>
                <p className="text-slate-400 text-sm mb-4">{category.description}</p>
                <ul className="space-y-2">
                  {category.links.map((link, j) => (
                    <li key={j}>
                      <a
                        href="#"
                        className="text-sm text-slate-500 hover:text-emerald-400 transition-colors flex items-center gap-2"
                      >
                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                        {link}
                      </a>
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

