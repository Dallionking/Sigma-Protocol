import { createFileRoute } from '@tanstack/react-router';
import { User, Bell, Palette, Shield } from 'lucide-react';
import { useState } from 'react';

/**
 * Settings Page
 * 
 * User settings with tabs.
 * 
 * @module settings
 */
export const Route = createFileRoute('/(app)/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex space-x-1 border-b">
        {tabs.map((tab) => (
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
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Profile Information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  defaultValue="john@example.com"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-background"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'profile' && (
          <div className="p-8 text-center text-muted-foreground">
            <p>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} settings coming soon...</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t flex justify-end">
          <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

