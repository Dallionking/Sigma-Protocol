import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Camera, Check } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { NeonMonogram } from "@/components/NeonMonogram";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useProfileStore } from "@/stores/profileStore";
import { MOCK_USER_PROFILE, LANGUAGES } from "@/lib/profile/mockData";
import { colors } from "@/theme/tokens";

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { profile, updateProfile } = useProfileStore();
  const displayProfile = profile ?? MOCK_USER_PROFILE;

  const [name, setName] = useState(displayProfile.name);
  const [nativeLanguage, setNativeLanguage] = useState(displayProfile.nativeLanguage);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const hasChanges = name !== displayProfile.name || nativeLanguage !== displayProfile.nativeLanguage;

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleAvatarPress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Would open image picker
  }, []);

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsSaving(true);

    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));

    updateProfile({ name, nativeLanguage });
    setIsSaving(false);
    setSaved(true);

    setTimeout(() => {
      router.back();
    }, 800);
  }, [hasChanges, name, nativeLanguage, updateProfile, router]);

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <MotiView
            from={motionFrom.fadeUp}
            animate={{ opacity: 1, translateY: 0 }}
            transition={getTransition()}
            style={styles.avatarSection}
          >
            <Pressable onPress={handleAvatarPress} style={styles.avatarContainer}>
              <NeonMonogram size={100} />
              <View style={styles.cameraOverlay}>
                <Camera size={22} color="#FFFFFF" />
              </View>
            </Pressable>
            <Text style={styles.avatarHint}>Tap to change photo</Text>
          </MotiView>

          {/* Form Fields */}
          <MotiView
            from={motionFrom.fadeUp}
            animate={{ opacity: 1, translateY: 0 }}
            transition={getTransition({ delay: 100 })}
            style={styles.formSection}
          >
            <GlassPanel style={styles.formCard}>
              {/* Name Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Display Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor={colors.text.muted}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.divider} />

              {/* Email Field (read-only) */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Email</Text>
                <Text style={styles.readOnlyValue}>{displayProfile.email}</Text>
                <Text style={styles.fieldHint}>
                  Change your email in Settings &gt; Account
                </Text>
              </View>

              <View style={styles.divider} />

              {/* Native Language */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Native Language</Text>
                <View style={styles.languageOptions}>
                  {LANGUAGES.slice(0, 3).map((lang) => {
                    const isSelected = nativeLanguage === lang.name;
                    return (
                      <Pressable
                        key={lang.code}
                        onPress={() => {
                          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setNativeLanguage(lang.name);
                        }}
                        style={[
                          styles.languageChip,
                          isSelected && styles.languageChipSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.languageLabel,
                            isSelected && styles.languageLabelSelected,
                          ]}
                        >
                          {lang.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </GlassPanel>
          </MotiView>

          {/* Save Button */}
          <MotiView
            from={motionFrom.fadeUp}
            animate={{ opacity: 1, translateY: 0 }}
            transition={getTransition({ delay: 200 })}
            style={styles.saveSection}
          >
            {saved ? (
              <View style={styles.savedIndicator}>
                <Check size={24} color={colors.success} />
                <Text style={styles.savedText}>Saved!</Text>
              </View>
            ) : (
              <PrimaryButton
                label={isSaving ? "Saving..." : "Save Changes"}
                onPress={handleSave}
                loading={isSaving}
                disabled={!hasChanges}
              />
            )}
          </MotiView>
        </ScrollView>
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
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary[500],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.surface.base,
  },
  avatarHint: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
  },
  formSection: {
    marginBottom: 32,
  },
  formCard: {
    padding: 20,
    borderRadius: 20,
  },
  fieldContainer: {
    paddingVertical: 12,
  },
  fieldLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  textInput: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  readOnlyValue: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.secondary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 12,
  },
  fieldHint: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginVertical: 8,
  },
  languageOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  languageChip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  languageChipSelected: {
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    borderColor: colors.secondary[500],
  },
  languageLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
  },
  languageLabelSelected: {
    fontFamily: "PlusJakartaSans-SemiBold",
    color: colors.secondary[400],
  },
  saveSection: {
    marginTop: 8,
  },
  savedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  savedText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 16,
    color: colors.success,
  },
});

