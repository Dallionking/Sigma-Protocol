"use client";

import { useState, useCallback, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { PasswordStrength } from "./PasswordStrength";

interface FormData {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  acceptTerms?: string;
  general?: string;
}

export function SignupForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback(
    (name: keyof FormData, value: string | boolean): string | undefined => {
      switch (name) {
        case "name":
          if (!value || (typeof value === "string" && value.trim().length === 0)) {
            return "Name is required";
          }
          if (typeof value === "string" && value.trim().length < 2) {
            return "Name must be at least 2 characters";
          }
          break;
        case "email":
          if (!value || (typeof value === "string" && value.trim().length === 0)) {
            return "Email is required";
          }
          if (typeof value === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return "Please enter a valid email address";
          }
          break;
        case "password":
          if (!value || (typeof value === "string" && value.length === 0)) {
            return "Password is required";
          }
          if (typeof value === "string" && value.length < 8) {
            return "Password must be at least 8 characters";
          }
          break;
        case "acceptTerms":
          if (!value) {
            return "You must accept the terms and conditions";
          }
          break;
      }
      return undefined;
    },
    []
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === "checkbox" ? checked : value;

      setFormData((prev) => ({ ...prev, [name]: fieldValue }));

      // Clear error on change if field was touched
      if (touched[name]) {
        const error = validateField(name as keyof FormData, fieldValue);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === "checkbox" ? checked : value;

      setTouched((prev) => ({ ...prev, [name]: true }));
      const error = validateField(name as keyof FormData, fieldValue);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateField]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: FormErrors = {};
    (Object.keys(formData) as Array<keyof FormData>).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    setTouched({ name: true, email: true, password: true, acceptTerms: true });

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // On success, redirect would happen here
      console.log("Signup successful:", formData);
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthClick = (provider: "google" | "github") => {
    console.log(`OAuth signup with ${provider}`);
    // OAuth redirect would happen here
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* OAuth Buttons */}
      <div className="space-y-3 mb-8">
        <button
          type="button"
          onClick={() => handleOAuthClick("google")}
          disabled={isLoading}
          className="
            w-full
            flex items-center justify-center gap-3
            px-4 py-3
            rounded-xl
            bg-floor-card
            border border-floor-border
            text-floor-text font-medium
            hover:border-floor-muted
            hover:bg-floor-accent
            focus:outline-none focus:ring-2 focus:ring-floor-highlight focus:ring-offset-2 focus:ring-offset-floor-bg
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            group
          "
          aria-label="Sign up with Google"
        >
          {/* Google Icon */}
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
            aria-hidden="true"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <button
          type="button"
          onClick={() => handleOAuthClick("github")}
          disabled={isLoading}
          className="
            w-full
            flex items-center justify-center gap-3
            px-4 py-3
            rounded-xl
            bg-floor-card
            border border-floor-border
            text-floor-text font-medium
            hover:border-floor-muted
            hover:bg-floor-accent
            focus:outline-none focus:ring-2 focus:ring-floor-highlight focus:ring-offset-2 focus:ring-offset-floor-bg
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            group
          "
          aria-label="Sign up with GitHub"
        >
          {/* GitHub Icon */}
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
            aria-hidden="true"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span>Continue with GitHub</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-floor-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-floor-bg text-floor-subtle">or continue with email</span>
        </div>
      </div>

      {/* General Error */}
      {errors.general && (
        <div
          role="alert"
          className="
            mb-6 p-4
            rounded-xl
            bg-gradient-pink/10
            border border-gradient-pink/30
            text-gradient-pink text-sm
            flex items-center gap-3
            animate-[shake_0.5s_ease-in-out]
          "
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 flex-shrink-0"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{errors.general}</span>
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Name Field */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-floor-text">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Jane Smith"
            autoComplete="name"
            disabled={isLoading}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={`
              w-full
              px-4 py-3
              rounded-xl
              bg-floor-card
              border
              ${
                errors.name && touched.name
                  ? "border-gradient-pink focus:border-gradient-pink focus:ring-gradient-pink/30"
                  : "border-floor-border focus:border-floor-highlight focus:ring-floor-highlight/30"
              }
              text-floor-text placeholder:text-floor-subtle
              focus:outline-none focus:ring-2
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            `}
          />
          {errors.name && touched.name && (
            <p id="name-error" className="text-sm text-gradient-pink flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                <path d="M8 15A7 7 0 108 1a7 7 0 000 14zm0-9.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 5.5zm0 7a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              {errors.name}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-floor-text">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="jane@company.com"
            autoComplete="email"
            disabled={isLoading}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={`
              w-full
              px-4 py-3
              rounded-xl
              bg-floor-card
              border
              ${
                errors.email && touched.email
                  ? "border-gradient-pink focus:border-gradient-pink focus:ring-gradient-pink/30"
                  : "border-floor-border focus:border-floor-highlight focus:ring-floor-highlight/30"
              }
              text-floor-text placeholder:text-floor-subtle
              focus:outline-none focus:ring-2
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            `}
          />
          {errors.email && touched.email && (
            <p id="email-error" className="text-sm text-gradient-pink flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                <path d="M8 15A7 7 0 108 1a7 7 0 000 14zm0-9.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 5.5zm0 7a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-floor-text">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Create a strong password"
              autoComplete="new-password"
              disabled={isLoading}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : "password-strength"}
              className={`
                w-full
                px-4 py-3 pr-12
                rounded-xl
                bg-floor-card
                border
                ${
                  errors.password && touched.password
                    ? "border-gradient-pink focus:border-gradient-pink focus:ring-gradient-pink/30"
                    : "border-floor-border focus:border-floor-highlight focus:ring-floor-highlight/30"
                }
                text-floor-text placeholder:text-floor-subtle
                focus:outline-none focus:ring-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
              `}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="
                absolute right-3 top-1/2 -translate-y-1/2
                p-1.5
                rounded-lg
                text-floor-subtle hover:text-floor-muted
                hover:bg-floor-accent
                focus:outline-none focus:ring-2 focus:ring-floor-highlight
                transition-colors duration-200
              "
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                  <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
          {errors.password && touched.password && (
            <p id="password-error" className="text-sm text-gradient-pink flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                <path d="M8 15A7 7 0 108 1a7 7 0 000 14zm0-9.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 5.5zm0 7a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              {errors.password}
            </p>
          )}
          <div id="password-strength">
            <PasswordStrength password={formData.password} className="mt-3" />
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                aria-invalid={!!errors.acceptTerms}
                aria-describedby={errors.acceptTerms ? "terms-error" : undefined}
                className="
                  sr-only peer
                "
              />
              <div
                className={`
                  w-5 h-5
                  rounded-md
                  border
                  ${
                    errors.acceptTerms && touched.acceptTerms
                      ? "border-gradient-pink"
                      : "border-floor-border group-hover:border-floor-muted"
                  }
                  bg-floor-card
                  peer-checked:bg-floor-highlight peer-checked:border-floor-highlight
                  peer-focus:ring-2 peer-focus:ring-floor-highlight peer-focus:ring-offset-2 peer-focus:ring-offset-floor-bg
                  transition-all duration-200
                  flex items-center justify-center
                `}
              >
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  className={`
                    w-3 h-3 text-white
                    ${formData.acceptTerms ? "opacity-100 scale-100" : "opacity-0 scale-50"}
                    transition-all duration-200
                  `}
                >
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <span className="text-sm text-floor-muted leading-relaxed">
              I agree to the{" "}
              <Link
                href="/terms"
                className="text-floor-highlight hover:underline focus:outline-none focus:underline"
                tabIndex={-1}
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-floor-highlight hover:underline focus:outline-none focus:underline"
                tabIndex={-1}
              >
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.acceptTerms && touched.acceptTerms && (
            <p id="terms-error" className="text-sm text-gradient-pink flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                <path d="M8 15A7 7 0 108 1a7 7 0 000 14zm0-9.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 5.5zm0 7a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              {errors.acceptTerms}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="
            w-full
            relative
            px-6 py-3.5
            rounded-xl
            font-semibold
            text-white
            bg-floor-highlight
            hover:bg-floor-highlight/90
            shadow-glow-blue
            hover:shadow-[0_0_30px_rgba(0,112,243,0.5)]
            focus:outline-none focus:ring-2 focus:ring-floor-highlight focus:ring-offset-2 focus:ring-offset-floor-bg
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-glow-blue
            transition-all duration-300
            overflow-hidden
            group
          "
        >
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-floor-highlight">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="sr-only">Creating account...</span>
            </div>
          )}

          {/* Button Text */}
          <span
            className={`
              flex items-center justify-center gap-2
              ${isLoading ? "opacity-0" : "opacity-100"}
              transition-opacity duration-200
            `}
          >
            <span>Create Account</span>
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-200"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>
      </form>

      {/* Login Link */}
      <p className="mt-8 text-center text-sm text-floor-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="
            text-floor-highlight font-medium
            hover:underline
            focus:outline-none focus:underline
            transition-colors duration-200
          "
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
