import { CreditCard, Users, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Dashboard Page
 * 
 * Main app dashboard with stats, activity, and quick actions.
 * 
 * @module dashboard
 */
export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening.
          </p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
          New Project
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="rounded-xl border bg-background p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-muted p-2">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div
                className={`flex items-center text-sm ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.trend === "up" ? (
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

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-xl border bg-background p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {activities.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border bg-background p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                className="flex flex-col items-center justify-center p-4 rounded-lg border hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors"
              >
                <action.icon className="h-6 w-6 text-purple-600 mb-2" />
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State / Getting Started */}
      <div className="rounded-xl border-2 border-dashed p-12 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
          <Zap className="h-6 w-6 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Get started</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          This is your dashboard shell. Customize it with your app's specific 
          metrics, charts, and functionality.
        </p>
        <Button variant="outline">View Documentation</Button>
      </div>
    </div>
  );
}

const stats = [
  {
    icon: Users,
    label: "Total Users",
    value: "1,234",
    change: "+12%",
    trend: "up" as const,
  },
  {
    icon: CreditCard,
    label: "Revenue",
    value: "$12,345",
    change: "+8%",
    trend: "up" as const,
  },
  {
    icon: Zap,
    label: "AI Credits Used",
    value: "8,567",
    change: "+24%",
    trend: "up" as const,
  },
  {
    icon: Users,
    label: "Active Projects",
    value: "45",
    change: "-3%",
    trend: "down" as const,
  },
];

const activities = [
  { title: "New user signed up", time: "2 minutes ago" },
  { title: "Payment received - $29.00", time: "15 minutes ago" },
  { title: "AI credits purchased", time: "1 hour ago" },
  { title: "New project created", time: "2 hours ago" },
];

const quickActions = [
  { icon: Users, label: "Add User" },
  { icon: CreditCard, label: "View Billing" },
  { icon: Zap, label: "API Keys" },
  { icon: Users, label: "Team Settings" },
];

