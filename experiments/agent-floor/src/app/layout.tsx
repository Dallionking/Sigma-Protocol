import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentFloor - Multi-Agent Orchestration",
  description: "Pokemon-style 2D virtual office where AI agents collaborate in real-time",
  keywords: ["AI", "agents", "multi-agent", "orchestration", "collaboration"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-floor-bg text-floor-text min-h-screen">
        {children}
      </body>
    </html>
  );
}
