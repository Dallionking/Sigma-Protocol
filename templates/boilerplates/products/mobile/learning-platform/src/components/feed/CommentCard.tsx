import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { MotiView } from "moti";
import { formatDistanceToNow } from "date-fns";

import { TutorAvatar } from "@/components/TutorAvatar";
import { Comment } from "@/stores/feedStore";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { colors } from "@/theme/tokens";

interface Props {
  comment: Comment;
  isReply?: boolean;
  delay?: number;
}

export function CommentCard({ comment, isReply = false, delay = 0 }: Props) {
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });

  return (
    <MotiView
      from={motionFrom.fadeUp}
      animate={{ opacity: 1, translateY: 0 }}
      transition={getTransition({ delay })}
      style={[styles.container, isReply && styles.replyContainer]}
    >
      <View style={styles.avatarContainer}>
        {comment.author.avatar === "tutor" ? (
          <TutorAvatar size={isReply ? 28 : 36} />
        ) : (
          <Image
            source={{ uri: comment.author.avatar }}
            style={[styles.avatar, isReply && styles.replyAvatar]}
          />
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.authorName}>{comment.author.name}</Text>
          {comment.author.isAdmin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminText}>Tutor</Text>
            </View>
          )}
          <Text style={styles.timeText}>{timeAgo}</Text>
        </View>
        <Text style={styles.commentText}>{comment.content}</Text>
        
        {/* Render replies if present */}
        {comment.replies && comment.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {comment.replies.map((reply, index) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                isReply
                delay={delay + (index + 1) * 30}
              />
            ))}
          </View>
        )}
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.04)",
  },
  replyContainer: {
    marginLeft: 8,
    paddingVertical: 8,
    borderLeftWidth: 2,
    borderLeftColor: "rgba(255, 255, 255, 0.08)",
    paddingLeft: 12,
    borderBottomWidth: 0,
  },
  avatarContainer: {},
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  authorName: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.primary,
  },
  adminBadge: {
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 9,
    color: colors.secondary[400],
    textTransform: "uppercase",
  },
  timeText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    marginLeft: "auto",
  },
  commentText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  repliesContainer: {
    marginTop: 8,
  },
});

