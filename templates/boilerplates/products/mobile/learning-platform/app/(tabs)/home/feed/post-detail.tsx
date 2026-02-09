import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, Image, Share } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Share2,
  MessageCircle,
  BookOpen,
  Megaphone,
  FileText,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatDistanceToNow } from "date-fns";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { TutorAvatar } from "@/components/TutorAvatar";
import { LikeButton, PinnedBadge, CommentCard } from "@/components/feed";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useFeedStore } from "@/stores/feedStore";
import { getCommentsForPost } from "@/lib/feed/mockData";
import { colors } from "@/theme/tokens";

const TYPE_ICONS = {
  text: FileText,
  video: FileText,
  lesson: BookOpen,
  announcement: Megaphone,
};

const TYPE_LABELS = {
  text: "Post",
  video: "Video",
  lesson: "Mini Lesson",
  announcement: "Announcement",
};

export default function PostDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { posts, likePost, unlikePost, comments } = useFeedStore();
  const post = posts.find((p) => p.id === params.id);
  
  // Get comments for this post (from mock + store)
  const mockComments = params.id ? getCommentsForPost(params.id) : [];
  const storeComments = comments.filter((c) => c.postId === params.id);
  const allComments = [...mockComments, ...storeComments];
  const previewComments = allComments.slice(0, 3);

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleLikeToggle = useCallback(() => {
    if (!post) return;
    if (post.likedByUser) {
      unlikePost(post.id);
    } else {
      likePost(post.id);
    }
  }, [post, likePost, unlikePost]);

  const handleShare = useCallback(async () => {
    if (!post) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `${post.author.name}: ${post.content.substring(0, 100)}...`,
      });
    } catch (e) {
      // Sharing failed silently
    }
  }, [post]);

  const handleViewAllComments = useCallback(() => {
    if (!post) return;
    router.push(`/home/feed/comments?postId=${post.id}`);
  }, [router, post]);

  if (!post) {
    return (
      <GradientBackground>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text.primary} />
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Post not found</Text>
        </View>
      </GradientBackground>
    );
  }

  const TypeIcon = TYPE_ICONS[post.type];
  const typeLabel = TYPE_LABELS[post.type];
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{typeLabel}</Text>
        <Pressable onPress={handleShare} style={styles.shareButton}>
          <Share2 size={20} color={colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Author Section */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
          style={styles.authorSection}
        >
          <View style={styles.authorRow}>
            {post.author.avatar === "tutor" ? (
              <TutorAvatar size={56} />
            ) : (
              <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
            )}
            <View style={styles.authorInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.authorName}>{post.author.name}</Text>
                {post.author.isAdmin && (
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminText}>Tutor</Text>
                  </View>
                )}
              </View>
              <View style={styles.metaRow}>
                <TypeIcon size={14} color={colors.secondary[400]} />
                <Text style={styles.timeText}>{timeAgo}</Text>
              </View>
            </View>
            {post.isPinned && <PinnedBadge />}
          </View>
        </MotiView>

        {/* Content */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 100 })}
          style={styles.contentSection}
        >
          <GlassPanel style={styles.contentCard}>
            <Text style={styles.contentText}>{post.content}</Text>
          </GlassPanel>
        </MotiView>

        {/* Actions */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 200 })}
          style={styles.actionsSection}
        >
          <LikeButton
            count={post.likes}
            isLiked={post.likedByUser}
            onToggle={handleLikeToggle}
          />
          <Pressable onPress={handleViewAllComments} style={styles.commentButton}>
            <MessageCircle size={20} color={colors.text.muted} />
            <Text style={styles.commentCount}>{post.commentCount}</Text>
          </Pressable>
        </MotiView>

        {/* Comments Preview */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 300 })}
          style={styles.commentsSection}
        >
          <View style={styles.commentsSectionHeader}>
            <Text style={styles.commentsTitle}>Comments</Text>
            {allComments.length > 3 && (
              <Pressable onPress={handleViewAllComments}>
                <Text style={styles.viewAllText}>View all {allComments.length}</Text>
              </Pressable>
            )}
          </View>

          {previewComments.length === 0 ? (
            <GlassPanel style={styles.noCommentsCard}>
              <Text style={styles.noCommentsText}>
                No comments yet. Be the first to share your thoughts!
              </Text>
            </GlassPanel>
          ) : (
            <GlassPanel style={styles.commentsCard}>
              {previewComments.map((comment, index) => (
                <CommentCard key={comment.id} comment={comment} delay={350 + index * 30} />
              ))}
            </GlassPanel>
          )}
        </MotiView>
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
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
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
  authorSection: {
    marginBottom: 20,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  authorInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  authorName: {
    fontFamily: "Satoshi-Bold",
    fontSize: 18,
    color: colors.text.primary,
  },
  adminBadge: {
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  adminText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 10,
    color: colors.secondary[400],
    textTransform: "uppercase",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
  },
  contentSection: {
    marginBottom: 20,
  },
  contentCard: {
    padding: 20,
    borderRadius: 20,
  },
  contentText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 26,
  },
  actionsSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  commentButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  commentCount: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.muted,
  },
  commentsSection: {},
  commentsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  commentsTitle: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.text.primary,
  },
  viewAllText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.secondary[400],
  },
  commentsCard: {
    padding: 16,
    borderRadius: 20,
  },
  noCommentsCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
  },
  noCommentsText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  errorText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.muted,
  },
});

