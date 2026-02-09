import type {
  Lesson,
  LessonCategory,
  SlangPhrase,
  SlangRegion,
  Story,
  Vocabulary,
  Worksheet,
} from "@/lib/schemas/learn";

export const MOCK_CATEGORIES: LessonCategory[] = [
  {
    id: "cat-fundamentals",
    name: "Fundamentals",
    slug: "fundamentals",
    description: "Core concepts every learner needs",
    icon: "BookOpen",
    color: "#818CF8",
    order_index: 0,
    is_active: true,
  },
  {
    id: "cat-intermediate",
    name: "Intermediate",
    slug: "intermediate",
    description: "Build on the basics with deeper concepts",
    icon: "Clock",
    color: "#2DD4BF",
    order_index: 1,
    is_active: true,
  },
  {
    id: "cat-applied",
    name: "Applied Skills",
    slug: "applied",
    description: "Real-world applications and scenarios",
    icon: "Briefcase",
    color: "#FBBF24",
    order_index: 2,
    is_active: true,
  },
  {
    id: "cat-advanced",
    name: "Advanced",
    slug: "advanced",
    description: "Master complex topics and patterns",
    icon: "GraduationCap",
    color: "#A5B4FC",
    order_index: 3,
    is_active: true,
  },
];

export const MOCK_LESSONS: Lesson[] = [
  {
    id: "les-fund-01",
    category_id: "cat-fundamentals",
    title: "Getting Started",
    slug: "getting-started",
    description: "Your first steps into the subject.",
    content_type: "conversation",
    content: {
      sections: [
        {
          type: "text",
          content:
            "Tip: Start simple, stay confident. Your goal is understanding, not perfection.",
        },
        {
          type: "text",
          content:
            "In this lesson, we cover the essential building blocks you need to begin your journey.",
        },
        {
          type: "example",
          term: "Key concept: Foundation",
          definition: "Every expert was once a beginner.",
        },
        {
          type: "example",
          term: "Key concept: Practice",
          definition: "Consistent small steps lead to big results.",
        },
      ],
      highlights: [
        {
          term: "foundation",
          translation: "The base knowledge everything builds on",
          note: "Master this before moving forward.",
        },
        { term: "practice", translation: "Repeated application of concepts" },
        { term: "comprehension", translation: "Deep understanding" },
        { term: "retention", translation: "Ability to remember and recall" },
      ],
    },
    duration_minutes: 8,
    difficulty: "beginner",
    tier_required: "free",
    order_index: 0,
    xp_reward: 120,
    is_active: true,
  },
  {
    id: "les-fund-02",
    category_id: "cat-fundamentals",
    title: "Core Principles",
    slug: "core-principles",
    description: "Understanding the rules that govern the basics.",
    content_type: "grammar",
    content: {
      sections: [
        { type: "text", content: "Master these principles to build a strong foundation." },
        {
          type: "example",
          term: "Principle 1: Structure",
          definition: "Every concept has an underlying structure.",
        },
        {
          type: "example",
          term: "Principle 2: Patterns",
          definition: "Recognizing patterns accelerates learning.",
        },
      ],
      highlights: [
        { term: "structure", translation: "The organized framework of a concept" },
        { term: "pattern", translation: "A repeated or predictable arrangement" },
        { term: "rule", translation: "A governing principle" },
      ],
    },
    duration_minutes: 10,
    difficulty: "beginner",
    tier_required: "essential",
    order_index: 1,
    xp_reward: 90,
    is_active: true,
  },
  {
    id: "les-fund-03",
    category_id: "cat-fundamentals",
    title: "Quick Reference Guide",
    slug: "quick-reference",
    description: "Short concepts that help when you are stuck.",
    content_type: "conversation",
    content: {
      sections: [
        { type: "text", content: "When in doubt, revisit the basics." },
        {
          type: "example",
          term: "Tip: Break it down",
          definition: "Complex problems are just simple problems stacked together.",
        },
        {
          type: "example",
          term: "Tip: Ask questions",
          definition: "Curiosity drives deeper understanding.",
        },
      ],
      highlights: [
        { term: "simplify", translation: "Make something easier to understand" },
        { term: "decompose", translation: "Break into smaller parts" },
      ],
    },
    duration_minutes: 7,
    difficulty: "beginner",
    tier_required: "pro",
    order_index: 2,
    xp_reward: 80,
    is_active: true,
  },

  {
    id: "les-inter-01",
    category_id: "cat-intermediate",
    title: "Building on Basics",
    slug: "building-on-basics",
    description: "Connect what you know to new concepts.",
    content_type: "grammar",
    content: {
      sections: [
        {
          type: "text",
          content:
            "Now that you have the fundamentals, let's connect them to form deeper understanding.",
        },
        { type: "example", term: "Step 1: Review", definition: "Recall what you already know." },
        { type: "example", term: "Step 2: Connect", definition: "Link old concepts to new ones." },
      ],
      highlights: [
        { term: "synthesis", translation: "Combining ideas into a whole" },
        { term: "connection", translation: "A link between concepts" },
        { term: "application", translation: "Putting knowledge to use" },
      ],
    },
    duration_minutes: 10,
    difficulty: "beginner",
    tier_required: "free",
    order_index: 0,
    xp_reward: 100,
    is_active: true,
  },

  {
    id: "les-applied-01",
    category_id: "cat-applied",
    title: "Real-World Scenario",
    slug: "real-world-scenario",
    description: "Apply what you have learned to practical situations.",
    content_type: "conversation",
    content: {
      sections: [
        { type: "text", content: "Practice applying concepts in realistic contexts." },
        {
          type: "example",
          term: "Scenario: Problem solving",
          definition: "Use your knowledge to work through a challenge.",
        },
        {
          type: "example",
          term: "Scenario: Decision making",
          definition: "Evaluate options using what you have learned.",
        },
      ],
      highlights: [
        { term: "scenario", translation: "A situation used for practice" },
        { term: "context", translation: "The circumstances around a problem" },
      ],
    },
    duration_minutes: 9,
    difficulty: "beginner",
    tier_required: "free",
    order_index: 0,
    xp_reward: 90,
    is_active: true,
  },

  {
    id: "les-adv-01",
    category_id: "cat-advanced",
    title: "Advanced Techniques",
    slug: "advanced-techniques",
    description: "Level up with expert-level approaches.",
    content_type: "conversation",
    content: {
      sections: [
        { type: "text", content: "Ready to go deeper? These techniques separate good from great." },
        { type: "example", term: "Technique: Analysis", definition: "Break down complex problems systematically." },
        {
          type: "example",
          term: "Technique: Optimization",
          definition: "Find the most efficient approach.",
        },
      ],
      highlights: [
        { term: "analysis", translation: "Detailed examination" },
        { term: "optimization", translation: "Making something as effective as possible" },
      ],
    },
    duration_minutes: 8,
    difficulty: "beginner",
    tier_required: "free",
    order_index: 0,
    xp_reward: 80,
    is_active: true,
  },
];

