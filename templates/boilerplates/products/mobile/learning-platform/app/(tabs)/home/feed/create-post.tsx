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
} from "react-native";
import { useRouter } from "expo-router";
import { X, FileText, BookOpen, Megaphone, Image, Send } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TutorAvatar } from "@/components/TutorAvatar";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useFeedStore, PostType } from "@/stores/feedStore";
import { TUTOR_AUTHOR } from "@/lib/feed/mockData";
import { colors } from "@/theme/tokens";

const POST_TYPES: { id: PostType; label: string; icon: typeof FileText; color: string }[] = [
  { id: "text", label: "Text", icon: FileText, color: colors.text.muted },
  { id: "lesson", label: "Lesson", icon: BookOpen, color: colors.primary[400] },
  { id: "announcement", label: "Announcement", icon: Megaphone, color: colors.accent[400] },
];

export default function CreatePostScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { createPost } = useFeedStore();

  const [postType, setPostType] = useState<PostType>("text");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleClose = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleTypeSelect = useCallback((type: PostType) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPostType(type);
  }, []);

  const handlePinnedToggle = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPinned(!isPinned);
  }, [isPinned]);

  const handlePublish = useCallback(async () => {
    if (!content.trim()) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsPublishing(true);

    // Simulate publishing
    await new Promise((r) => setTimeout(r, 1000));

    createPost({
      author: TUTOR_AUTHOR,
      content: content.trim(),
      type: postType,
      isPinned,
    });

    setIsPublishing(false);
    router.back();
  }, [content, postType, isPinned, createPost, router]);

  const selectedTypeConfig = POST_TYPES.find((t) => t.id === postType);

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <X size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Create Post</Text>
        <View style={styles.closeButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Author Preview */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
          style={styles.authorSection}
        >
          <View style={styles.authorRow}>
            <TutorAvatar size={48} />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>AI Tutor</Text>
              <Text style={styles.postingAs}>Posting as tutor</Text>
            </View>
          </View>
        </MotiView>

        {/* Post Type Selector */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 100 })}
          style={styles.typeSection}
        >
          <Text style={styles.sectionLabel}>Post Type</Text>
          <View style={styles.typeGrid}>
            {POST_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = postType === type.id;
              return (
                <Pressable
                  key={type.id}
                  onPress={() => handleTypeSelect(type.id)}
                  style={[styles.typeChip, isSelected && styles.typeChipSelected]}
                >
                  <Icon
                    size={18}
                    color={isSelected ? type.color : colors.text.muted}
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      isSelected && { color: type.color },
                    ]}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </MotiView>

        {/* Content Input */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 200 })}
          style={styles.contentSection}
        >
          <Text style={styles.sectionLabel}>Content</Text>
          <GlassPanel style={styles.contentCard}>
            <TextInput
              style={styles.textInput}
              placeholder={
                postType === "lesson"
                  ? "Write your mini lesson..."
                  : postType === "announcement"
                    ? "Share an important announcement..."
                    : "What's on your mind?"
              }
              placeholderTextColor={colors.text.muted}
              multiline
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
              maxLength={2000}
            />
            <View style={styles.contentFooter}>
              <Text style={styles.charCount}>{content.length}/2000</Text>
            </View>
          </GlassPanel>
        </MotiView>

        {/* Options */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ delay: 300 })}
          style={styles.optionsSection}
        >
          <Pressable
            onPress={handlePinnedToggle}
            style={[styles.optionRow, isPinned && styles.optionRowActive]}
          >
            <View style={styles.optionInfo}>
              <Text style={styles.optionLabel}>Pin to top</Text>
              <Text style={styles.optionHint}>
                Pinned posts appear at the top of the feed
              </Text>
            </View>
            <View style={[styles.toggle, isPinned && styles.toggleActive]}>
              {isPinned && <View style={styles.toggleDot} />}
            </View>
          </Pressable>

          {/* Media Attachment Stub */}
          <Pressable style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <View style={styles.optionLabelRow}>
                <Image size={18} color={colors.text.muted} />
                <Text style={styles.optionLabel}>Add Media</Text>
              </View>
              <Text style={styles.optionHint}>
                Images and videos coming soon
              </Text>
            </View>
          </Pressable>
        </MotiView>

        {/* Publish Button */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 400 })}
          style={styles.publishSection}
        >
          <PrimaryButton
            label={isPublishing ? "Publishing..." : "Publish Post"}
            onPress={handlePublish}
            loading={isPublishing}
            disabled={!content.trim()}
          />
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
  closeButton: {
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  authorSection: {
    marginBottom: 24,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  authorInfo: {
    gap: 2,
  },
  authorName: {
    fontFamily: "Satoshi-Bold",
    fontSize: 18,
    color: colors.text.primary,
  },
  postingAs: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
  },
  sectionLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 12,
  },
  typeSection: {
    marginBottom: 24,
  },
  typeGrid: {
    flexDirection: "row",
    gap: 10,
  },
  typeChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  typeChipSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  typeLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 13,
    color: colors.text.muted,
  },
  contentSection: {
    marginBottom: 24,
  },
  contentCard: {
    padding: 16,
    borderRadius: 16,
  },
  textInput: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.primary,
    minHeight: 160,
    lineHeight: 24,
  },
  contentFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  charCount: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
  },
  optionsSection: {
    marginBottom: 24,
    gap: 12,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  optionRowActive: {
    backgroundColor: "rgba(6, 182, 212, 0.08)",
    borderColor: "rgba(6, 182, 212, 0.2)",
  },
  optionInfo: {
    flex: 1,
    gap: 4,
  },
  optionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.primary,
  },
  optionHint: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  toggleActive: {
    backgroundColor: colors.secondary[500],
    alignItems: "flex-end",
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  publishSection: {
    marginTop: 8,
  },
});

