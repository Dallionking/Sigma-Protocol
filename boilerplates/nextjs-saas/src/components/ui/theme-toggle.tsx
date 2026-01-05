"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * Theme Toggle
 * 
 * Toggle between light, dark, and system themes.
 * Uses theme-aware colors for proper styling.
 * 
 * @stable since 1.0.0
 */
export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("w-9 h-9 rounded-lg bg-muted animate-pulse", className)} />
    );
  }

  const themes = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  const currentTheme = themes.find((t) => t.value === theme) || themes[1];
  const CurrentIcon = currentTheme.icon;

  const cycleTheme = () => {
    const currentIndex = themes.findIndex((t) => t.value === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].value);
  };

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg transition-colors",
        "bg-muted hover:bg-accent text-muted-foreground hover:text-foreground",
        className
      )}
      title={`Current theme: ${currentTheme.label}. Click to switch.`}
    >
      <CurrentIcon className="w-5 h-5" />
      {showLabel && <span className="text-sm">{currentTheme.label}</span>}
    </button>
  );
}

/**
 * Theme Toggle Expanded
 * 
 * Shows all three theme options as buttons.
 */
export function ThemeToggleExpanded({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const themes = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div className={cn("flex gap-1 p-1 bg-muted rounded-lg", className)}>
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
            theme === value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          title={label}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
