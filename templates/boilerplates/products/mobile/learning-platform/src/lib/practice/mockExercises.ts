// Mock exercise data for all practice types

export type MCQQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export type FillBlankQuestion = {
  id: string;
  sentence: string; // Use __BLANK__ as placeholder
  answer: string;
  acceptableAnswers: string[]; // Variations (e.g., with/without accents)
  hint?: string;
};

export type SpeakingPrompt = {
  id: string;
  phrase: string;
  translation: string;
  difficulty: "easy" | "medium" | "hard";
};

export type SentenceBuildQuestion = {
  id: string;
  instruction: string;
  correctOrder: string[];
  shuffledTiles: string[];
};

export type ListeningQuestion = {
  id: string;
  audioUrl: string; // Placeholder - would be real audio in production
  transcript: string;
  question: string;
  options: string[];
  correctIndex: number;
};

export type TranslationQuestion = {
  id: string;
  source: string;
  sourceLanguage: "source" | "target";
  correctTranslation: string;
  acceptableTranslations: string[];
  hints: string[];
};

export type TimedDrillQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  category: "verb" | "vocab" | "grammar";
};

// MCQ Questions
export const MCQ_QUESTIONS: MCQQuestion[] = [
  {
    id: "mcq-1",
    question: "What is the primary purpose of active recall in learning?",
    options: ["Re-reading notes", "Actively retrieving information from memory", "Highlighting text", "Listening to lectures"],
    correctIndex: 1,
    explanation: "Active recall strengthens memory by forcing you to retrieve information rather than passively reviewing it.",
  },
  {
    id: "mcq-2",
    question: "Which technique is most effective for long-term retention?",
    options: ["Cramming", "Spaced repetition", "Reading once", "Copying notes"],
    correctIndex: 1,
    explanation: "Spaced repetition spaces out review sessions over increasing intervals for better retention.",
  },
  {
    id: "mcq-3",
    question: "What does 'synthesis' mean in a learning context?",
    options: [
      "Memorizing facts",
      "Combining multiple ideas into a unified understanding",
      "Breaking down a topic",
      "Repeating information",
    ],
    correctIndex: 1,
    explanation: "Synthesis involves combining separate ideas or concepts into a coherent whole.",
  },
  {
    id: "mcq-4",
    question: "Which learning strategy involves teaching concepts to others?",
    options: ["The Pomodoro Technique", "The Feynman Technique", "Mind mapping", "Speed reading"],
    correctIndex: 1,
    explanation: "The Feynman Technique involves explaining concepts in simple terms as if teaching someone else.",
  },
  {
    id: "mcq-5",
    question: "What is metacognition?",
    options: ["Speed reading", "Thinking about your own thinking", "Group study", "Note-taking"],
    correctIndex: 1,
    explanation: "Metacognition is awareness of your own thought processes and learning strategies.",
  },
];

// Fill in the Blank Questions
export const FILL_BLANK_QUESTIONS: FillBlankQuestion[] = [
  {
    id: "fill-1",
    sentence: "The process of learning from mistakes is called __BLANK__.",
    answer: "iteration",
    acceptableAnswers: ["iteration", "iterating"],
    hint: "Think: repeating and improving each time",
  },
  {
    id: "fill-2",
    sentence: "Breaking a complex problem into smaller parts is known as __BLANK__.",
    answer: "decomposition",
    acceptableAnswers: ["decomposition", "decomposing"],
    hint: "De- means apart, compose means put together",
  },
  {
    id: "fill-3",
    sentence: "A __BLANK__ is a testable prediction about the outcome of an experiment.",
    answer: "hypothesis",
    acceptableAnswers: ["hypothesis"],
    hint: "Starts with 'hypo-'",
  },
  {
    id: "fill-4",
    sentence: "The ability to understand and share the feelings of others is called __BLANK__.",
    answer: "empathy",
    acceptableAnswers: ["empathy"],
    hint: "Not sympathy, but...",
  },
  {
    id: "fill-5",
    sentence: "Reviewing material at increasing intervals is known as __BLANK__ repetition.",
    answer: "spaced",
    acceptableAnswers: ["spaced"],
    hint: "The opposite of cramming",
  },
];

