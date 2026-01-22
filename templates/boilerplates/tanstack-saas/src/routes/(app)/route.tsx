import { createFileRoute, Outlet, Link, useLocation } from '@tanstack/react-router';
import { Home, Settings, CreditCard, Shield, ChevronLeft, LogOut } from 'lucide-react';
import { useState } from 'react';

/**
 * App Layout Route
 * 
 * Authenticated app shell with sidebar navigation.
 * 
 * @module dashboard
 */
export const Route = createFileRoute('/(app)')({
  component: AppLayout,
});

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', href: '/app', icon: Home },
    { label: 'Settings', href: '/app/settings', icon: Settings },
    { label: 'Billing', href: '/app/billing', icon: CreditCard },
    { label: 'Admin', href: '/app/admin', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && (
            <Link to="/app" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600" />
              <span className="text-lg font-bold">SSS</span>
            </Link>
          )}
          {collapsed && (
            <div className="mx-auto h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600" />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`rounded-md p-1.5 hover:bg-muted transition-transform ${
              collapsed ? 'rotate-180' : ''
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <button
            className={`w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${collapsed ? 'pl-16' : 'pl-64'}`}>
        <main className="min-h-screen p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

