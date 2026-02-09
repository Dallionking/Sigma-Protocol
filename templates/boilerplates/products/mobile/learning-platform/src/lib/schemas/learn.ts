import { z } from "zod";

export const tierSchema = z.enum(["free", "essential", "pro", "vip"]);
export type Tier = z.infer<typeof tierSchema>;

export const difficultySchema = z.enum(["beginner", "intermediate", "advanced"]);
export type Difficulty = z.infer<typeof difficultySchema>;

export const lessonContentTypeSchema = z.enum([
  "grammar",
  "vocabulary",
  "conversation",
  "culture",
  "slang",
]);
export type LessonContentType = z.infer<typeof lessonContentTypeSchema>;

export const lessonCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  order_index: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export type LessonCategory = z.infer<typeof lessonCategorySchema>;

const lessonSectionTextSchema = z.object({
  type: z.literal("text"),
  content: z.string().min(1),
});

const lessonSectionExampleSchema = z.object({
  type: z.literal("example"),
  /** The term or concept being taught */
  term: z.string().min(1),
  /** Definition or explanation */
  definition: z.string().min(1),
});

const lessonSectionAudioSchema = z.object({
  type: z.literal("audio"),
  url: z.string().min(1),
  transcript: z.string().optional(),
});

export const lessonSectionSchema = z.discriminatedUnion("type", [
  lessonSectionTextSchema,
  lessonSectionExampleSchema,
  lessonSectionAudioSchema,
]);

export type LessonSection = z.infer<typeof lessonSectionSchema>;

export const lessonHighlightSchema = z.object({
  term: z.string().min(1),
  translation: z.string().min(1),
  note: z.string().optional(),
});

export type LessonHighlight = z.infer<typeof lessonHighlightSchema>;

export const lessonContentSchema = z.object({
  sections: z.array(lessonSectionSchema),
  key_points: z.array(z.string()).optional(),
  audio_url: z.string().min(1).optional(),
  highlights: z.array(lessonHighlightSchema).optional(),
});

export type LessonContent = z.infer<typeof lessonContentSchema>;

export const lessonSchema = z.object({
  id: z.string().min(1),
  category_id: z.string().optional().nullable(),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  content_type: lessonContentTypeSchema.optional().nullable(),
  content: lessonContentSchema,
  duration_minutes: z.number().int().default(10),
  difficulty: difficultySchema,
  tier_required: tierSchema.default("free"),
  order_index: z.number().int().default(0),
  xp_reward: z.number().int().default(10),
  is_active: z.boolean().default(true),
});

export type Lesson = z.infer<typeof lessonSchema>;

export const lessonProgressStatusSchema = z.enum(["not_started", "in_progress", "completed"]);
export type LessonProgressStatus = z.infer<typeof lessonProgressStatusSchema>;

export const lessonPositionSchema = z.object({
  section_index: z.number().int().min(0).optional(),
  scroll_position: z.number().min(0).optional(),
});

export type LessonPosition = z.infer<typeof lessonPositionSchema>;

export const lessonProgressSchema = z.object({
  lesson_id: z.string().min(1),
  status: lessonProgressStatusSchema,
  completion_percent: z.number().int().min(0).max(100),
  last_position: lessonPositionSchema.default({}),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  xp_earned: z.number().int().min(0).optional(),
});

export type LessonProgress = z.infer<typeof lessonProgressSchema>;

export const vocabPartOfSpeechSchema = z.enum([
  "noun",
  "verb",
  "adjective",
  "adverb",
  "phrase",
  "other",
]);
export type VocabPartOfSpeech = z.infer<typeof vocabPartOfSpeechSchema>;

export const vocabularySchema = z.object({
  id: z.string().min(1),
  lesson_id: z.string().optional().nullable(),
  /** The term or concept being learned */
  term: z.string().min(1),
  /** Definition or explanation */
  definition: z.string().min(1),
  pronunciation_ipa: z.string().optional().nullable(),
  audio_url: z.string().optional().nullable(),
  part_of_speech: vocabPartOfSpeechSchema.optional().nullable(),
  /** Example usage of the term */
  example_term: z.string().optional().nullable(),
  /** Explanation of the example */
  example_definition: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  difficulty: difficultySchema.optional().nullable(),
  tier_required: tierSchema.default("free"),
});

export type Vocabulary = z.infer<typeof vocabularySchema>;

export const slangRegionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  flag_emoji: z.string().optional().nullable(),
  tier_required: tierSchema.default("pro"),
  order_index: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export type SlangRegion = z.infer<typeof slangRegionSchema>;

export const slangPhraseSchema = z.object({
  id: z.string().min(1),
  region_id: z.string().min(1),
  phrase: z.string().min(1),
  meaning: z.string().min(1),
  literal_translation: z.string().optional().nullable(),
  audio_url: z.string().optional().nullable(),
  example_usage: z.string().optional().nullable(),
  cultural_note: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

export type SlangPhrase = z.infer<typeof slangPhraseSchema>;

// These don’t exist in the DB schema doc yet; they’re local prototype shapes.
export const storySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  level: difficultySchema,
  text: z.string().min(1),
  glossary: z
    .array(
      z.object({
        term: z.string().min(1),
        translation: z.string().min(1),
      })
    )
    .optional(),
});

export type Story = z.infer<typeof storySchema>;

export const worksheetSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  pdf_url: z.string().min(1),
  tier_required: tierSchema.default("free"),
});

export type Worksheet = z.infer<typeof worksheetSchema>;



