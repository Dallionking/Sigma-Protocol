import { createFileRoute } from '@tanstack/react-router';
import { CreditCard, Users, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * Dashboard Page
 * 
 * Main app dashboard with stats and quick actions.
 * 
 * @module dashboard
 */
export const Route = createFileRoute('/(app)/')({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening.
          </p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
          New Project
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="rounded-xl border bg-background p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-muted p-2">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className={`flex items-center text-sm ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border-2 border-dashed p-12 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
          <Zap className="h-6 w-6 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">TanStack Start Dashboard</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          This is your dashboard shell built with TanStack Start SSR. 
          Customize it with your app's specific metrics and functionality.
        </p>
        <button className="px-4 py-2 border rounded-lg hover:bg-muted">
          View Documentation
        </button>
      </div>
    </div>
  );
}

const stats = [
  { icon: Users, label: 'Total Users', value: '1,234', change: '+12%', trend: 'up' as const },
  { icon: CreditCard, label: 'Revenue', value: '$12,345', change: '+8%', trend: 'up' as const },
  { icon: Zap, label: 'AI Credits', value: '8,567', change: '+24%', trend: 'up' as const },
  { icon: Users, label: 'Projects', value: '45', change: '-3%', trend: 'down' as const },
];

