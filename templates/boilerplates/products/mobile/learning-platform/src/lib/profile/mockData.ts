import { UserProfile, UserStats, Achievement } from "@/stores/profileStore";
import { subDays, format } from "date-fns";

const now = new Date();

export const MOCK_USER_PROFILE: UserProfile = {
  id: "user_001",
  name: "Maria",
  email: "maria@example.com",
  level: 7,
  xp: 1240,
  streak: 7,
  joinedAt: subDays(now, 45).toISOString(),
  nativeLanguage: "English",
};

// Generate streak calendar for past 30 days
function generateStreakCalendar(): Record<string, boolean> {
  const calendar: Record<string, boolean> = {};
  for (let i = 0; i < 30; i++) {
    const date = format(subDays(now, i), "yyyy-MM-dd");
    // Simulate some missed days
    calendar[date] = i < 7 || (i > 10 && i < 15) || i > 20;
  }
  return calendar;
}

export const MOCK_USER_STATS: UserStats = {
  totalXP: 1240,
  lessonsCompleted: 23,
  wordsLearned: 156,
  hoursPracticed: 12.5,
  listeningMinutes: 180,
  speakingMinutes: 95,
  readingMinutes: 220,
  writingMinutes: 75,
  weeklyActivity: [25, 30, 15, 45, 20, 35, 40], // Sun-Sat
  streakCalendar: generateStreakCalendar(),
};

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  // Unlocked achievements
  {
    id: "ach_first_lesson",
    title: "First Steps",
    description: "Complete your first lesson",
    iconName: "Footprints",
    category: "lessons",
    unlockedAt: subDays(now, 40).toISOString(),
    progress: 1,
    maxProgress: 1,
  },
  {
    id: "ach_streak_3",
    title: "On Fire",
    description: "Maintain a 3-day streak",
    iconName: "Flame",
    category: "streak",
    unlockedAt: subDays(now, 35).toISOString(),
    progress: 3,
    maxProgress: 3,
  },
  {
    id: "ach_streak_7",
    title: "Week Warrior",
    description: "Maintain a 7-day streak",
    iconName: "Trophy",
    category: "streak",
    unlockedAt: subDays(now, 1).toISOString(),
    progress: 7,
    maxProgress: 7,
  },
  {
    id: "ach_words_50",
    title: "Word Collector",
    description: "Learn 50 words",
    iconName: "BookOpen",
    category: "vocabulary",
    unlockedAt: subDays(now, 20).toISOString(),
    progress: 50,
    maxProgress: 50,
  },
  {
    id: "ach_words_100",
    title: "Vocabulary Builder",
    description: "Learn 100 words",
    iconName: "Library",
    category: "vocabulary",
    unlockedAt: subDays(now, 10).toISOString(),
    progress: 100,
    maxProgress: 100,
  },
  {
    id: "ach_first_convo",
    title: "Conversation Starter",
    description: "Complete your first AI conversation",
    iconName: "MessageCircle",
    category: "speaking",
    unlockedAt: subDays(now, 30).toISOString(),
    progress: 1,
    maxProgress: 1,
  },
  // In progress achievements
  {
    id: "ach_streak_30",
    title: "Monthly Master",
    description: "Maintain a 30-day streak",
    iconName: "Crown",
    category: "streak",
    progress: 7,
    maxProgress: 30,
  },
  {
    id: "ach_words_250",
    title: "Wordsmith",
    description: "Learn 250 words",
    iconName: "Sparkles",
    category: "vocabulary",
    progress: 156,
    maxProgress: 250,
  },
  {
    id: "ach_lessons_50",
    title: "Dedicated Learner",
    description: "Complete 50 lessons",
    iconName: "GraduationCap",
    category: "lessons",
    progress: 23,
    maxProgress: 50,
  },
  // Locked achievements
  {
    id: "ach_streak_100",
    title: "Century Club",
    description: "Maintain a 100-day streak",
    iconName: "Star",
    category: "streak",
    progress: 7,
    maxProgress: 100,
  },
  {
    id: "ach_perfect_week",
    title: "Perfect Week",
    description: "Practice every day for a week with no mistakes",
    iconName: "CheckCircle",
    category: "special",
    progress: 0,
    maxProgress: 1,
  },
  {
    id: "ach_night_owl",
    title: "Night Owl",
    description: "Complete 10 lessons after 10 PM",
    iconName: "Moon",
    category: "special",
    progress: 2,
    maxProgress: 10,
  },
];

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "general" | "account" | "learning" | "technical";
}

export const MOCK_FAQ_ITEMS: FAQItem[] = [
  {
    id: "faq_1",
    question: "How do I reset my password?",
    answer:
      "Go to Settings > Account > Change Password. You'll need to enter your current password and then create a new one. Make sure your new password is at least 8 characters with a mix of letters and numbers.",
    category: "account",
  },
  {
    id: "faq_2",
    question: "How are XP points calculated?",
    answer:
      "XP is earned by completing lessons, practicing with AI Tutor, maintaining your streak, and finishing homework assignments. Bonus XP is awarded for perfect scores and completing daily challenges.",
    category: "learning",
  },
  {
    id: "faq_3",
    question: "Can I practice offline?",
    answer:
      "Currently, an internet connection is required for most features. We're working on offline mode for future updates. Downloaded lessons will be available soon!",
    category: "technical",
  },
  {
    id: "faq_4",
    question: "How do I cancel my subscription?",
    answer:
      "You can manage your subscription through your device's app store (Apple App Store or Google Play Store). Go to your account settings in the store to view and manage subscriptions.",
    category: "account",
  },
  {
    id: "faq_5",
    question: "What happens if I lose my streak?",
    answer:
      "Don't worry! While your streak counter resets, you keep all your XP and achievements. You can also use Streak Freezes (earned through consistent practice) to protect your streak on busy days.",
    category: "learning",
  },
  {
    id: "faq_6",
    question: "How do I change the voice speed?",
    answer:
      "Go to Settings > Language & Audio. You can choose between Slow, Normal, and Fast voice speeds. We recommend starting with Slow and gradually increasing as you improve.",
    category: "learning",
  },
  {
    id: "faq_7",
    question: "Is my data secure?",
    answer:
      "Yes! We use industry-standard encryption to protect your data. Your personal information is never sold to third parties. You can review our full privacy policy in Settings > Privacy.",
    category: "general",
  },
  {
    id: "faq_8",
    question: "How do I report a bug?",
    answer:
      "Use the Contact Us form in Settings > Help & Support > Contact. Please include details about what happened, which screen you were on, and your device type. Screenshots are helpful!",
    category: "technical",
  },
];

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "pt", name: "Português" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
];

export const VOICE_SPEEDS = [
  { value: "slow" as const, label: "Slow", description: "Best for beginners" },
  { value: "normal" as const, label: "Normal", description: "Natural pace" },
  { value: "fast" as const, label: "Fast", description: "For advanced learners" },
];

export function getUnlockedAchievements(): Achievement[] {
  return MOCK_ACHIEVEMENTS.filter((a) => a.unlockedAt);
}

export function getInProgressAchievements(): Achievement[] {
  return MOCK_ACHIEVEMENTS.filter(
    (a) => !a.unlockedAt && a.progress && a.progress > 0
  );
}

export function getLockedAchievements(): Achievement[] {
  return MOCK_ACHIEVEMENTS.filter((a) => !a.unlockedAt && (!a.progress || a.progress === 0));
}