export const MOCK_VOCAB: Vocabulary[] = [
  {
    id: "vocab-foundation",
    lesson_id: "les-fund-01",
    term: "foundation",
    definition: "The base knowledge everything builds on",
    pronunciation_ipa: "/faʊnˈdeɪʃən/",
    part_of_speech: "noun",
    example_term: "A strong foundation is essential.",
    example_definition: "Build your foundation first.",
    notes: "Core concept in any learning journey.",
    difficulty: "beginner",
    tier_required: "free",
  },
  {
    id: "vocab-practice",
    lesson_id: "les-fund-01",
    term: "practice",
    definition: "Repeated application of concepts",
    pronunciation_ipa: "/ˈpræktɪs/",
    part_of_speech: "noun",
    example_term: "Practice makes progress.",
    example_definition: "Daily practice builds mastery.",
    difficulty: "beginner",
    tier_required: "free",
  },
  {
    id: "vocab-comprehension",
    lesson_id: "les-fund-01",
    term: "comprehension",
    definition: "Deep understanding",
    pronunciation_ipa: "/ˌkɒmprɪˈhenʃən/",
    part_of_speech: "noun",
    example_term: "Test your comprehension regularly.",
    example_definition: "Reading improves comprehension.",
    difficulty: "beginner",
    tier_required: "free",
  },
  {
    id: "vocab-pattern",
    lesson_id: "les-fund-02",
    term: "pattern",
    definition: "A repeated arrangement",
    pronunciation_ipa: "/ˈpætərn/",
    part_of_speech: "noun",
    example_term: "Identify the pattern in the data.",
    example_definition: "Patterns help predict outcomes.",
    difficulty: "beginner",
    tier_required: "essential",
  },
];

