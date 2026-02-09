import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { X, AlertTriangle } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassPanel } from "@/components/GlassPanel";
import { DangerButton } from "@/components/profile";
import { SecondaryButton } from "@/components/SecondaryButton";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { profileApi, useProfileStore } from "@/stores/profileStore";
import { colors } from "@/theme/tokens";

export default function DeleteAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { reset } = useProfileStore();

  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = password.length >= 6 && confirmText.toLowerCase() === "delete";

  const handleClose = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleDelete = useCallback(async () => {
    if (!canDelete) return;

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setIsDeleting(true);

    try {
      const result = await profileApi.deleteAccount(password);
      if (result.success) {
        // Clear all data
        reset();
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.hasSession,
          STORAGE_KEYS.onboardingComplete,
        ]);
        
        // Navigate to sign in
        router.replace("/signin-credentials");
      }
    } catch (e) {
      setIsDeleting(false);
    }
  }, [canDelete, password, reset, router]);

  return (
    <View style={styles.container}>
      <Pressable style={styles.backdrop} onPress={handleClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <MotiView
          from={{ opacity: 0, translateY: 100 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
          style={[styles.modal, { paddingBottom: insets.bottom + 20 }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <Text style={styles.headerTitle}>Delete Account</Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <X size={20} color={colors.text.muted} />
            </Pressable>
          </View>

          {/* Warning */}
          <GlassPanel style={styles.warningCard}>
            <AlertTriangle size={32} color={colors.error} />
            <Text style={styles.warningTitle}>This action is permanent</Text>
            <Text style={styles.warningText}>
              Deleting your account will permanently remove all your data, including:
            </Text>
            <View style={styles.warningList}>
              <Text style={styles.warningItem}>• All lesson progress and XP</Text>
              <Text style={styles.warningItem}>• Achievements and badges</Text>
              <Text style={styles.warningItem}>• Scheduled sessions</Text>
              <Text style={styles.warningItem}>• Account settings</Text>
            </View>
          </GlassPanel>

          {/* Confirmation Form */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Enter your password</Text>
            <TextInput
              style={styles.textInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={colors.text.muted}
              secureTextEntry
            />

            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
              Type "DELETE" to confirm
            </Text>
            <TextInput
              style={styles.textInput}
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder="DELETE"
              placeholderTextColor={colors.text.muted}
              autoCapitalize="characters"
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <SecondaryButton label="Cancel" onPress={handleClose} />
            <View style={styles.actionSpacer} />
            <DangerButton
              label={isDeleting ? "Deleting..." : "Delete Account"}
              onPress={handleDelete}
              loading={isDeleting}
              disabled={!canDelete}
            />
          </View>
        </MotiView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
  },
  keyboardView: {
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: colors.surface.base,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerSpacer: {
    width: 32,
  },
  headerTitle: {
    flex: 1,
    fontFamily: "Satoshi-Bold",
    fontSize: 18,
    color: colors.text.primary,
    textAlign: "center",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  warningCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    marginBottom: 24,
  },
  warningTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 18,
    color: colors.error,
    marginTop: 12,
    marginBottom: 8,
  },
  warningText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 12,
  },
  warningList: {
    alignSelf: "stretch",
    paddingLeft: 20,
  },
  warningItem: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
    marginBottom: 4,
  },
  formSection: {
    marginBottom: 24,
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
  actions: {
    gap: 12,
  },
  actionSpacer: {
    height: 4,
  },
});

