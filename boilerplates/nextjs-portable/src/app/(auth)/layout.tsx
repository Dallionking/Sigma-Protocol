import Link from "next/link";

/**
 * Auth Layout
 * 
 * Centered layout for authentication pages.
 * Clean, minimal design focused on the auth form.
 * 
 * @module auth
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple Header */}
      <header className="p-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600" />
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            SSS SaaS
          </span>
        </Link>
      </header>

      {/* Centered Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Simple Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        <p>
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </footer>
    </div>
  );
}

