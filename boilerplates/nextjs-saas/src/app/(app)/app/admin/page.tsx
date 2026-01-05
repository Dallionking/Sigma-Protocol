"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, Settings, Activity, Shield, Search, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Admin Dashboard
 * 
 * Role-gated admin panel for system management.
 * Uses theme-aware colors for proper dark/light mode support.
 * 
 * @module admin
 */
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Manage users, settings, and system configuration.
          </p>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        {adminStats.map((stat, idx) => (
          <div
            key={idx}
            className="theme-card p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-border">
        {adminTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="theme-card">
        {activeTab === "users" && <UsersTable />}
        {activeTab === "settings" && <SystemSettings />}
        {activeTab === "activity" && <ActivityLog />}
      </div>
    </div>
  );
}

const adminStats = [
  { icon: Users, label: "Total Users", value: "1,234" },
  { icon: Activity, label: "Active Today", value: "456" },
  { icon: Shield, label: "Admin Users", value: "12" },
  { icon: Settings, label: "Active Plans", value: "3" },
];

const adminTabs = [
  { id: "users", label: "Users", icon: Users },
  { id: "settings", label: "System", icon: Settings },
  { id: "activity", label: "Activity", icon: Activity },
];

function UsersTable() {
  return (
    <div className="p-6">
      {/* Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Add User
        </Button>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Plan</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Joined</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={idx} className="border-t border-border">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400" />
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-foreground">{user.role}</td>
                <td className="px-4 py-4 text-sm text-foreground">{user.plan}</td>
                <td className="px-4 py-4">
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    user.status === "Active" 
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-muted-foreground">{user.joined}</td>
                <td className="px-4 py-4 text-right">
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SystemSettings() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold text-foreground">System Configuration</h2>
      <p className="text-muted-foreground">
        This is a placeholder for system settings. Add your admin configuration options here.
      </p>
      <div className="p-8 border-2 border-dashed border-border rounded-lg text-center">
        <Settings className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">
          Configure system-wide settings, feature flags, and environment variables.
        </p>
      </div>
    </div>
  );
}

function ActivityLog() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Activity Log</h2>
      <p className="text-muted-foreground">
        This is a placeholder for the activity/audit log. Track system events here.
      </p>
      <div className="p-8 border-2 border-dashed border-border rounded-lg text-center">
        <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">
          View user actions, system events, and security logs.
        </p>
      </div>
    </div>
  );
}

const users = [
  { name: "John Doe", email: "john@example.com", role: "Admin", plan: "Pro", status: "Active", joined: "Dec 1, 2025" },
  { name: "Jane Smith", email: "jane@example.com", role: "User", plan: "Pro", status: "Active", joined: "Nov 15, 2025" },
  { name: "Bob Wilson", email: "bob@example.com", role: "User", plan: "Free", status: "Inactive", joined: "Oct 20, 2025" },
];
