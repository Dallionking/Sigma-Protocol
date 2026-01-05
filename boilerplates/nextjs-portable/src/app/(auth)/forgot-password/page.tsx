"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

/**
 * Forgot Password Page
 * 
 * Password reset request form.
 * 
 * @module auth
 */
export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement actual password reset with useAuth hook
    console.log("Reset password:", { email });
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
          <Mail className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground mt-2">
            We sent a password reset link to <strong>{email}</strong>
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Didn't receive the email? Check your spam folder or{" "}
          <button
            onClick={() => setSubmitted(false)}
            className="text-purple-600 hover:underline"
          >
            try again
          </button>
        </p>
        <Link href="/login">
          <Button variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/login"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to login
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Forgot your password?</h1>
        <p className="text-muted-foreground mt-2">
          No worries, we'll send you reset instructions.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-background"
            required
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </div>
  );
}

