import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import { MessageCircle, BookOpen, Megaphone, FileText } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { formatDistanceToNow } from "date-fns";

import { GlassPanel } from "@/components/GlassPanel";
import { TutorAvatar } from "@/components/TutorAvatar";
import { LikeButton } from "./LikeButton";
import { PinnedBadge } from "./PinnedBadge";
import { Post } from "@/stores/feedStore";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors, durations } from "@/theme/tokens";

interface Props {
  post: Post;
  onPress: (post: Post) => void;
  onLikeToggle: (postId: string) => void;
  onCommentsPress: (postId: string) => void;
  delay?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TYPE_ICONS = {
  text: FileText,
  video: FileText,
  lesson: BookOpen,
  announcement: Megaphone,
};

const TYPE_COLORS = {
  text: colors.text.muted,
  video: colors.secondary[400],
  lesson: colors.primary[400],
  announcement: colors.accent[400],
};

export function PostCard({ post, onPress, onLikeToggle, onCommentsPress, delay = 0 }: Props) {
  const scale = useSharedValue(1);
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.98, { duration: durations.fast });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: durations.fast });
  }, [scale]);

  const handlePress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(post);
  }, [onPress, post]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const TypeIcon = TYPE_ICONS[post.type];
  const typeColor = TYPE_COLORS[post.type];
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  return (
    <MotiView
      from={motionFrom.fadeUp}
      animate={{ opacity: 1, translateY: 0 }}
      transition={getTransition({ delay })}
    >
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[styles.container, animatedStyle]}
      >
        <GlassPanel style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.authorRow}>
              {post.author.avatar === "tutor" ? (
                <TutorAvatar size={40} />
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
                  <TypeIcon size={12} color={typeColor} />
                  <Text style={styles.timeText}>{timeAgo}</Text>
                </View>
              </View>
            </View>
            {post.isPinned && <PinnedBadge />}
          </View>

          {/* Content */}
          <Text style={styles.content} numberOfLines={6}>
            {post.content}
          </Text>

          {/* Actions */}
          <View style={styles.actions}>
            <LikeButton
              count={post.likes}
              isLiked={post.likedByUser}
              onToggle={() => onLikeToggle(post.id)}
            />
            <Pressable
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onCommentsPress(post.id);
              }}
              style={styles.commentButton}
            >
              <MessageCircle size={20} color={colors.text.muted} />
              <Text style={styles.commentCount}>{post.commentCount}</Text>
            </Pressable>
          </View>
        </GlassPanel>
      </AnimatedPressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  authorInfo: {
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  authorName: {
    fontFamily: "Satoshi-Bold",
    fontSize: 15,
    color: colors.text.primary,
  },
  adminBadge: {
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
    fontSize: 12,
    color: colors.text.muted,
  },
  content: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
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
});

