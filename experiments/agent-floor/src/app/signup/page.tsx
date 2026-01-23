import { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Sign Up - AgentFloor",
  description: "Create your AgentFloor account and start building with AI agent teams.",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-floor-bg relative overflow-hidden">
      {/* Background Effects */}
      <div
        className="
          absolute inset-0
          bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,112,243,0.15),transparent)]
          pointer-events-none
        "
        aria-hidden="true"
      />
      <div
        className="
          absolute top-1/4 -left-1/4
          w-1/2 h-1/2
          bg-gradient-purple/5
          rounded-full
          blur-[120px]
          pointer-events-none
        "
        aria-hidden="true"
      />
      <div
        className="
          absolute bottom-1/4 -right-1/4
          w-1/2 h-1/2
          bg-floor-highlight/5
          rounded-full
          blur-[120px]
          pointer-events-none
        "
        aria-hidden="true"
      />

      {/* Skip Link for Accessibility */}
      <a
        href="#signup-form"
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
        Skip to signup form
      </a>

      {/* Header */}
      <header className="relative z-10 border-b border-floor-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="
                flex items-center gap-2
                text-floor-text font-semibold text-lg
                hover:opacity-80
                focus:outline-none focus:ring-2 focus:ring-floor-highlight focus:ring-offset-2 focus:ring-offset-floor-bg
                rounded-lg
                transition-opacity duration-200
              "
              aria-label="AgentFloor home"
            >
              <div
                className="
                  w-8 h-8
                  rounded-lg
                  bg-gradient-to-br from-floor-highlight to-gradient-purple
                  flex items-center justify-center
                  shadow-glow-blue
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-white"
                  aria-hidden="true"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span>AgentFloor</span>
            </Link>

            {/* Login Link */}
            <Link
              href="/login"
              className="
                px-4 py-2
                rounded-lg
                text-floor-muted text-sm font-medium
                hover:text-floor-text
                focus:outline-none focus:ring-2 focus:ring-floor-highlight focus:ring-offset-2 focus:ring-offset-floor-bg
                transition-colors duration-200
              "
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        id="signup-form"
        role="main"
        className="
          relative z-10
          flex-1
          flex flex-col items-center justify-center
          px-4 py-12 sm:py-16
        "
      >
        <div className="w-full max-w-md">
          {/* Header Text */}
          <div className="text-center mb-10">
            <h1
              className="
                text-3xl sm:text-4xl font-bold
                text-floor-text
                mb-3
              "
            >
              Create your account
            </h1>
            <p className="text-floor-muted text-lg">
              Start orchestrating AI agent teams in minutes
            </p>
          </div>

          {/* Form Card */}
          <div
            className="
              relative
              p-8 sm:p-10
              rounded-2xl
              bg-floor-panel/80
              backdrop-blur-xl
              border border-floor-border
              shadow-2xl shadow-black/20
            "
          >
            {/* Card Glow Effect */}
            <div
              className="
                absolute -inset-px
                rounded-2xl
                bg-gradient-to-b from-floor-highlight/10 via-transparent to-transparent
                pointer-events-none
              "
              aria-hidden="true"
            />

            <div className="relative">
              <SignupForm />
            </div>
          </div>

          {/* Security Note */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-floor-subtle">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Protected by enterprise-grade security</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        role="contentinfo"
        className="relative z-10 border-t border-floor-border/50 py-6"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-floor-subtle">
            <p>&copy; {new Date().getFullYear()} AgentFloor. All rights reserved.</p>
            <nav aria-label="Footer navigation">
              <ul className="flex items-center gap-6">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-floor-muted transition-colors duration-200"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-floor-muted transition-colors duration-200"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-floor-muted transition-colors duration-200"
                  >
                    Contact
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