// Speaking Prompts
export const SPEAKING_PROMPTS: SpeakingPrompt[] = [
  {
    id: "speak-1",
    phrase: "Hello, how are you doing today?",
    translation: "A common greeting to practice pronunciation",
    difficulty: "easy",
  },
  {
    id: "speak-2",
    phrase: "Could you explain that concept one more time?",
    translation: "Politely asking for clarification",
    difficulty: "medium",
  },
  {
    id: "speak-3",
    phrase: "I believe the most important factor is consistency.",
    translation: "Expressing an opinion with confidence",
    difficulty: "medium",
  },
  {
    id: "speak-4",
    phrase: "Nice to meet you, I look forward to working together.",
    translation: "Professional introduction",
    difficulty: "easy",
  },
  {
    id: "speak-5",
    phrase: "The research demonstrates a significant correlation between practice frequency and skill acquisition.",
    translation: "Academic-style statement for advanced practice",
    difficulty: "hard",
  },
];

// Sentence Build Questions
export const SENTENCE_BUILD_QUESTIONS: SentenceBuildQuestion[] = [
  {
    id: "build-1",
    instruction: "Build a correct sentence about learning",
    correctOrder: ["Practice", "makes", "perfect", "progress"],
    shuffledTiles: ["progress", "makes", "perfect", "Practice"],
  },
  {
    id: "build-2",
    instruction: "Arrange into a meaningful statement",
    correctOrder: ["Knowledge", "is", "built", "through", "experience"],
    shuffledTiles: ["experience", "Knowledge", "through", "is", "built"],
  },
  {
    id: "build-3",
    instruction: "Form a complete thought",
    correctOrder: ["Every", "expert", "was", "once", "a", "beginner"],
    shuffledTiles: ["beginner", "once", "was", "a", "Every", "expert"],
  },
  {
    id: "build-4",
    instruction: "Create a motivational statement",
    correctOrder: ["Small", "steps", "lead", "to", "big", "results"],
    shuffledTiles: ["results", "Small", "to", "lead", "big", "steps"],
  },
  {
    id: "build-5",
    instruction: "Arrange the words correctly",
    correctOrder: ["Consistency", "beats", "intensity"],
    shuffledTiles: ["intensity", "Consistency", "beats"],
  },
];

// Listening Questions
export const LISTENING_QUESTIONS: ListeningQuestion[] = [
  {
    id: "listen-1",
    audioUrl: "placeholder://audio-1",
    transcript: "The key to learning is consistent daily practice.",
    question: "What does the speaker say is key to learning?",
    options: ["Talent", "Consistent daily practice", "Reading books", "Taking notes"],
    correctIndex: 1,
  },
  {
    id: "listen-2",
    audioUrl: "placeholder://audio-2",
    transcript: "The study session starts at three in the afternoon.",
    question: "When does the study session start?",
    options: ["2 PM", "3 PM", "4 PM", "5 PM"],
    correctIndex: 1,
  },
  {
    id: "listen-3",
    audioUrl: "placeholder://audio-3",
    transcript: "I completed four lessons and two practice exercises today.",
    question: "How many total activities did the speaker complete?",
    options: ["4", "5", "6", "7"],
    correctIndex: 2,
  },
  {
    id: "listen-4",
    audioUrl: "placeholder://audio-4",
    transcript: "The workshop covers three main topics: fundamentals, application, and review.",
    question: "How many main topics does the workshop cover?",
    options: ["2", "3", "4", "5"],
    correctIndex: 1,
  },
  {
    id: "listen-5",
    audioUrl: "placeholder://audio-5",
    transcript: "Remember to review your notes before the assessment tomorrow.",
    question: "What should the listener do before the assessment?",
    options: ["Take a break", "Review notes", "Start a new topic", "Skip it"],
    correctIndex: 1,
  },
];

// Translation Questions (generic: rephrase/simplify exercises)
export const TRANSLATION_QUESTIONS: TranslationQuestion[] = [
  {
    id: "trans-1",
    source: "The acquisition of knowledge requires consistent effort over time.",
    sourceLanguage: "source",
    correctTranslation: "Learning takes steady effort over time.",
    acceptableTranslations: [
      "Learning takes steady effort over time.",
      "Gaining knowledge requires consistent effort.",
    ],
    hints: ["acquisition = gaining", "consistent = steady"],
  },
  {
    id: "trans-2",
    source: "Practice makes progress.",
    sourceLanguage: "target",
    correctTranslation: "Regular practice leads to improvement.",
    acceptableTranslations: [
      "Regular practice leads to improvement.",
      "Practicing regularly helps you improve.",
    ],
    hints: ["practice = regular effort", "progress = improvement"],
  },
  {
    id: "trans-3",
    source: "A hypothesis must be testable and falsifiable.",
    sourceLanguage: "source",
    correctTranslation: "A hypothesis needs to be tested and proven wrong.",
    acceptableTranslations: [
      "A hypothesis needs to be tested and proven wrong.",
      "You must be able to test and disprove a hypothesis.",
    ],
    hints: ["testable = can be tested", "falsifiable = can be proven wrong"],
  },
  {
    id: "trans-4",
    source: "Spaced repetition enhances long-term retention.",
    sourceLanguage: "source",
    correctTranslation: "Reviewing at intervals helps you remember longer.",
    acceptableTranslations: [
      "Reviewing at intervals helps you remember longer.",
      "Spacing out your reviews improves long-term memory.",
    ],
    hints: ["spaced = at intervals", "retention = remembering"],
  },
  {
    id: "trans-5",
    source: "Critical thinking involves analyzing and evaluating information.",
    sourceLanguage: "source",
    correctTranslation: "Critical thinking means carefully analyzing and judging information.",
    acceptableTranslations: [
      "Critical thinking means carefully analyzing and judging information.",
      "Thinking critically means analyzing and evaluating what you learn.",
    ],
    hints: ["analyzing = examining closely", "evaluating = judging quality"],
  },
];

