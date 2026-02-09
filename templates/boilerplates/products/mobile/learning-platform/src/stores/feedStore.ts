import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type PostType = "text" | "video" | "lesson" | "announcement";

export interface Author {
  id: string;
  name: string;
  avatar: string; // "tutor" for TutorAvatar, URL for others
  isAdmin?: boolean;
}

export interface Post {
  id: string;
  author: Author;
  content: string;
  mediaUrl?: string;
  type: PostType;
  likes: number;
  likedByUser: boolean;
  commentCount: number;
  isPinned: boolean;
  createdAt: string; // ISO string
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO string
  isCompleted: boolean;
  submission?: {
    text?: string;
    audioUrl?: string;
    submittedAt: string;
  };
}

export interface Comment {
  id: string;
  postId: string;
  author: Author;
  content: string;
  createdAt: string; // ISO string
  replies?: Comment[];
}

interface FeedState {
  posts: Post[];
  homework: Homework[];
  comments: Comment[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setPosts: (posts: Post[]) => void;
  likePost: (postId: string) => void;
  unlikePost: (postId: string) => void;
  addComment: (postId: string, content: string, author: Author) => void;
  setHomework: (homework: Homework[]) => void;
  submitHomework: (homeworkId: string, submission: { text?: string; audioUrl?: string }) => void;
  createPost: (post: Omit<Post, "id" | "likes" | "likedByUser" | "commentCount" | "createdAt">) => void;
  reset: () => void;
}

export const useFeedStore = create<FeedState>()(
  persist(
    (set, get) => ({
      posts: [],
      homework: [],
      comments: [],
      isLoading: false,
      error: null,

      setPosts: (posts) => set({ posts }),

      likePost: (postId) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId && !p.likedByUser
              ? { ...p, likes: p.likes + 1, likedByUser: true }
              : p
          ),
        })),

      unlikePost: (postId) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId && p.likedByUser
              ? { ...p, likes: p.likes - 1, likedByUser: false }
              : p
          ),
        })),

      addComment: (postId, content, author) => {
        const newComment: Comment = {
          id: `comment_${Date.now()}`,
          postId,
          author,
          content,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          comments: [...state.comments, newComment],
          posts: state.posts.map((p) =>
            p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p
          ),
        }));
      },

      setHomework: (homework) => set({ homework }),

      submitHomework: (homeworkId, submission) =>
        set((state) => ({
          homework: state.homework.map((h) =>
            h.id === homeworkId
              ? {
                  ...h,
                  isCompleted: true,
                  submission: {
                    ...submission,
                    submittedAt: new Date().toISOString(),
                  },
                }
              : h
          ),
        })),

      createPost: (postData) => {
        const newPost: Post = {
          ...postData,
          id: `post_${Date.now()}`,
          likes: 0,
          likedByUser: false,
          commentCount: 0,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          posts: [newPost, ...state.posts],
        }));
      },

      reset: () =>
        set({
          posts: [],
          homework: [],
          comments: [],
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: "@app/feed",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        posts: state.posts,
        homework: state.homework,
        comments: state.comments,
      }),
    }
  )
);

