"use client";

import { useState, useCallback, FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2, ArrowRight } from "lucide-react";

interface LoginFormProps {
  onSubmit?: (data: { email: string; password: string; rememberMe: boolean }) => Promise<void>;
  className?: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function LoginForm({ onSubmit, className = "" }: LoginFormProps) {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  });

  // Validation
  const validateEmail = useCallback((value: string): string | undefined => {
    if (!value) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Please enter a valid email address";
    return undefined;
  }, []);

  const validatePassword = useCallback((value: string): string | undefined => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    return undefined;
  }, []);

  const validateForm = useCallback((): boolean => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({
      email: emailError,
      password: passwordError,
    });

    return !emailError && !passwordError;
  }, [email, password, validateEmail, validatePassword]);

  // Handle blur for touched state
  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate on blur
    if (field === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    } else {
      setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ email: true, password: true });

    // Validate
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (onSubmit) {
        await onSubmit({ email, password, rememberMe });
      } else {
        // Demo mode - simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        // For demo, always show success (in real app, would redirect)
        console.log("Login submitted:", { email, rememberMe });
      }
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "Login failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const showEmailError = touched.email && errors.email;
  const showPasswordError = touched.password && errors.password;

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-5 ${className}`} noValidate>
      {/* General Error Alert */}
      {errors.general && (
        <div
          role="alert"
          className="
            flex items-center gap-3
            p-4
            rounded-xl
            bg-red-500/10
            border border-red-500/30
            text-red-400
            animate-[fadeIn_0.3s_ease-out]
          "
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{errors.general}</p>
        </div>
      )}

      {/* Email Input */}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-floor-text">
          Email address
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Mail className={`w-5 h-5 transition-colors duration-200 ${
              showEmailError ? "text-red-400" : "text-floor-muted"
            }`} />
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (touched.email) {
                setErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
              }
            }}
            onBlur={() => handleBlur("email")}
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isLoading}
            aria-invalid={showEmailError ? "true" : "false"}
            aria-describedby={showEmailError ? "email-error" : undefined}
            className={`
              w-full
              pl-12 pr-4 py-3.5
              rounded-xl
              bg-floor-card
              border
              text-floor-text
              placeholder:text-floor-subtle
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-floor-bg
              disabled:opacity-50 disabled:cursor-not-allowed
              ${showEmailError
                ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/30"
                : "border-floor-border hover:border-floor-muted focus:border-floor-highlight focus:ring-floor-highlight/30"
              }
            `}
          />
        </div>
        {showEmailError && (
          <p id="email-error" role="alert" className="flex items-center gap-1.5 text-sm text-red-400">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.email}
          </p>
        )}
      </div>

      {/* Password Input */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-floor-text">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-floor-highlight hover:text-floor-highlight/80 transition-colors"
            tabIndex={-1}
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Lock className={`w-5 h-5 transition-colors duration-200 ${
              showPasswordError ? "text-red-400" : "text-floor-muted"
            }`} />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (touched.password) {
                setErrors((prev) => ({ ...prev, password: validatePassword(e.target.value) }));
              }
            }}
            onBlur={() => handleBlur("password")}
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={isLoading}
            aria-invalid={showPasswordError ? "true" : "false"}
            aria-describedby={showPasswordError ? "password-error" : undefined}
            className={`
              w-full
              pl-12 pr-12 py-3.5
              rounded-xl
              bg-floor-card
              border
              text-floor-text
              placeholder:text-floor-subtle
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-floor-bg
              disabled:opacity-50 disabled:cursor-not-allowed
              ${showPasswordError
                ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/30"
                : "border-floor-border hover:border-floor-muted focus:border-floor-highlight focus:ring-floor-highlight/30"
              }
            `}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            className="
              absolute right-4 top-1/2 -translate-y-1/2
              text-floor-muted hover:text-floor-text
              transition-colors duration-200
              focus:outline-none focus:text-floor-text
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {showPasswordError && (
          <p id="password-error" role="alert" className="flex items-center gap-1.5 text-sm text-red-400">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.password}
          </p>
        )}
      </div>

      {/* Remember Me Checkbox */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading}
            className="
              peer
              w-5 h-5
              rounded-md
              bg-floor-card
              border border-floor-border
              text-floor-highlight
              cursor-pointer
              transition-all duration-200
              hover:border-floor-muted
              focus:outline-none focus:ring-2 focus:ring-floor-highlight/30 focus:ring-offset-2 focus:ring-offset-floor-bg
              checked:bg-floor-highlight checked:border-floor-highlight
              disabled:opacity-50 disabled:cursor-not-allowed
              appearance-none
            "
          />
          {/* Custom checkmark */}
          <svg
            className="
              absolute left-0.5 top-0.5
              w-4 h-4
              pointer-events-none
              opacity-0 peer-checked:opacity-100
              text-white
              transition-opacity duration-200
            "
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2.5-2.5a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"
              fill="currentColor"
            />
          </svg>
        </div>
        <label
          htmlFor="remember-me"
          className="text-sm text-floor-muted cursor-pointer select-none hover:text-floor-text transition-colors"
        >
          Remember me for 30 days
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="
          group relative
          flex items-center justify-center gap-2
          w-full
          mt-2
          px-6 py-4
          rounded-xl
          font-semibold text-base
          text-white
          bg-floor-highlight
          shadow-glow-blue
          transition-all duration-300
          hover:bg-floor-highlight/90
          hover:shadow-[0_0_40px_rgba(0,112,243,0.4)]
          focus:outline-none focus:ring-2 focus:ring-floor-highlight/50 focus:ring-offset-2 focus:ring-offset-floor-bg
          disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-floor-highlight disabled:hover:shadow-glow-blue
          overflow-hidden
        "
      >
        {/* Loading spinner or text */}
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <span className="relative z-10">Sign in</span>
            <ArrowRight className="
              relative z-10
              w-5 h-5
              transform transition-transform duration-300
              group-hover:translate-x-1
            " />
          </>
        )}

        {/* Shimmer effect */}
        {!isLoading && (
          <div className="
            absolute inset-0
            bg-gradient-to-r from-transparent via-white/20 to-transparent
            translate-x-[-100%]
            group-hover:translate-x-[100%]
            transition-transform duration-700
          " />
        )}
      </button>

      {/* Sign Up Link */}
      <p className="text-center text-sm text-floor-muted mt-2">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="
            font-medium
            text-floor-highlight
            hover:text-floor-highlight/80
            transition-colors duration-200
          "
        >
          Sign up for free
        </Link>
      </p>
    </form>
  );
}

export default LoginForm;
