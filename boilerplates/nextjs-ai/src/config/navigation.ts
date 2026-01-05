/**
 * Navigation Configuration
 * 
 * Centralized navigation items for sidebar, header, and footer.
 * Modules can be enabled/disabled here to add/remove nav items.
 * 
 * @module config/navigation
 */

import {
  Home,
  Settings,
  CreditCard,
  Shield,
  MessageSquare,
  List,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string;
  roleRequired?: string;
  disabled?: boolean;
}

export interface NavSection {
  title: string | null;
  items: NavItem[];
}

// ============================================
// HEADER NAVIGATION (Marketing)
// ============================================

export const headerNav: NavItem[] = [
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Docs", href: "/docs" },
];

export const headerAuthNav: NavItem[] = [
  { label: "Login", href: "/login" },
  { label: "Sign Up", href: "/signup" },
];

// ============================================
// SIDEBAR NAVIGATION (App)
// ============================================

export const sidebarNav: NavSection[] = [
  {
    title: null,
    items: [
      { label: "Dashboard", href: "/app", icon: Home },
    ],
  },
  {
    title: "Features",
    items: [
      { label: "AI Chat", href: "/app/chat", icon: MessageSquare },
      // PRUNED: { label: "Items", href: "/app/items", icon: List },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Settings", href: "/app/settings", icon: Settings },
      { label: "Billing", href: "/app/billing", icon: CreditCard },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Admin", href: "/app/admin", icon: Shield, roleRequired: "admin" },
    ],
  },
];

// ============================================
// FOOTER NAVIGATION
// ============================================

export const footerNav = {
  product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Changelog", href: "/changelog" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  resources: [
    { label: "Documentation", href: "/docs" },
    { label: "Help Center", href: "/help" },
    { label: "API Reference", href: "/api" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Cookies", href: "/cookies" },
  ],
};

// ============================================
// MODULE FEATURE FLAGS
// ============================================

export const enabledModules = {
  marketing: true,
  auth: true,
  dashboard: true,
  settings: true,
  billing: true,
  admin: true,
  aiChat: true, // AI Chat is enabled by default in nextjs-ai template
  crudExample: false, // Enable to add Items to sidebar
} as const;

/**
 * Get filtered sidebar nav based on enabled modules and user role
 */
export function getFilteredSidebarNav(userRole?: string): NavSection[] {
  return sidebarNav
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // Filter by role if required
        if (item.roleRequired && userRole !== item.roleRequired) {
          return false;
        }
        // Filter by disabled state
        if (item.disabled) {
          return false;
        }
        return true;
      }),
    }))
    .filter((section) => section.items.length > 0);
}

