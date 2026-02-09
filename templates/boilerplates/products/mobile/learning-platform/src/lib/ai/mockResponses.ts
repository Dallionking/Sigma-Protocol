import type { AIMode, Correction } from "@/stores/aiStore";

// AI Tutor's greeting messages per mode
export const GREETINGS: Record<AIMode, string[]> = {
  conversation: [
    "Hello! Ready to chat? Let's practice together!",
    "Hey there! What would you like to talk about today?",
    "Welcome! I'm here to help you practice. What's on your mind?",
  ],
  grammar: [
    "Great! Let's work on your fundamentals. I'll help with any tricky spots!",
    "Study time! Don't worry -- I'll explain everything clearly.",
    "Ready to level up your skills? Let's dive in!",
  ],
  story: [
    "How exciting! Let's create a story together. I'll start...",
    "Story time! We'll build something amazing together.",
    "Once upon a time... just kidding! Let's make this story truly yours.",
  ],
  drill: [
    "Let's go! Quick practice mode. I'll keep you on your toes!",
    "Drill time! Short and sweet -- let's sharpen those skills.",
    "Ready for rapid-fire practice? Here we go!",
  ],
  voice: [
    "I'm listening! Speak whenever you're ready.",
    "Let's practice! Speak clearly and I'll give you feedback.",
    "Voice mode activated! Just press and hold to talk to me.",
  ],
};

// Pre-written conversation responses
export const CONVERSATION_RESPONSES = [
  {
    triggers: ["hello", "hi", "hey"],
    responses: [
      "Hello! How are you today?",
      "Hey! Nice to hear from you. How's it going?",
      "Hi there! Tell me, how's your day going?",
    ],
  },
  {
    triggers: ["good", "great", "fine", "well"],
    responses: [
      "That's great to hear. What would you like to practice?",
      "Wonderful! Shall we try a new topic?",
      "Excellent! How about we practice some key concepts?",
    ],
  },
  {
    triggers: ["learn", "study", "practice", "teach"],
    responses: [
      "Great enthusiasm! What topic would you like to focus on?",
      "Love the motivation! Let's start with something practical.",
      "Perfect! You're building great habits by practicing regularly.",
    ],
  },
  {
    triggers: ["hard", "difficult", "confused", "stuck"],
    responses: [
      "No worries! Take your time. What specifically is confusing?",
      "Learning takes time. Let's break it down together.",
      "I've got you! Let's try a simpler example first.",
    ],
  },
  {
    triggers: ["help", "assist", "don't understand", "explain"],
    responses: [
      "No worries! Take your time. What specifically is confusing?",
      "Don't worry! Learning takes time. Let's break it down together.",
      "I've got you! Let's try a simpler example first.",
    ],
  },
];

// Grammar corrections with explanations
export const GRAMMAR_CORRECTIONS: Array<{
  incorrect: string;
  correction: Correction;
}> = [
  {
    incorrect: "i dont understand",
    correction: {
      original: "i dont understand",
      corrected: "I don't understand",
      explanation: "Remember to capitalize 'I' and use an apostrophe in contractions like 'don't'.",
    },
  },
  {
    incorrect: "me and him",
    correction: {
      original: "me and him",
      corrected: "he and I",
      explanation: "When used as a subject, use 'he and I' rather than 'me and him'.",
    },
  },
  {
    incorrect: "could of",
    correction: {
      original: "could of",
      corrected: "could have",
      explanation: "'Could of' is a common mistake. The correct form is 'could have' (or 'could've').",
    },
  },
  {
    incorrect: "less items",
    correction: {
      original: "less items",
      corrected: "fewer items",
      explanation: "Use 'fewer' for countable nouns and 'less' for uncountable quantities.",
    },
  },
];

// Story starters and continuations
export const STORY_PROMPTS = [
  {
    starter: "Maria walked into the library and saw something unusual...",
    hint: "Try: 'She noticed something on the top shelf...'",
  },
  {
    starter: "The old professor told me a secret about the ancient text...",
    hint: "Try: 'It was a hidden message...'",
  },
  {
    starter: "Last summer during the workshop, I discovered a hidden technique...",
    hint: "Try: 'It changed the way I approached problems...'",
  },
];

