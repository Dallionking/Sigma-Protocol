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
        floor: {
          bg: "#1a1a2e",
          panel: "#16213e",
          accent: "#0f3460",
          highlight: "#e94560",
          text: "#eaeaea",
          muted: "#8b8b8b",
        },
        agent: {
          idle: "#4ade80",
          working: "#fbbf24",
          thinking: "#60a5fa",
          talking: "#c084fc",
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-subtle": "bounce 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
