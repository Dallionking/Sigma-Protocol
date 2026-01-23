"use client";

import { useMemo } from "react";

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface StrengthCheck {
  label: string;
  test: (password: string) => boolean;
}

const strengthChecks: StrengthCheck[] = [
  { label: "8+ characters", test: (p) => p.length >= 8 },
  { label: "Uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "Number", test: (p) => /\d/.test(p) },
  { label: "Special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

function getStrengthInfo(score: number): {
  label: string;
  color: string;
  bgColor: string;
  glowColor: string;
} {
  if (score === 0) {
    return {
      label: "",
      color: "text-floor-subtle",
      bgColor: "bg-floor-border",
      glowColor: "",
    };
  }
  if (score <= 2) {
    return {
      label: "Weak",
      color: "text-gradient-pink",
      bgColor: "bg-gradient-pink",
      glowColor: "shadow-[0_0_8px_rgba(255,0,128,0.4)]",
    };
  }
  if (score <= 3) {
    return {
      label: "Fair",
      color: "text-gradient-orange",
      bgColor: "bg-gradient-orange",
      glowColor: "shadow-[0_0_8px_rgba(245,166,35,0.4)]",
    };
  }
  if (score <= 4) {
    return {
      label: "Good",
      color: "text-floor-highlight",
      bgColor: "bg-floor-highlight",
      glowColor: "shadow-[0_0_8px_rgba(0,112,243,0.4)]",
    };
  }
  return {
    label: "Strong",
    color: "text-gradient-cyan",
    bgColor: "bg-gradient-cyan",
    glowColor: "shadow-[0_0_8px_rgba(80,227,194,0.4)]",
  };
}

export function PasswordStrength({ password, className = "" }: PasswordStrengthProps) {
  const { score, passedChecks } = useMemo(() => {
    const passed = strengthChecks.filter((check) => check.test(password));
    return {
      score: passed.length,
      passedChecks: new Set(passed.map((c) => c.label)),
    };
  }, [password]);

  const strengthInfo = getStrengthInfo(score);

  if (!password) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-floor-border rounded-full overflow-hidden">
          <div
            className={`
              h-full rounded-full
              ${strengthInfo.bgColor}
              ${strengthInfo.glowColor}
              transition-all duration-500 ease-out
            `}
            style={{ width: `${(score / strengthChecks.length) * 100}%` }}
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={strengthChecks.length}
            aria-label={`Password strength: ${strengthInfo.label || "None"}`}
          />
        </div>
        {strengthInfo.label && (
          <span
            className={`
              text-xs font-medium
              ${strengthInfo.color}
              min-w-[3.5rem]
              transition-colors duration-300
            `}
          >
            {strengthInfo.label}
          </span>
        )}
      </div>

      {/* Requirements Checklist */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {strengthChecks.map((check) => {
          const passed = passedChecks.has(check.label);
          return (
            <div
              key={check.label}
              className={`
                flex items-center gap-2
                text-xs
                transition-all duration-300
                ${passed ? "text-floor-muted" : "text-floor-subtle"}
              `}
            >
              {/* Animated Check/Circle Icon */}
              <div className="relative w-3.5 h-3.5 flex-shrink-0">
                {passed ? (
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className={`
                      w-full h-full
                      text-gradient-cyan
                      animate-[scale-in_0.2s_ease-out]
                    `}
                  >
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path
                      d="M5 8l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className="w-full h-full text-floor-border"
                  >
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                )}
              </div>
              <span>{check.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
