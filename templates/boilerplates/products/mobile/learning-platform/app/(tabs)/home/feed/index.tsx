import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Plus, BookOpen } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { PostCard, HomeworkCard } from "@/components/feed";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useFeedStore, Post, Homework } from "@/stores/feedStore";
import {
  MOCK_POSTS,
  MOCK_HOMEWORK,
  MOCK_COMMENTS,
  getPinnedPosts,
  getRegularPosts,
  getPendingHomework,
} from "@/lib/feed/mockData";
import { colors } from "@/theme/tokens";

export default function FeedHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { posts, setPosts, homework, setHomework, likePost, unlikePost } = useFeedStore();
  const [refreshing, setRefreshing] = useState(false);

  // Initialize with mock data
  useEffect(() => {
    if (posts.length === 0) {
      setPosts(MOCK_POSTS);
      setHomework(MOCK_HOMEWORK);
    }
  }, [posts.length, setPosts, setHomework]);

  const pinnedPosts = posts.filter((p) => p.isPinned);
  const regularPosts = posts.filter((p) => !p.isPinned);
  const pendingHomework = homework.filter((h) => !h.isCompleted);

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  }, []);

  const handlePostPress = useCallback(
    (post: Post) => {
      router.push(`/home/feed/post-detail?id=${post.id}`);
    },
    [router]
  );

  const handleLikeToggle = useCallback(
    (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (post?.likedByUser) {
        unlikePost(postId);
      } else {
        likePost(postId);
      }
    },
    [posts, likePost, unlikePost]
  );

  const handleCommentsPress = useCallback(
    (postId: string) => {
      router.push(`/home/feed/comments?postId=${postId}`);
    },
    [router]
  );

  const handleHomeworkPress = useCallback(
    (hw: Homework) => {
      if (hw.isCompleted) {
        // View details
        router.push(`/home/feed/homework-submit?id=${hw.id}`);
      } else {
        router.push(`/home/feed/homework-submit?id=${hw.id}`);
      }
    },
    [router]
  );

  const handleSeeAllHomework = useCallback(() => {
    router.push("/home/feed/homework");
  }, [router]);

  const handleCreatePost = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/home/feed/create-post");
  }, [router]);

  return (
    <GradientBackground>
      <DevHubButton />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Feed</Text>
        <Pressable onPress={handleCreatePost} style={styles.createButton}>
          <Plus size={22} color={colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.secondary[400]}
          />
        }
      >
        {/* Pinned Posts */}
        {pinnedPosts.length > 0 && (
          <MotiView
            from={motionFrom.fadeUp}
            animate={{ opacity: 1, translateY: 0 }}
            transition={getTransition()}
          >
            <Text style={styles.sectionLabel}>Pinned</Text>
            {pinnedPosts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                onPress={handlePostPress}
                onLikeToggle={handleLikeToggle}
                onCommentsPress={handleCommentsPress}
                delay={index * 50}
              />
            ))}
          </MotiView>
        )}

        {/* Homework Section */}
        {pendingHomework.length > 0 && (
          <MotiView
            from={motionFrom.fadeUp}
            animate={{ opacity: 1, translateY: 0 }}
            transition={getTransition({ delay: 100 })}
            style={styles.homeworkSection}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <BookOpen size={18} color={colors.accent[400]} />
                <Text style={styles.sectionTitle}>Homework</Text>
              </View>
              <Pressable onPress={handleSeeAllHomework}>
                <Text style={styles.seeAllText}>See all</Text>
              </Pressable>
            </View>
            {pendingHomework.slice(0, 2).map((hw, index) => (
              <HomeworkCard
                key={hw.id}
                homework={hw}
                onPress={handleHomeworkPress}
                delay={150 + index * 50}
              />
            ))}
          </MotiView>
        )}

        {/* Regular Posts */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 200 })}
        >
          <Text style={styles.sectionLabel}>Recent</Text>
          {regularPosts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              onPress={handlePostPress}
              onLikeToggle={handleLikeToggle}
              onCommentsPress={handleCommentsPress}
              delay={250 + index * 50}
            />
          ))}
        </MotiView>

        {/* Empty State */}
        {posts.length === 0 && (
          <MotiView
            from={motionFrom.fade}
            animate={{ opacity: 1 }}
            transition={getTransition()}
            style={styles.emptyState}
          >
            <GlassPanel style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>AI Tutor is preparing new posts</Text>
              <Text style={styles.emptyText}>
                Check back soon for lessons, tips, and community updates!
              </Text>
            </GlassPanel>
          </MotiView>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 18,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
  homeworkSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.primary,
  },
  seeAllText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.secondary[400],
  },
  emptyState: {
    marginTop: 40,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 24,
    alignItems: "center",
  },
  emptyTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
    textAlign: "center",
    lineHeight: 20,
  },
});

