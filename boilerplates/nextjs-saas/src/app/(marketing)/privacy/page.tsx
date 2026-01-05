export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-slate-400">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>

          <div className="space-y-12">
            {[
              {
                title: "Information We Collect",
                icon: "📊",
                items: [
                  "Account information (email, name, password hash)",
                  "Usage data (features used, session duration)",
                  "Payment information (processed by Stripe)",
                  "Device information (browser type, IP address)",
                ],
              },
              {
                title: "How We Use Your Information",
                icon: "🎯",
                items: [
                  "Provide and maintain our services",
                  "Process transactions and send related information",
                  "Send promotional communications (with your consent)",
                  "Analyze usage to improve our products",
                ],
              },
              {
                title: "Data Sharing",
                icon: "🤝",
                items: [
                  "Service providers (hosting, analytics, payment processing)",
                  "Legal requirements (court orders, law enforcement)",
                  "Business transfers (mergers, acquisitions)",
                  "We never sell your personal data to third parties",
                ],
              },
              {
                title: "Data Security",
                icon: "🔒",
                items: [
                  "Encryption in transit (TLS 1.3)",
                  "Encryption at rest (AES-256)",
                  "Regular security audits",
                  "SOC 2 Type II compliance (in progress)",
                ],
              },
              {
                title: "Your Rights",
                icon: "⚖️",
                items: [
                  "Access your personal data",
                  "Correct inaccurate data",
                  "Delete your data (right to be forgotten)",
                  "Export your data (data portability)",
                  "Opt-out of marketing communications",
                ],
              },
              {
                title: "Cookies & Tracking",
                icon: "🍪",
                items: [
                  "Essential cookies (authentication, security)",
                  "Analytics cookies (PostHog, anonymized)",
                  "You can disable non-essential cookies in settings",
                  "We respect Do Not Track browser signals",
                ],
              },
            ].map((section, i) => (
              <div key={i} className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl">{section.icon}</span>
                  <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                </div>
                <ul className="space-y-3">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact Section */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
              <h2 className="text-xl font-semibold text-white mb-4">Questions about your privacy?</h2>
              <p className="text-slate-400 mb-6">
                Contact our Data Protection Officer at privacy@example.com
              </p>
              <a
                href="/contact"
                className="inline-flex px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

