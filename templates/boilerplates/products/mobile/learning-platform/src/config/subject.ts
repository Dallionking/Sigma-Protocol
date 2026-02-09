/**
 * Subject Configuration
 *
 * Configure the learning subject for this app instance.
 * Change these values to adapt the boilerplate to any subject area.
 */

export const subject = {
  /** Display name of the subject (e.g., "Spanish", "Piano", "Python") */
  name: "Your Subject",

  /** Short lowercase identifier (e.g., "spanish", "piano", "python") */
  slug: "subject",

  /** Icon name from lucide-react-native */
  icon: "BookOpen",

  /** Tagline shown on splash/welcome screens */
  tagline: "Master your skills with AI-powered lessons",

  /** Categories of content (customize per subject) */
  categories: ["Fundamentals", "Intermediate", "Advanced", "Practice"],

  /** Difficulty labels */
  difficulties: {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  },

  /** Onboarding goals (shown during goal-select) */
  goals: [
    { id: "career" as const, label: "Career growth", icon: "Briefcase" },
    { id: "personal" as const, label: "Personal development", icon: "User" },
    { id: "academic" as const, label: "Academic study", icon: "GraduationCap" },
    { id: "hobby" as const, label: "Hobby / fun", icon: "Heart" },
  ],

  /** AI tutor persona */
  tutor: {
    name: "AI Tutor",
    initials: "T",
    bio: "Your friendly AI tutor specializing in personalized learning.",
  },

  /** Practice exercise types available for this subject */
  exerciseTypes: [
    "mcq",
    "fill-blank",
    "speaking",
    "sentence-build",
    "listening",
    "translation",
    "timed-drill",
  ],

  /** Gamification settings */
  gamification: {
    xpPerLesson: 100,
    xpPerPractice: 50,
    xpPerStreak: 25,
    streakFreezeCount: 3,
  },
} as const;

export type SubjectGoalId = (typeof subject.goals)[number]["id"];
