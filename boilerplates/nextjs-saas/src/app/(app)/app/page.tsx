import Link from "next/link";

/**
 * Dashboard Page
 * 
 * Main dashboard overview with stats, quick actions, and recent activity.
 * Uses theme-aware colors for proper dark/light mode support.
 * 
 * @module dashboard
 */
export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back!</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your account today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", value: "$12,450", change: "+12.5%", positive: true, icon: "💰" },
          { label: "Active Users", value: "2,340", change: "+8.2%", positive: true, icon: "👥" },
          { label: "Credits Used", value: "8,420", change: "-3.1%", positive: false, icon: "⚡" },
          { label: "API Calls", value: "45.2K", change: "+24.8%", positive: true, icon: "📊" },
        ].map((stat, i) => (
          <div
            key={i}
            className="theme-card p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.positive
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 theme-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: "AI Chat", description: "Start a conversation with AI", href: "/app/chat", icon: "🤖" },
              { title: "Manage Items", description: "View and edit your items", href: "/app/items", icon: "📝" },
              { title: "Billing", description: "Manage your subscription", href: "/app/billing", icon: "💳" },
              { title: "Settings", description: "Configure your account", href: "/app/settings", icon: "⚙️" },
            ].map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors group"
              >
                <span className="text-2xl">{action.icon}</span>
                <div>
                  <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {action.title}
                  </div>
                  <div className="text-sm text-muted-foreground">{action.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Credits Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-cyan-600 rounded-xl p-6 text-white">
          <h2 className="text-lg font-semibold mb-4">Credits Balance</h2>
          <div className="text-4xl font-bold mb-2">8,420</div>
          <div className="text-emerald-100 mb-6">of 10,000 credits</div>
          <div className="w-full bg-white/20 rounded-full h-2 mb-4">
            <div className="bg-white rounded-full h-2" style={{ width: "84.2%" }} />
          </div>
          <Link
            href="/app/billing"
            className="inline-flex px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
          >
            Get More Credits
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="theme-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { action: "API call completed", time: "2 minutes ago", type: "success" },
            { action: "New user signed up", time: "15 minutes ago", type: "info" },
            { action: "Payment processed", time: "1 hour ago", type: "success" },
            { action: "Credits refilled", time: "3 hours ago", type: "info" },
            { action: "AI chat session ended", time: "5 hours ago", type: "neutral" },
          ].map((activity, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.type === "success"
                      ? "bg-green-500"
                      : activity.type === "info"
                      ? "bg-blue-500"
                      : "bg-muted-foreground"
                  }`}
                />
                <span className="text-foreground">{activity.action}</span>
              </div>
              <span className="text-sm text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
