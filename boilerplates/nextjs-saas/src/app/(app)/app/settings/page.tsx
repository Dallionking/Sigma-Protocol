"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Bell, Palette, Shield, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Settings Page
 * 
 * User settings with tabs for profile, notifications, appearance, and security.
 * Uses theme-aware colors for proper dark/light mode support.
 * 
 * @module settings
 */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Implement actual save
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-border">
        {tabs.map((tab) => (
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
      <div className="theme-card p-6">
        {activeTab === "profile" && <ProfileSettings />}
        {activeTab === "notifications" && <NotificationSettings />}
        {activeTab === "appearance" && <AppearanceSettings />}
        {activeTab === "security" && <SecuritySettings />}

        {/* Save Button */}
        <div className="mt-6 pt-6 border-t border-border flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
];

function ProfileSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
      
      <div className="flex items-center gap-6">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400" />
        <div className="space-y-2">
          <Button variant="outline" size="sm">Change Photo</Button>
          <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Full Name</label>
          <input
            type="text"
            defaultValue="John Doe"
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email</label>
          <input
            type="email"
            defaultValue="john@example.com"
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Bio</label>
        <textarea
          rows={3}
          placeholder="Tell us about yourself..."
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground resize-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Notification Preferences</h2>
      
      {notificationOptions.map((option, idx) => (
        <div key={idx} className="flex items-center justify-between py-3 border-b border-border last:border-0">
          <div>
            <p className="font-medium text-foreground">{option.label}</p>
            <p className="text-sm text-muted-foreground">{option.description}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked={option.enabled} className="sr-only peer" />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      ))}
    </div>
  );
}

function AppearanceSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
      
      <div className="space-y-4">
        <p className="text-sm font-medium text-foreground">Theme</p>
        <div className="grid grid-cols-3 gap-4">
          {["Light", "Dark", "System"].map((theme) => (
            <button
              key={theme}
              className="p-4 border border-border rounded-lg hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary transition-colors bg-card"
            >
              <div className={cn(
                "h-8 w-full rounded mb-2",
                theme === "Light" ? "bg-white border border-border" : theme === "Dark" ? "bg-neutral-900" : "bg-gradient-to-r from-white to-neutral-900"
              )} />
              <p className="text-sm font-medium text-foreground">{theme}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Security</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <p className="font-medium text-foreground">Change Password</p>
            <p className="text-sm text-muted-foreground">Update your password regularly</p>
          </div>
          <Button variant="outline" size="sm">Update</Button>
        </div>
        
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <p className="font-medium text-foreground">Two-Factor Authentication</p>
            <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
          </div>
          <Button variant="outline" size="sm">Enable</Button>
        </div>
        
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-foreground">Active Sessions</p>
            <p className="text-sm text-muted-foreground">Manage your logged-in devices</p>
          </div>
          <Button variant="outline" size="sm">View All</Button>
        </div>
      </div>
    </div>
  );
}

const notificationOptions = [
  { label: "Email Notifications", description: "Receive email updates about your account", enabled: true },
  { label: "Push Notifications", description: "Receive push notifications on your devices", enabled: true },
  { label: "Marketing Emails", description: "Receive news and promotional content", enabled: false },
  { label: "Weekly Digest", description: "Get a weekly summary of your activity", enabled: true },
];
