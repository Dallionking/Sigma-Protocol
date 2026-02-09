import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Send } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { CommentCard } from "@/components/feed";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useFeedStore } from "@/stores/feedStore";
import { getCommentsForPost, COMMUNITY_AUTHORS } from "@/lib/feed/mockData";
import { colors } from "@/theme/tokens";

export default function CommentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ postId?: string }>();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { posts, comments, addComment } = useFeedStore();
  const post = posts.find((p) => p.id === params.postId);

  // Combine mock comments + store comments
  const mockComments = params.postId ? getCommentsForPost(params.postId) : [];
  const storeComments = comments.filter((c) => c.postId === params.postId);
  const allComments = [...mockComments, ...storeComments];

  const [newComment, setNewComment] = useState("");

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleSubmitComment = useCallback(() => {
    if (!newComment.trim() || !params.postId) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Use a random community author for demo purposes
    const author = COMMUNITY_AUTHORS[Math.floor(Math.random() * COMMUNITY_AUTHORS.length)];
    addComment(params.postId, newComment.trim(), author);
    setNewComment("");
  }, [newComment, params.postId, addComment]);

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Comments</Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Post Preview */}
          {post && (
            <MotiView
              from={motionFrom.fadeUp}
              animate={{ opacity: 1, translateY: 0 }}
              transition={getTransition()}
              style={styles.postPreview}
            >
              <GlassPanel style={styles.postPreviewCard}>
                <Text style={styles.postAuthor}>{post.author.name}</Text>
                <Text style={styles.postContent} numberOfLines={3}>
                  {post.content}
                </Text>
              </GlassPanel>
            </MotiView>
          )}

          {/* Comments List */}
          <MotiView
            from={motionFrom.fadeUp}
            animate={{ opacity: 1, translateY: 0 }}
            transition={getTransition({ delay: 100 })}
          >
            {allComments.length === 0 ? (
              <GlassPanel style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No comments yet</Text>
                <Text style={styles.emptyText}>
                  Be the first to share your thoughts!
                </Text>
              </GlassPanel>
            ) : (
              <GlassPanel style={styles.commentsCard}>
                {allComments.map((comment, index) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    delay={150 + index * 30}
                  />
                ))}
              </GlassPanel>
            )}
          </MotiView>
        </ScrollView>

        {/* Comment Input */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 200 })}
          style={[styles.inputContainer, { paddingBottom: insets.bottom + 12 }]}
        >
          <GlassPanel style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Write a comment..."
              placeholderTextColor={colors.text.muted}
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={500}
            />
            <Pressable
              onPress={handleSubmitComment}
              disabled={!newComment.trim()}
              style={[
                styles.sendButton,
                !newComment.trim() && styles.sendButtonDisabled,
              ]}
            >
              <Send
                size={20}
                color={newComment.trim() ? colors.secondary[400] : colors.text.muted}
              />
            </Pressable>
          </GlassPanel>
        </MotiView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  postPreview: {
    marginBottom: 20,
  },
  postPreviewCard: {
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary[400],
  },
  postAuthor: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 4,
  },
  postContent: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
    lineHeight: 20,
  },
  commentsCard: {
    padding: 16,
    borderRadius: 20,
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
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    borderRadius: 20,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.primary,
    maxHeight: 100,
    lineHeight: 20,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
});

