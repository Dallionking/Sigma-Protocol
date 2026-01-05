"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getFilteredSidebarNav } from "@/config/navigation";
import { ChevronLeft, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface SidebarProps {
  userRole?: string;
}

/**
 * App Sidebar
 * 
 * Collapsible sidebar navigation for the authenticated app shell.
 * Supports sections, icons, role-based filtering, and responsive collapse.
 * Uses theme-aware colors for proper dark/light mode support.
 * 
 * @stable since 1.0.0
 */
export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const sections = getFilteredSidebarNav(userRole);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r transition-all duration-300",
        "bg-card border-border",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <Link href="/app" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500" />
            <span className="text-lg font-bold text-foreground">SSS SaaS</span>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500" />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all",
            collapsed && "rotate-180"
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 p-4 flex-1 overflow-y-auto">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.title && !collapsed && (
              <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Theme Toggle */}
      <div className="border-t border-border p-4">
        {collapsed ? (
          <ThemeToggle className="w-full justify-center" />
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        )}
      </div>

      {/* User Section */}
      <div className="border-t border-border p-4 space-y-2">
        {/* User Profile */}
        <Link
          href="/app/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
            "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            collapsed && "justify-center"
          )}
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">John Doe</div>
              <div className="text-xs text-muted-foreground truncate">john@example.com</div>
            </div>
          )}
        </Link>

        {/* Sign Out */}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}
