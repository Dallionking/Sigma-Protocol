import { SubscriptionTier, BillingCycle } from "@/stores/subscriptionStore";

export interface TierPricing {
  monthly: number;
  annual: number;
  annualMonthly: number; // Effective monthly when paying annually
  savingsPercent: number;
}

export interface TierInfo {
  id: SubscriptionTier;
  name: string;
  tagline: string;
  pricing: TierPricing;
  isRecommended: boolean;
  featureHighlights: string[];
}

export const SUBSCRIPTION_TIERS: TierInfo[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Try before you commit",
    pricing: {
      monthly: 0,
      annual: 0,
      annualMonthly: 0,
      savingsPercent: 0,
    },
    isRecommended: false,
    featureHighlights: [
      "5 lessons",
      "10 AI chats/day",
      "View feed only",
    ],
  },
  {
    id: "essential",
    name: "Essential",
    tagline: "For self-learners",
    pricing: {
      monthly: 29,
      annual: 290,
      annualMonthly: 24.17,
      savingsPercent: 17,
    },
    isRecommended: false,
    featureHighlights: [
      "Full lesson library",
      "Unlimited AI chat",
      "30 min voice/month",
      "All worksheets",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Most popular choice",
    pricing: {
      monthly: 79,
      annual: 790,
      annualMonthly: 65.83,
      savingsPercent: 17,
    },
    isRecommended: true,
    featureHighlights: [
      "Everything in Essential",
      "Unlimited voice practice",
      "Weekly group calls",
      "VIP community access",
      "All slang regions",
    ],
  },
  {
    id: "vip",
    name: "VIP",
    tagline: "Premium experience",
    pricing: {
      monthly: 199,
      annual: 1990,
      annualMonthly: 165.83,
      savingsPercent: 17,
    },
    isRecommended: false,
    featureHighlights: [
      "Everything in Pro",
      "Priority 1:1 booking",
      "Direct messaging with AI Tutor",
      "Personalized coaching",
      "Dedicated support",
    ],
  },
];

export type FeatureValue = boolean | string | number;

export interface FeatureDefinition {
  id: string;
  name: string;
  category: "content" | "ai" | "speaking" | "community" | "support";
  values: Record<SubscriptionTier, FeatureValue>;
}

export const FEATURE_MATRIX: FeatureDefinition[] = [
  // Content
  {
    id: "lessons",
    name: "Lessons & Content",
    category: "content",
    values: { free: "5 lessons", essential: "Full library", pro: "Full library", vip: "Full library" },
  },
  {
    id: "worksheets",
    name: "Worksheets",
    category: "content",
    values: { free: false, essential: true, pro: true, vip: true },
  },
  {
    id: "slang_modules",
    name: "Slang Modules",
    category: "content",
    values: { free: false, essential: "1 region", pro: "All regions", vip: "All regions" },
  },
  {
    id: "content_feed",
    name: "Content Feed",
    category: "content",
    values: { free: "View only", essential: "Full access", pro: "Full access", vip: "Full access" },
  },
  // AI
  {
    id: "ai_chat",
    name: "AI Tutor Chat",
    category: "ai",
    values: { free: "10/day", essential: "Unlimited", pro: "Unlimited", vip: "Unlimited" },
  },
  {
    id: "ai_voice",
    name: "AI Voice (Talk to AI Tutor)",
    category: "ai",
    values: { free: false, essential: "30 min/mo", pro: "Unlimited", vip: "Unlimited" },
  },
  // Speaking
  {
    id: "speaking_exercises",
    name: "Speaking Exercises",
    category: "speaking",
    values: { free: false, essential: "Basic", pro: "Advanced + Scoring", vip: "Advanced + Coaching" },
  },
  {
    id: "pronunciation",
    name: "Pronunciation Coaching",
    category: "speaking",
    values: { free: false, essential: false, pro: false, vip: "Personalized" },
  },
  // Community
  {
    id: "group_calls",
    name: "Weekly Group Calls",
    category: "community",
    values: { free: false, essential: false, pro: true, vip: true },
  },
  {
    id: "vip_community",
    name: "VIP Community",
    category: "community",
    values: { free: false, essential: false, pro: "Access", vip: "Priority access" },
  },
  {
    id: "one_on_one",
    name: "1:1 Booking with AI Tutor",
    category: "community",
    values: { free: false, essential: false, pro: "Regular rates", vip: "Priority + Discounted" },
  },
  {
    id: "direct_messaging",
    name: "Direct Messaging with AI Tutor",
    category: "community",
    values: { free: false, essential: false, pro: false, vip: true },
  },
  // Support
  {
    id: "support",
    name: "Support",
    category: "support",
    values: { free: "Community", essential: "Email", pro: "Priority Email", vip: "Dedicated" },
  },
];

