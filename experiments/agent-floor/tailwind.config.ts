import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vercel-inspired 2026 SaaS Design System
        floor: {
          bg: "#000000",        // Pure black background
          panel: "#0a0a0a",     // Slightly lighter panels
          card: "#111111",      // Card backgrounds
          accent: "#171717",    // Subtle accent areas
          border: "#262626",    // Borders
          highlight: "#0070f3", // Vercel blue
          text: "#ededed",      // Primary text
          muted: "#888888",     // Muted text
          subtle: "#666666",    // Even more subtle
        },
        agent: {
          idle: "#50e3c2",      // Vercel teal
          working: "#0070f3",   // Vercel blue
          thinking: "#7928ca",  // Vercel purple
          talking: "#ff0080",   // Vercel pink
        },
        // Vercel gradient colors
        gradient: {
          blue: "#0070f3",
          cyan: "#50e3c2",
          purple: "#7928ca",
          pink: "#ff0080",
          orange: "#f5a623",
        },
      },
      fontFamily: {
        // Geist is Vercel's font, fallback to Inter
        sans: ["Geist", "Inter", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "monospace"],
        pixel: ['"Press Start 2P"', "monospace"], // Keep for game elements
      },
      backgroundImage: {
        // Vercel-style gradients
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "vercel-gradient": "linear-gradient(to bottom right, #0070f3, #7928ca, #ff0080)",
        "vercel-glow": "radial-gradient(circle at 50% 0%, rgba(0, 112, 243, 0.15), transparent 50%)",
      },
      boxShadow: {
        "vercel": "0 0 0 1px rgba(255,255,255,.1)",
        "vercel-lg": "0 8px 30px rgba(0,0,0,0.12)",
        "glow-blue": "0 0 20px rgba(0, 112, 243, 0.3)",
        "glow-purple": "0 0 20px rgba(121, 40, 202, 0.3)",
      },
      borderRadius: {
        "vercel": "0.5rem",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-subtle": "bounce 2s infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        glow: {
          "0%": { opacity: "0.5" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
