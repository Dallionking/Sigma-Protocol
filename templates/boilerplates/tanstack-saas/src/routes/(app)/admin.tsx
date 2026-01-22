import { createFileRoute } from '@tanstack/react-router';
import { Users, Settings, Activity, Shield, Search, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

/**
 * Admin Dashboard
 * 
 * Role-gated admin panel.
 * 
 * @module admin
 */
export const Route = createFileRoute('/(app)/admin')({
  component: AdminPage,
});

function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');

  const adminTabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'System', icon: Settings },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-purple-600" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {adminStats.map((stat, idx) => (
          <div key={idx} className="rounded-xl border bg-background p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 dark:bg-purple-900/20 p-2">
                <stat.icon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-1 border-b">
        {adminTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-background p-6">
        {activeTab === 'users' && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-background"
                />
              </div>
              <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                Add User
              </button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Plan</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400" />
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">{user.role}</td>
                      <td className="px-4 py-4 text-sm">{user.plan}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button className="p-2 hover:bg-muted rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab !== 'users' && (
          <div className="p-8 text-center text-muted-foreground">
            <p>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} panel coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}

const adminStats = [
  { icon: Users, label: 'Total Users', value: '1,234' },
  { icon: Activity, label: 'Active Today', value: '456' },
  { icon: Shield, label: 'Admin Users', value: '12' },
  { icon: Settings, label: 'Active Plans', value: '3' },
];

const users = [
  { name: 'John Doe', email: 'john@example.com', role: 'Admin', plan: 'Pro', status: 'Active' },
  { name: 'Jane Smith', email: 'jane@example.com', role: 'User', plan: 'Pro', status: 'Active' },
  { name: 'Bob Wilson', email: 'bob@example.com', role: 'User', plan: 'Free', status: 'Inactive' },
];