// Timed Drill Questions
export const TIMED_DRILL_QUESTIONS: TimedDrillQuestion[] = [
  {
    id: "timed-1",
    prompt: "Synonym of 'begin'",
    options: ["end", "start", "pause", "stop"],
    correctIndex: 1,
    category: "vocab",
  },
  {
    id: "timed-2",
    prompt: "Opposite of 'simple'",
    options: ["easy", "basic", "complex", "plain"],
    correctIndex: 2,
    category: "vocab",
  },
  {
    id: "timed-3",
    prompt: "'To examine closely' means to...",
    options: ["ignore", "guess", "analyze", "forget"],
    correctIndex: 2,
    category: "vocab",
  },
  {
    id: "timed-4",
    prompt: "Complete: 'Practice makes ___'",
    options: ["perfect", "progress", "problems", "pressure"],
    correctIndex: 1,
    category: "grammar",
  },
  {
    id: "timed-5",
    prompt: "A 'hypothesis' is a type of...",
    options: ["fact", "prediction", "conclusion", "opinion"],
    correctIndex: 1,
    category: "vocab",
  },
  {
    id: "timed-6",
    prompt: "Which is NOT a study technique?",
    options: ["Flashcards", "Spaced repetition", "Procrastination", "Active recall"],
    correctIndex: 2,
    category: "grammar",
  },
  {
    id: "timed-7",
    prompt: "Synonym of 'understand'",
    options: ["comprehend", "forget", "ignore", "avoid"],
    correctIndex: 0,
    category: "vocab",
  },
  {
    id: "timed-8",
    prompt: "'Retention' refers to...",
    options: ["forgetting", "remembering", "guessing", "skipping"],
    correctIndex: 1,
    category: "vocab",
  },
  {
    id: "timed-9",
    prompt: "What does 'iterate' mean?",
    options: ["Stop", "Repeat and improve", "Delete", "Copy exactly"],
    correctIndex: 1,
    category: "vocab",
  },
  {
    id: "timed-10",
    prompt: "Opposite of 'theory'",
    options: ["practice", "idea", "concept", "thought"],
    correctIndex: 0,
    category: "vocab",
  },
];

// Exercise type metadata
export const EXERCISE_TYPES = [
  {
    id: "mcq" as const,
    name: "Multiple Choice",
    description: "Test your knowledge with instant feedback",
    icon: "CheckSquare",
    questionCount: MCQ_QUESTIONS.length,
  },
  {
    id: "fill-blank" as const,
    name: "Fill in the Blank",
    description: "Complete the sentence with the right word",
    icon: "PenLine",
    questionCount: FILL_BLANK_QUESTIONS.length,
  },
  {
    id: "speaking" as const,
    name: "Speaking",
    description: "Practice your pronunciation",
    icon: "Mic",
    questionCount: SPEAKING_PROMPTS.length,
  },
  {
    id: "sentence-build" as const,
    name: "Sentence Builder",
    description: "Arrange words in the correct order",
    icon: "Layers",
    questionCount: SENTENCE_BUILD_QUESTIONS.length,
  },
  {
    id: "listening" as const,
    name: "Listening",
    description: "Listen and answer comprehension questions",
    icon: "Headphones",
    questionCount: LISTENING_QUESTIONS.length,
  },
  {
    id: "translation" as const,
    name: "Translation",
    description: "Rephrase and simplify complex statements",
    icon: "Languages",
    questionCount: TRANSLATION_QUESTIONS.length,
  },
  {
    id: "timed-drill" as const,
    name: "Timed Drill",
    description: "Race against the clock!",
    icon: "Timer",
    questionCount: TIMED_DRILL_QUESTIONS.length,
  },
];

