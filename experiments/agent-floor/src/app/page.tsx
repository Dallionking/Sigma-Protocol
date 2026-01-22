"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Code, TrendingUp, Palette, Plus, Settings } from "lucide-react";

interface TeamTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  agentCount: number;
  color: string;
}

const teamTemplates: TeamTemplate[] = [
  {
    id: "dev-team",
    name: "Development Team",
    description: "PM, Architect, Frontend, Backend, QA engineers working together",
    icon: <Code className="w-8 h-8" />,
    agentCount: 5,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "trading-floor",
    name: "Trading Floor",
    description: "Analyst, Quant, Risk Manager, Trader, Compliance team",
    icon: <TrendingUp className="w-8 h-8" />,
    agentCount: 5,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "creative-studio",
    name: "Creative Studio",
    description: "Writer, Designer, Reviewer, Editor, Producer collaborating",
    icon: <Palette className="w-8 h-8" />,
    agentCount: 5,
    color: "from-purple-500 to-pink-500",
  },
];

export default function Home() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  return (
    <main className="min-h-screen p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-floor-highlight to-purple-500 bg-clip-text text-transparent">
              AgentFloor
            </h1>
            <p className="text-floor-muted text-lg">
              Multi-agent orchestration in a Pokemon-style 2D office
            </p>
          </div>
          <Link
            href="/settings"
            className="p-3 rounded-lg bg-floor-panel hover:bg-floor-accent transition-colors"
          >
            <Settings className="w-6 h-6" />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-floor-panel rounded-lg p-4 border border-floor-accent">
            <div className="text-2xl font-bold text-floor-highlight">15</div>
            <div className="text-floor-muted text-sm">Available Agents</div>
          </div>
          <div className="bg-floor-panel rounded-lg p-4 border border-floor-accent">
            <div className="text-2xl font-bold text-green-400">7</div>
            <div className="text-floor-muted text-sm">LLM Providers</div>
          </div>
          <div className="bg-floor-panel rounded-lg p-4 border border-floor-accent">
            <div className="text-2xl font-bold text-blue-400">3</div>
            <div className="text-floor-muted text-sm">Team Templates</div>
          </div>
        </div>
      </div>

      {/* Team Templates */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Select a Team Template
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => setSelectedTeam(template.id)}
              className={`
                relative bg-floor-panel rounded-xl p-6 border-2 cursor-pointer
                transition-all duration-200 hover:scale-[1.02]
                ${
                  selectedTeam === template.id
                    ? "border-floor-highlight shadow-lg shadow-floor-highlight/20"
                    : "border-floor-accent hover:border-floor-highlight/50"
                }
              `}
            >
              {/* Gradient accent */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r ${template.color}`}
              />

              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-lg bg-gradient-to-br ${template.color} bg-opacity-20`}
                >
                  {template.icon}
                </div>
                <span className="text-sm text-floor-muted">
                  {template.agentCount} agents
                </span>
              </div>

              <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
              <p className="text-floor-muted text-sm mb-4">
                {template.description}
              </p>

              {selectedTeam === template.id && (
                <Link
                  href={`/floor/${template.id}`}
                  className="block w-full py-2 px-4 bg-floor-highlight text-white text-center rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                >
                  Launch Floor
                </Link>
              )}
            </div>
          ))}

          {/* Custom Team */}
          <div className="bg-floor-panel rounded-xl p-6 border-2 border-dashed border-floor-accent hover:border-floor-highlight/50 cursor-pointer transition-all flex flex-col items-center justify-center text-center min-h-[200px]">
            <div className="p-3 rounded-lg bg-floor-accent mb-4">
              <Plus className="w-8 h-8 text-floor-muted" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Custom Team</h3>
            <p className="text-floor-muted text-sm">
              Create your own team configuration
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-6xl mx-auto mt-12">
        <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
        <div className="flex gap-4 flex-wrap">
          <button className="px-4 py-2 bg-floor-panel border border-floor-accent rounded-lg hover:border-floor-highlight transition-colors">
            Configure Providers
          </button>
          <button className="px-4 py-2 bg-floor-panel border border-floor-accent rounded-lg hover:border-floor-highlight transition-colors">
            Import Team
          </button>
          <button className="px-4 py-2 bg-floor-panel border border-floor-accent rounded-lg hover:border-floor-highlight transition-colors">
            View Documentation
          </button>
        </div>
      </div>
    </main>
  );
}
