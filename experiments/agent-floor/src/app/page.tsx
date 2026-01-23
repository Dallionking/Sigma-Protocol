import Link from "next/link";
import { Navigation } from "@/components/landing/Navigation";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";

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

        {/* Features Section */}
        <Features />

        {/* CTA Section */}
        <section
          aria-label="Call to action"
          className="relative border-t border-floor-border overflow-hidden"
        >
          {/* Background effects */}
          <div
            className="
              absolute inset-0
              bg-gradient-to-b from-floor-bg via-floor-panel to-floor-bg
              pointer-events-none
            "
          />
          <div
            className="
              absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              w-[800px] h-[400px]
              rounded-full
              bg-floor-highlight/10
              blur-[150px]
              pointer-events-none
            "
          />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
            {/* Eyebrow */}
            <div
              className="
                inline-flex items-center gap-2
                px-3 py-1
                rounded-full
                bg-floor-card/50
                border border-floor-border
                backdrop-blur-sm
                mb-8
              "
            >
              <span className="text-xs font-medium text-floor-muted">
                Join the waitlist
              </span>
              <span
                className="
                  px-2 py-0.5
                  rounded-full
                  text-xs font-semibold
                  bg-gradient-to-r from-floor-highlight to-gradient-purple
                  text-white
                "
              >
                Early Access
              </span>
            </div>

            <h2
              className="
                text-3xl sm:text-4xl lg:text-5xl
                font-bold
                text-floor-text
                mb-6
                leading-tight
              "
            >
              Ready to build with{" "}
              <span
                className="
                  bg-gradient-to-r from-floor-highlight via-gradient-purple to-gradient-pink
                  bg-clip-text text-transparent
                "
              >
                AI teams
              </span>
              ?
            </h2>

            <p className="text-lg text-floor-muted mb-10 max-w-xl mx-auto leading-relaxed">
              Join developers who are shipping faster with coordinated AI
              agents. No credit card required.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
                {/* Shimmer effect */}
                <div
                  className="
                    absolute inset-0
                    bg-gradient-to-r from-transparent via-white/20 to-transparent
                    translate-x-[-100%]
                    group-hover:translate-x-[100%]
                    transition-transform duration-700
                  "
                />
              </Link>

              <Link
                href="/demo"
                className="
                  inline-flex items-center gap-2
                  px-6 py-3
                  rounded-xl
                  font-medium
                  text-floor-muted
                  border border-floor-border
                  hover:border-floor-muted
                  hover:text-floor-text
                  transition-all duration-200
                "
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Watch Demo
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-floor-subtle">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-gradient-cyan"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-gradient-cyan"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Free tier available</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-gradient-cyan"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
