/**
 * Gamification Module
 *
 * Standalone gamification logic for XP, levels, streaks, and achievements.
 * Import and configure in any learning-based application.
 */

// XP rewards per action type
export const XP_REWARDS = {
  lessonComplete: 100,
  practiceComplete: 50,
  streakDay: 25,
  achievementUnlock: 200,
  homeworkSubmit: 75,
  voiceMinute: 15,
  aiMessage: 5,
  aiCorrection: 10,
  perfectScore: 150,
  dailyChallenge: 100,
  weeklyChallenge: 500,
} as const;

// Level thresholds (XP required to reach each level)
export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  300,    // Level 3
  600,    // Level 4
  1000,   // Level 5
  1500,   // Level 6
  2200,   // Level 7
  3000,   // Level 8
  4000,   // Level 9
  5200,   // Level 10
  6500,   // Level 11
  8000,   // Level 12
  10000,  // Level 13
  12500,  // Level 14
  15000,  // Level 15
  18000,  // Level 16
  21500,  // Level 17
  25500,  // Level 18
  30000,  // Level 19
  35000,  // Level 20
] as const;

export function getLevelForXP(totalXP: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

export function getXPForNextLevel(totalXP: number): {
  currentLevel: number;
  xpInLevel: number;
  xpForLevel: number;
  progress: number;
} {
  const level = getLevelForXP(totalXP);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? currentThreshold + 5000;

  const xpInLevel = totalXP - currentThreshold;
  const xpForLevel = nextThreshold - currentThreshold;

  return {
    currentLevel: level,
    xpInLevel,
    xpForLevel,
    progress: Math.min(xpInLevel / xpForLevel, 1),
  };
}

// Streak logic
export function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const sorted = [...dates].sort().reverse();
  const today = new Date().toISOString().split("T")[0];

  // Must include today or yesterday
  if (sorted[0] !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (sorted[0] !== yesterday.toISOString().split("T")[0]) {
      return 0;
    }
  }

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = Math.round(
      (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// Achievement definitions
export type AchievementCategory =
  | "lessons"
  | "streak"
  | "vocabulary"
  | "speaking"
  | "special";

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: AchievementCategory;
  maxProgress: number;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  { id: "first_lesson", title: "First Steps", description: "Complete your first lesson", iconName: "Footprints", category: "lessons", maxProgress: 1 },
  { id: "lessons_10", title: "Dedicated Learner", description: "Complete 10 lessons", iconName: "BookOpen", category: "lessons", maxProgress: 10 },
  { id: "lessons_50", title: "Knowledge Seeker", description: "Complete 50 lessons", iconName: "GraduationCap", category: "lessons", maxProgress: 50 },
  { id: "streak_3", title: "On Fire", description: "Maintain a 3-day streak", iconName: "Flame", category: "streak", maxProgress: 3 },
  { id: "streak_7", title: "Week Warrior", description: "Maintain a 7-day streak", iconName: "Trophy", category: "streak", maxProgress: 7 },
  { id: "streak_30", title: "Monthly Master", description: "Maintain a 30-day streak", iconName: "Crown", category: "streak", maxProgress: 30 },
  { id: "streak_100", title: "Century Club", description: "Maintain a 100-day streak", iconName: "Star", category: "streak", maxProgress: 100 },
  { id: "words_50", title: "Word Collector", description: "Learn 50 words", iconName: "BookOpen", category: "vocabulary", maxProgress: 50 },
  { id: "words_250", title: "Wordsmith", description: "Learn 250 words", iconName: "Sparkles", category: "vocabulary", maxProgress: 250 },
  { id: "first_convo", title: "Conversation Starter", description: "Complete your first AI conversation", iconName: "MessageCircle", category: "speaking", maxProgress: 1 },
  { id: "perfect_week", title: "Perfect Week", description: "Practice every day for a week with no mistakes", iconName: "CheckCircle", category: "special", maxProgress: 1 },
  { id: "night_owl", title: "Night Owl", description: "Complete 10 lessons after 10 PM", iconName: "Moon", category: "special", maxProgress: 10 },
];

export function checkAchievements(
  stats: { lessonsCompleted: number; wordsLearned: number; streak: number; aiConversations: number },
  unlockedIds: string[]
): AchievementDefinition[] {
  const newlyUnlocked: AchievementDefinition[] = [];

  for (const def of ACHIEVEMENT_DEFINITIONS) {
    if (unlockedIds.includes(def.id)) continue;

    let progress = 0;
    switch (def.category) {
      case "lessons":
        progress = stats.lessonsCompleted;
        break;
      case "streak":
        progress = stats.streak;
        break;
      case "vocabulary":
        progress = stats.wordsLearned;
        break;
      case "speaking":
        progress = stats.aiConversations;
        break;
    }

    if (progress >= def.maxProgress) {
      newlyUnlocked.push(def);
    }
  }

  return newlyUnlocked;
}