export const MOCK_SLANG_REGIONS: SlangRegion[] = [
  {
    id: "region-informal",
    name: "Informal",
    slug: "informal",
    description: "Casual and conversational usage.",
    flag_emoji: "💬",
    tier_required: "pro",
    order_index: 0,
    is_active: true,
  },
  {
    id: "region-professional",
    name: "Professional",
    slug: "professional",
    description: "Formal and workplace terminology.",
    flag_emoji: "💼",
    tier_required: "pro",
    order_index: 1,
    is_active: true,
  },
];

export const MOCK_SLANG_PHRASES: SlangPhrase[] = [
  {
    id: "phrase-shortcut",
    region_id: "region-informal",
    phrase: "Quick Win",
    meaning: "An easily achievable success",
    literal_translation: "Fast victory",
    example_usage: "Start with a quick win to build momentum.",
    cultural_note: "Common in productivity and learning contexts.",
    is_active: true,
  },
  {
    id: "phrase-deep-dive",
    region_id: "region-professional",
    phrase: "Deep Dive",
    meaning: "Thorough exploration of a topic",
    literal_translation: "In-depth study",
    example_usage: "Let's do a deep dive into this concept.",
    cultural_note: "Used in professional and educational settings.",
    is_active: true,
  },
];

export const MOCK_STORIES: Story[] = [
  {
    id: "story-01",
    title: "The First Step",
    level: "beginner",
    text:
      "It was a quiet evening. I sat down with my notes and started reviewing. Something clicked -- the pattern I had been struggling with finally made sense.",
    glossary: [
      { term: "review", translation: "to go over material again" },
      { term: "pattern", translation: "a recurring structure" },
      { term: "clicked", translation: "suddenly understood" },
    ],
  },
  {
    id: "story-02",
    title: "The Study Group",
    level: "beginner",
    text:
      "I joined a study group. We shared notes and quizzed each other. By the end of the session, everyone felt more confident.",
    glossary: [
      { term: "study group", translation: "a collaborative learning session" },
      { term: "quizzed", translation: "tested knowledge" },
      { term: "confident", translation: "feeling sure of abilities" },
    ],
  },
];

export const MOCK_WORKSHEETS: Worksheet[] = [
  {
    id: "ws-01",
    title: "Fundamentals Worksheet",
    description: "Practice core concepts with fill-in exercises.",
    pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    tier_required: "free",
  },
  {
    id: "ws-02",
    title: "Advanced Practice Guide",
    description: "Deeper exercises for advanced learners.",
    pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    tier_required: "pro",
  },
];

export function getCategoryById(categoryId: string) {
  return MOCK_CATEGORIES.find((c) => c.id === categoryId) ?? null;
}

export function getLessonById(lessonId: string) {
  return MOCK_LESSONS.find((l) => l.id === lessonId) ?? null;
}

export function getLessonsByCategoryId(categoryId: string) {
  return MOCK_LESSONS
    .filter((l) => l.category_id === categoryId)
    .sort((a, b) => a.order_index - b.order_index);
}

export function getVocabByLessonId(lessonId: string) {
  return MOCK_VOCAB.filter((v) => v.lesson_id === lessonId);
}

export function getSlangPhrasesByRegionId(regionId: string) {
  return MOCK_SLANG_PHRASES.filter((p) => p.region_id === regionId);
}

export function getStoryById(storyId: string) {
  return MOCK_STORIES.find((s) => s.id === storyId) ?? null;
}

export function getWorksheetById(worksheetId: string) {
  return MOCK_WORKSHEETS.find((w) => w.id === worksheetId) ?? null;
}