export const FEATURE_CATEGORIES = [
  { id: "content", name: "Lessons & Content" },
  { id: "ai", name: "AI Tutor" },
  { id: "speaking", name: "Speaking Practice" },
  { id: "community", name: "Community & Calls" },
  { id: "support", name: "Support" },
] as const;

export interface BonusItem {
  id: string;
  name: string;
  description: string;
  perceivedValue: number;
  minTier: SubscriptionTier;
}

export const BONUS_STACK: BonusItem[] = [
  {
    id: "bonus_worksheets",
    name: "AI Tutor's Complete Worksheet Library",
    description: "50+ printable worksheets used in real classes",
    perceivedValue: 297,
    minTier: "essential",
  },
  {
    id: "bonus_cards",
    name: "Quick-Start Conversation Cards",
    description: "100 most-used phrases for immediate use",
    perceivedValue: 47,
    minTier: "essential",
  },
  {
    id: "bonus_slang",
    name: "Regional Slang Phrasebooks",
    description: "Regional and domain-specific phrase guides",
    perceivedValue: 97,
    minTier: "pro",
  },
  {
    id: "bonus_community",
    name: "VIP Community Access",
    description: "Private community with fellow serious learners",
    perceivedValue: 297,
    minTier: "pro",
  },
  {
    id: "bonus_coaching",
    name: "Weekly Live Group Coaching",
    description: "Live Q&A and practice sessions with AI Tutor",
    perceivedValue: 1200,
    minTier: "pro",
  },
  {
    id: "bonus_priority",
    name: "Priority Booking Access",
    description: "First access to AI Tutor's 1:1 calendar",
    perceivedValue: 497,
    minTier: "vip",
  },
  {
    id: "bonus_learning_path",
    name: "Personalized Learning Path",
    description: "Custom curriculum based on your goals",
    perceivedValue: 197,
    minTier: "vip",
  },
];

export const GUARANTEE = {
  name: "90-Day Learning Confidence Guarantee",
  headline: "Pass your first skills assessment in 90 days, or we extend your access FREE until you do.",
  details: [
    "No questions asked",
    "No hoops to jump through",
    "Complete 50% of lessons to qualify",
    "5-minute evaluation with AI Tutor",
    "30-day extensions until you succeed",
  ],
  timeWindow: 90,
};

export const CANCELLATION_REASONS = [
  { id: "too_expensive", label: "Too expensive" },
  { id: "not_enough_time", label: "Not enough time to practice" },
  { id: "not_what_expected", label: "Not what I expected" },
  { id: "found_alternative", label: "Found a different solution" },
  { id: "already_fluent", label: "Already achieved my goals" },
  { id: "technical_issues", label: "Technical problems" },
  { id: "other", label: "Other reason" },
];

export const RETENTION_OFFER = {
  discount: 50,
  headline: "Wait! Here's a special offer",
  description: "Get 50% off your next month if you stay",
  cta: "Keep my subscription at 50% off",
};

export function getTierById(id: SubscriptionTier): TierInfo | undefined {
  return SUBSCRIPTION_TIERS.find((t) => t.id === id);
}

export function getPaidTiers(): TierInfo[] {
  return SUBSCRIPTION_TIERS.filter((t) => t.id !== "free");
}

export function getPrice(tier: TierInfo, cycle: BillingCycle): number {
  return cycle === "monthly" ? tier.pricing.monthly : tier.pricing.annual;
}

export function getEffectiveMonthly(tier: TierInfo, cycle: BillingCycle): number {
  return cycle === "monthly" ? tier.pricing.monthly : tier.pricing.annualMonthly;
}

export function getBonusesForTier(tier: SubscriptionTier): BonusItem[] {
  const tierOrder: SubscriptionTier[] = ["free", "essential", "pro", "vip"];
  const tierIndex = tierOrder.indexOf(tier);
  
  return BONUS_STACK.filter((bonus) => {
    const minIndex = tierOrder.indexOf(bonus.minTier);
    return tierIndex >= minIndex;
  });
}

export function getTotalBonusValue(tier: SubscriptionTier): number {
  return getBonusesForTier(tier).reduce((sum, b) => sum + b.perceivedValue, 0);
}

