"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    // Simulate auth callback processing
    const timer = setTimeout(() => {
      setStatus("success");
      // In a real app, this would process the OAuth callback
      // and redirect to the dashboard
      setTimeout(() => {
        router.push("/app");
      }, 1500);
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-6">
      <div className="text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-slate-700 border-t-emerald-500 animate-spin" />
            <h1 className="text-2xl font-semibold text-white mb-2">
              Completing sign in...
            </h1>
            <p className="text-slate-400">Please wait while we verify your credentials.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-emerald-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-white mb-2">
              Sign in successful!
            </h1>
            <p className="text-slate-400">Redirecting you to your dashboard...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-white mb-2">
              Authentication failed
            </h1>
            <p className="text-slate-400 mb-6">Something went wrong. Please try again.</p>
            <a
              href="/login"
              className="inline-flex px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
            >
              Back to Login
            </a>
          </>
        )}
      </div>
    </div>
  );
}

