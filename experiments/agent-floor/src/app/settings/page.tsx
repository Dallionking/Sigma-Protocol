"use client";

import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import ProviderConfig from "@/components/settings/ProviderConfig";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-floor-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-floor-panel border-b border-floor-accent">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 text-floor-muted hover:text-floor-text hover:bg-floor-accent rounded-lg transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-floor-accent flex items-center justify-center">
                <Settings className="w-5 h-5 text-floor-highlight" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-floor-text">
                  Settings
                </h1>
                <p className="text-xs text-floor-muted">
                  Configure your AgentFloor preferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Provider Configuration */}
        <ProviderConfig />
      </main>
    </div>
  );
}
