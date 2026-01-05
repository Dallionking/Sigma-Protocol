"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getFilteredSidebarNav, type NavSection } from "@/config/navigation";
import { ChevronLeft, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  userRole?: string;
}

/**
 * App Sidebar
 * 
 * Collapsible sidebar navigation for the authenticated app shell.
 * Supports sections, icons, role-based filtering, and responsive collapse.
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
        "fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/app" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600" />
            <span className="text-lg font-bold">SSS SaaS</span>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600" />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "rounded-md p-1.5 hover:bg-muted transition-transform",
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
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
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

      {/* User Section */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-foreground",
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

