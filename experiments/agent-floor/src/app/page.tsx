import Link from "next/link";
import { Navigation } from "@/components/landing/Navigation";
import { Hero } from "@/components/landing/Hero";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-floor-bg">
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="
          sr-only
          focus:not-sr-only
          focus:absolute focus:top-4 focus:left-4 focus:z-[100]
          focus:px-4 focus:py-2
          focus:bg-floor-highlight focus:text-white
          focus:rounded-lg
          focus:outline-none focus:ring-2 focus:ring-floor-highlight
        "
      >
        Skip to main content
      </a>

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main id="main-content" role="main" className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Features Preview Section */}
        <section
          aria-label="Key features"
          className="relative border-t border-floor-border"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="
                text-3xl sm:text-4xl font-bold
                text-floor-text
                mb-4
              ">
                How it works
              </h2>
              <p className="text-lg text-floor-muted max-w-2xl mx-auto">
                Visualize your AI team collaborating in real-time, with full
                transparency into their reasoning and actions.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                title="Real-time Visualization"
                description="Watch your AI agents move around the office, collaborate at desks, and communicate with each other."
                gradient="from-floor-highlight to-gradient-purple"
              />
              <FeatureCard
                title="Multi-Provider Support"
                description="Use Claude, GPT-4, or your own Claude Code CLI. Mix and match providers for different agent roles."
                gradient="from-gradient-purple to-gradient-pink"
              />
              <FeatureCard
                title="Thought Transparency"
                description="See what each agent is thinking with comic-style thought bubbles and full conversation history."
                gradient="from-gradient-pink to-gradient-orange"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          aria-label="Call to action"
          className="relative border-t border-floor-border"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
            <h2 className="
              text-3xl sm:text-4xl font-bold
              text-floor-text
              mb-6
            ">
              Ready to build with AI teams?
            </h2>
            <p className="text-lg text-floor-muted mb-10 max-w-xl mx-auto">
              Join developers who are shipping faster with coordinated AI agents.
            </p>
            <Link
              href="/signup"
              className="
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
              "
            >
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer role="contentinfo" className="border-t border-floor-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <p className="text-floor-subtle text-sm">
              &copy; {new Date().getFullYear()} AgentFloor
            </p>

            {/* Footer Links */}
            <nav aria-label="Footer navigation">
              <ul className="flex items-center gap-6">
                <li>
                  <Link
                    href="/privacy"
                    className="
                      text-floor-subtle hover:text-floor-muted
                      text-sm
                      transition-colors duration-200
                    "
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="
                      text-floor-subtle hover:text-floor-muted
                      text-sm
                      transition-colors duration-200
                    "
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="
                      text-floor-subtle hover:text-floor-muted
                      text-sm
                      transition-colors duration-200
                    "
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="
                      text-floor-subtle hover:text-floor-muted
                      text-sm
                      transition-colors duration-200
                    "
                  >
                    Docs
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  gradient
}: {
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="
      group
      relative
      p-6 sm:p-8
      rounded-2xl
      bg-floor-card
      border border-floor-border
      hover:border-floor-muted/50
      transition-all duration-300
    ">
      {/* Gradient accent */}
      <div className={`
        absolute top-0 left-0 right-0
        h-1
        rounded-t-2xl
        bg-gradient-to-r ${gradient}
        opacity-0 group-hover:opacity-100
        transition-opacity duration-300
      `} />

      {/* Content */}
      <h3 className="
        text-xl font-semibold
        text-floor-text
        mb-3
      ">
        {title}
      </h3>
      <p className="text-floor-muted leading-relaxed">
        {description}
      </p>
    </div>
  );
}