export const STORY_CONTINUATIONS = [
  "How interesting! And then what happened?",
  "Love it! Keep going -- what did they do next?",
  "Fantastic! I can picture it perfectly. Continue!",
  "Great imagination! What happened after that?",
];

// Drill questions
export const DRILL_QUESTIONS = [
  {
    question: "What is the key difference between 'affect' and 'effect'?",
    answer: "'Affect' is usually a verb, 'effect' is usually a noun",
    hint: "Think: A for Action (verb), E for End result (noun)!",
  },
  {
    question: "Define 'synthesis' in your own words.",
    answer: "Combining multiple ideas or concepts into a unified whole",
    hint: "Think about bringing parts together.",
  },
  {
    question: "What does 'comprehension' mean?",
    answer: "The ability to understand something",
    hint: "Related to 'comprehend' -- to grasp the meaning.",
  },
  {
    question: "Explain the difference between 'theory' and 'hypothesis'.",
    answer: "A hypothesis is a testable prediction; a theory is a well-supported explanation",
    hint: "One is a guess, the other is well-established.",
  },
  {
    question: "What is 'active recall' in learning?",
    answer: "A study technique where you actively try to remember information",
    hint: "The opposite of passively re-reading notes.",
  },
];

// Encouragement phrases AI Tutor uses
export const ENCOURAGEMENTS = [
  "Well done!",
  "Nice try!",
  "Almost there!",
  "Love it!",
  "Perfect!",
  "You're getting it!",
  "Keep going!",
  "Excellent!",
  "That's the spirit!",
  "Way to go!",
];

// Fallback responses when no pattern matches
export const FALLBACK_RESPONSES = [
  "Interesting! Tell me more about that.",
  "I see! Can you elaborate on that?",
  "Good thinking! Let's explore that concept further.",
  "Nice! How about we try a related topic?",
  "Got it! What else would you like to practice?",
];

// Helper to get random item from array
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Get a greeting for the mode
export function getGreeting(mode: AIMode): string {
  return getRandomItem(GREETINGS[mode]);
}

// Get a response based on user input
export function getConversationResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  for (const { triggers, responses } of CONVERSATION_RESPONSES) {
    if (triggers.some((trigger) => lowerMessage.includes(trigger))) {
      return getRandomItem(responses);
    }
  }

  return getRandomItem(FALLBACK_RESPONSES);
}

// Check for grammar corrections
export function checkForCorrections(
  userMessage: string
): Correction | undefined {
  const lowerMessage = userMessage.toLowerCase();

  for (const { incorrect, correction } of GRAMMAR_CORRECTIONS) {
    if (lowerMessage.includes(incorrect.toLowerCase())) {
      return correction;
    }
  }

  return undefined;
}

// Get next drill question
let drillIndex = 0;
export function getNextDrillQuestion(): (typeof DRILL_QUESTIONS)[0] {
  const question = DRILL_QUESTIONS[drillIndex % DRILL_QUESTIONS.length];
  drillIndex++;
  return question;
}

// Get story continuation
export function getStoryContinuation(): string {
  return getRandomItem(STORY_CONTINUATIONS);
}

// Get encouragement
export function getEncouragement(): string {
  return getRandomItem(ENCOURAGEMENTS);
}

// Simulate typing delay (returns promise that resolves after delay)
export function simulateTypingDelay(): Promise<void> {
  const delay = 800 + Math.random() * 700; // 800-1500ms
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// Mode metadata
export const AI_MODES = [
  {
    id: "conversation" as const,
    name: "Free Chat",
    description: "Practice everyday conversation",
    icon: "MessageCircle",
  },
  {
    id: "grammar" as const,
    name: "Study Focus",
    description: "Get corrections and explanations",
    icon: "BookOpen",
  },
  {
    id: "story" as const,
    name: "Story Mode",
    description: "Build a story together",
    icon: "BookText",
  },
  {
    id: "drill" as const,
    name: "Quick Drill",
    description: "Rapid-fire practice",
    icon: "Zap",
  },
  {
    id: "voice" as const,
    name: "Voice Chat",
    description: "Speak with AI Tutor",
    icon: "Mic",
  },
];
