"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface PageHeaderProps {
  title?: string;
  description?: string;
  showBreadcrumbs?: boolean;
  showThemeToggle?: boolean;
  actions?: React.ReactNode;
}

/**
 * Page Header
 * 
 * Header component for app pages with breadcrumbs, back button, and theme toggle.
 * Uses theme-aware colors for proper dark/light mode support.
 * 
 * @stable since 1.0.0
 */
export function PageHeader({
  title,
  description,
  showBreadcrumbs = true,
  showThemeToggle = true,
  actions,
}: PageHeaderProps) {
  const pathname = usePathname();
  
  // Generate breadcrumbs from pathname
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    return { href, label };
  });

  // Check if we can go back
  const canGoBack = segments.length > 1;
  const backHref = canGoBack ? "/" + segments.slice(0, -1).join("/") : "/app";

  return (
    <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Back Button */}
          {canGoBack && (
            <Link
              href={backHref}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
          )}

          {/* Breadcrumbs */}
          {showBreadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center gap-1">
                  {index > 0 && (
                    <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
                  )}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-foreground font-medium">{crumb.label}</span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {actions}
          {showThemeToggle && <ThemeToggle />}
        </div>
      </div>

      {/* Optional title and description below breadcrumbs */}
      {(title || description) && (
        <div className="mt-4">
          {title && <h1 className="text-2xl font-bold text-foreground">{title}</h1>}
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
      )}
    </div>
  );
}
