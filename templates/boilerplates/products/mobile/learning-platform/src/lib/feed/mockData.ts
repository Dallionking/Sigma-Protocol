import { Post, Homework, Comment, Author } from "@/stores/feedStore";
import { addDays, subDays, subHours, subMinutes } from "date-fns";

export const TUTOR_AUTHOR: Author = {
  id: "tutor_001",
  name: "AI Tutor",
  avatar: "tutor",
  isAdmin: true,
};

export const COMMUNITY_AUTHORS: Author[] = [
  {
    id: "user_001",
    name: "Alex",
    avatar: "https://i.pravatar.cc/150?u=alex",
  },
  {
    id: "user_002",
    name: "Jordan",
    avatar: "https://i.pravatar.cc/150?u=jordan",
  },
  {
    id: "user_003",
    name: "Sam",
    avatar: "https://i.pravatar.cc/150?u=sam",
  },
];

const now = new Date();

export const MOCK_POSTS: Post[] = [
  {
    id: "post_001",
    author: TUTOR_AUTHOR,
    content:
      "This week we are focusing on core fundamentals! Practice these key concepts and make sure you can explain them in your own words. Keep at it and you will master them in no time!",
    type: "announcement",
    likes: 42,
    likedByUser: false,
    commentCount: 8,
    isPinned: true,
    createdAt: subHours(now, 2).toISOString(),
  },
  {
    id: "post_002",
    author: TUTOR_AUTHOR,
    content:
      "Mini Lesson: Understanding patterns is essential for mastering any subject!\n\n1. Identify the pattern\n2. Understand the rule\n3. Apply it in new contexts\n\nTry this approach with today's practice exercises.",
    type: "lesson",
    likes: 28,
    likedByUser: true,
    commentCount: 5,
    isPinned: false,
    createdAt: subHours(now, 6).toISOString(),
  },
  {
    id: "post_003",
    author: COMMUNITY_AUTHORS[0],
    content:
      "Just completed my first full lesson without any hints! The tips from yesterday's session really helped!",
    type: "text",
    likes: 15,
    likedByUser: false,
    commentCount: 3,
    isPinned: false,
    createdAt: subHours(now, 12).toISOString(),
  },
  {
    id: "post_004",
    author: TUTOR_AUTHOR,
    content:
      "Tip of the day: Don't be afraid to make mistakes! Every error is a learning opportunity. Remember: nothing ventured, nothing gained.",
    type: "text",
    likes: 56,
    likedByUser: false,
    commentCount: 12,
    isPinned: false,
    createdAt: subDays(now, 1).toISOString(),
  },
  {
    id: "post_005",
    author: TUTOR_AUTHOR,
    content:
      "Review time!\n\nKey concepts from this week:\n1. Foundations\n2. Patterns\n3. Application\n4. Synthesis\n\nPractice explaining each one in your own words!",
    type: "lesson",
    likes: 33,
    likedByUser: false,
    commentCount: 7,
    isPinned: false,
    createdAt: subDays(now, 2).toISOString(),
  },
  {
    id: "post_006",
    author: COMMUNITY_AUTHORS[1],
    content:
      "Anyone else struggling with the advanced exercises? Any tips would be appreciated!",
    type: "text",
    likes: 8,
    likedByUser: false,
    commentCount: 14,
    isPinned: false,
    createdAt: subDays(now, 2).toISOString(),
  },
  {
    id: "post_007",
    author: TUTOR_AUTHOR,
    content:
      "Welcome to all new learners joining us this week! Remember: consistency beats intensity. Just 10 minutes a day will take you far. Let's go!",
    type: "announcement",
    likes: 89,
    likedByUser: false,
    commentCount: 21,
    isPinned: false,
    createdAt: subDays(now, 3).toISOString(),
  },
];

export const MOCK_HOMEWORK: Homework[] = [
  {
    id: "hw_001",
    title: "Concept Practice",
    description:
      "Write out explanations for 5 key concepts from this week's lessons. Include at least one example for each.",
    dueDate: addDays(now, 2).toISOString(),
    isCompleted: false,
  },
  {
    id: "hw_002",
    title: "Pattern Recognition Exercise",
    description:
      "Identify and describe 3 patterns from the practice exercises. Explain how each pattern works.",
    dueDate: addDays(now, 5).toISOString(),
    isCompleted: false,
  },
  {
    id: "hw_003",
    title: "Self-Introduction Recording",
    description:
      "Record a 30-second introduction about yourself. Include your name, your learning goals, and one thing you have learned so far.",
    dueDate: subDays(now, 1).toISOString(),
    isCompleted: true,
    submission: {
      text: "Completed the recording about my learning journey.",
      submittedAt: subDays(now, 2).toISOString(),
    },
  },
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: "comment_001",
    postId: "post_001",
    author: COMMUNITY_AUTHORS[0],
    content: "Love this week's theme! Can't wait to practice these concepts.",
    createdAt: subHours(now, 1).toISOString(),
  },
  {
    id: "comment_002",
    postId: "post_001",
    author: COMMUNITY_AUTHORS[1],
    content: "Is there a lesson on applying these concepts in real-world scenarios?",
    createdAt: subMinutes(now, 45).toISOString(),
  },
  {
    id: "comment_003",
    postId: "post_001",
    author: TUTOR_AUTHOR,
    content: "Great question Jordan! I'll make a post about that tomorrow.",
    createdAt: subMinutes(now, 30).toISOString(),
  },
  {
    id: "comment_004",
    postId: "post_002",
    author: COMMUNITY_AUTHORS[2],
    content: "The step-by-step breakdowns are so helpful. Thank you!",
    createdAt: subHours(now, 4).toISOString(),
  },
  {
    id: "comment_005",
    postId: "post_003",
    author: TUTOR_AUTHOR,
    content: "Amazing progress Alex! Keep it up!",
    createdAt: subHours(now, 10).toISOString(),
  },
  {
    id: "comment_006",
    postId: "post_006",
    author: TUTOR_AUTHOR,
    content:
      "Great question! Try breaking the problem into smaller parts first. Focus on one concept at a time, then gradually combine them.",
    createdAt: subDays(now, 1).toISOString(),
    replies: [
      {
        id: "comment_007",
        postId: "post_006",
        author: COMMUNITY_AUTHORS[1],
        content: "This tip is gold! It's starting to click now.",
        createdAt: subHours(now, 20).toISOString(),
      },
    ],
  },
];

export function getCommentsForPost(postId: string): Comment[] {
  return MOCK_COMMENTS.filter((c) => c.postId === postId);
}

export function getPinnedPosts(): Post[] {
  return MOCK_POSTS.filter((p) => p.isPinned);
}

export function getRegularPosts(): Post[] {
  return MOCK_POSTS.filter((p) => !p.isPinned);
}

export function getPendingHomework(): Homework[] {
  return MOCK_HOMEWORK.filter((h) => !h.isCompleted);
}

export function getCompletedHomework(): Homework[] {
  return MOCK_HOMEWORK.filter((h) => h.isCompleted);
}
