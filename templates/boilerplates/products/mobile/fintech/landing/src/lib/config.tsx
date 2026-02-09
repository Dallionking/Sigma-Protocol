import {
  BrainIcon,
  ChartLineIcon,
  ShieldCheckIcon,
  ZapIcon,
  BotIcon,
  TrendingUpIcon,
} from "lucide-react";

export const BLUR_FADE_DELAY = 0.15;

export const siteConfig = {
  name: "Trading Platform",
  description: "AI-Powered Trading Intelligence",
  tagline: "Trade Smarter. Execute Faster. Win More.",
  cta: "Join Waitlist",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  keywords: [
    "AI Trading",
    "Algorithmic Trading",
    "Trading Bot",
    "Market Analysis",
    "Trading Intelligence",
    "Automated Trading",
  ],
  links: {
    email: "support@example.com",
    twitter: "https://twitter.com/example",
    discord: "https://discord.gg/example",
    github: "https://github.com/example",
    instagram: "https://instagram.com/example",
  },
  features: [
    {
      name: "AI Market Analysis",
      description:
        "Real-time pattern recognition and sentiment analysis powered by advanced neural networks.",
      icon: <BrainIcon className="h-6 w-6" />,
    },
    {
      name: "Lightning Execution",
      description:
        "Sub-millisecond trade execution with intelligent order routing and slippage protection.",
      icon: <ZapIcon className="h-6 w-6" />,
    },
    {
      name: "Predictive Signals",
      description:
        "Machine learning models that identify high-probability setups before they happen.",
      icon: <ChartLineIcon className="h-6 w-6" />,
    },
    {
      name: "Risk Shield",
      description:
        "Automated position sizing and stop-loss management to protect your capital.",
      icon: <ShieldCheckIcon className="h-6 w-6" />,
    },
    {
      name: "Autonomous Trading",
      description:
        "Set your strategy and let the AI execute 24/7 without emotional interference.",
      icon: <BotIcon className="h-6 w-6" />,
    },
    {
      name: "Performance Analytics",
      description:
        "Deep insights into your trading patterns with actionable improvement recommendations.",
      icon: <TrendingUpIcon className="h-6 w-6" />,
    },
  ],
  featureHighlight: [
    {
      title: "AI-Powered Market Intelligence",
      description:
        "Our neural networks analyze millions of data points per second to identify patterns invisible to human traders.",
      imageSrc: "/Device-2.png",
      direction: "rtl" as const,
    },
    {
      title: "Autonomous Execution Engine",
      description:
        "Set your parameters and let Trading Platform execute with precision, speed, and zero emotional bias.",
      imageSrc: "/Device-3.png",
      direction: "ltr" as const,
    },
    {
      title: "Risk-First Architecture",
      description:
        "Built-in safeguards and dynamic position sizing ensure your capital is always protected.",
      imageSrc: "/Device-4.png",
      direction: "rtl" as const,
    },
  ],
  bento: [
    {
      title: "Neural Pattern Recognition",
      content:
        "Trading Platform's AI identifies chart patterns, support/resistance levels, and momentum shifts with institutional-grade accuracy.",
      imageSrc: "/Device-1.png",
      imageAlt: "AI Pattern Recognition",
      fullWidth: true,
    },
    {
      title: "Real-Time Signal Generation",
      content:
        "Receive actionable trade signals with entry, stop-loss, and take-profit levels based on your risk tolerance.",
      imageSrc: "/Device-2.png",
      imageAlt: "Trading Signals",
      fullWidth: false,
    },
    {
      title: "Portfolio Intelligence",
      content:
        "Smart allocation recommendations that balance risk and reward across your entire portfolio.",
      imageSrc: "/Device-3.png",
      imageAlt: "Portfolio Management",
      fullWidth: false,
    },
    {
      title: "24/7 Market Monitoring",
      content:
        "Never miss an opportunity. Trading Platform watches the markets around the clock and alerts you to critical moves.",
      imageSrc: "/Device-4.png",
      imageAlt: "Market Monitoring",
      fullWidth: true,
    },
  ],
  benefits: [
    {
      id: 1,
      text: "Eliminate emotional trading with AI-driven discipline.",
      image: "/Device-6.png",
    },
    {
      id: 2,
      text: "Capture opportunities 24/7 while you sleep.",
      image: "/Device-7.png",
    },
    {
      id: 3,
      text: "Reduce risk with intelligent position management.",
      image: "/Device-8.png",
    },
    {
      id: 4,
      text: "Outperform with data-driven edge detection.",
      image: "/Device-1.png",
    },
  ],
  pricing: [
    {
      name: "Basic",
      href: "#waitlist",
      price: "$0",
      period: "month",
      yearlyPrice: "$0",
      features: [
        "5 AI trade signals per day",
        "Basic market analysis",
        "Email alerts",
        "Community Discord access",
        "Educational resources",
      ],
      description: "Perfect for learning the system",
      buttonText: "Join Waitlist",
      isPopular: false,
    },
    {
      name: "Pro",
      href: "#waitlist",
      price: "$97",
      period: "month",
      yearlyPrice: "$970",
      features: [
        "Unlimited AI trade signals",
        "Advanced pattern recognition",
        "Real-time push notifications",
        "Semi-automated execution",
        "Priority Discord support",
        "Weekly strategy sessions",
      ],
      description: "For serious traders ready to level up",
      buttonText: "Join Waitlist",
      isPopular: true,
    },
    {
      name: "Elite",
      href: "#waitlist",
      price: "$297",
      period: "month",
      yearlyPrice: "$2970",
      features: [
        "Everything in Pro",
        "Full autonomous trading",
        "Custom AI model training",
        "Multi-asset support",
        "API access",
        "1-on-1 strategy calls",
        "White-glove onboarding",
      ],
      description: "Maximum edge for professional traders",
      buttonText: "Join Waitlist",
      isPopular: false,
    },
  ],
  faqs: [
    {
      question: "What markets does Trading Platform support?",
      answer: (
        <span>
          Trading Platform currently supports crypto, forex, and stock markets. We&apos;re 
          continuously expanding asset coverage based on member demand. Elite members 
          get early access to new market integrations.
        </span>
      ),
    },
    {
      question: "How does the AI generate trading signals?",
      answer: (
        <span>
          Our AI analyzes price action, volume, order flow, sentiment data, and 
          hundreds of technical indicators using proprietary neural networks trained 
          on decades of market data. Signals include entry price, stop-loss, and 
          multiple take-profit targets.
        </span>
      ),
    },
    {
      question: "Can I connect my own broker/exchange?",
      answer: (
        <span>
          Yes! Pro and Elite members can connect to major exchanges and brokers 
          for semi-automated or fully autonomous execution. We currently support 
          Binance, Coinbase Pro, Interactive Brokers, and more.
        </span>
      ),
    },
    {
      question: "Is my trading capital at risk?",
      answer: (
        <span>
          Trading Platform never has custody of your funds. We only send signals and 
          execute trades via API with your permission. Our risk management system 
          includes automatic stop-losses and position sizing to protect your capital.
        </span>
      ),
    },
    {
      question: "What&apos;s the difference between semi-auto and fully autonomous?",
      answer: (
        <span>
          Semi-automated (Pro) sends you signals with one-click execution—you 
          approve each trade. Fully autonomous (Elite) executes trades automatically 
          based on your pre-configured strategy and risk parameters.
        </span>
      ),
    },
    {
      question: "When will Trading Platform launch?",
      answer: (
        <span>
          We&apos;re currently in private beta with select traders. Join the waitlist 
          to get early access and exclusive founding member pricing when we launch 
          publicly in Q1 2025.
        </span>
      ),
    },
  ],
  footer: [
    {
      id: 1,
      menu: [
        { href: "#features", text: "Features" },
        { href: "#pricing", text: "Pricing" },
        { href: "#faq", text: "FAQ" },
        { href: "#waitlist", text: "Join Waitlist" },
      ],
    },
  ],
  testimonials: [
    {
      id: 1,
      text: "Trading Platform spotted a pattern I would have missed. That one trade covered my subscription for the year.",
      name: "Marcus T.",
      role: "Day Trader",
      image: "https://avatar.vercel.sh/marcus",
    },
    {
      id: 2,
      text: "Finally, an AI that actually understands market structure. The signal quality is incredible.",
      name: "Sarah K.",
      role: "Crypto Trader",
      image: "https://avatar.vercel.sh/sarah",
    },
    {
      id: 3,
      text: "I was skeptical of AI trading tools until I tried the beta. My win rate jumped 23% in the first month.",
      name: "David L.",
      role: "Swing Trader",
      image: "https://avatar.vercel.sh/david",
    },
    {
      id: 4,
      text: "The risk management alone is worth it. I sleep better knowing my positions are protected.",
      name: "Jennifer M.",
      role: "Portfolio Manager",
      image: "https://avatar.vercel.sh/jennifer",
    },
    {
      id: 5,
      text: "Autonomous mode changed the game. I&apos;m making money while traveling.",
      name: "Alex R.",
      role: "Digital Nomad",
      image: "https://avatar.vercel.sh/alex",
    },
    {
      id: 6,
      text: "The Discord community and strategy sessions add so much value beyond just the signals.",
      name: "Chris P.",
      role: "Part-time Trader",
      image: "https://avatar.vercel.sh/chris",
    },
  ],
};

export type SiteConfig = typeof siteConfig;
