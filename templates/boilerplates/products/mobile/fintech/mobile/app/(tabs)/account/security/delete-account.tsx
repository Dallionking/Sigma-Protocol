import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, NeonInput, Card, NeonLoader } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';
import { useDeleteAccount } from '@/lib/hooks/use-auth';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState('');
  const { mutate: deleteAccount, isPending } = useDeleteAccount();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    deleteAccount(undefined, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Navigate to auth screen after deletion
        setTimeout(() => {
          router.replace('/(auth)/signin');
        }, 500);
      },
      onError: (error: any) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        console.error('Account deletion error:', error);
      },
    });
  };

  const isConfirmValid = confirmText === 'DELETE';

  return (
    <Screen safeArea style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300 }}
            style={styles.header}
          >
            <Pressable onPress={handleBack} style={styles.backButton}>
              <NeonText variant="body" color="muted">‹ Back</NeonText>
            </Pressable>
            <NeonText variant="h2" color="white">Delete Account</NeonText>
          </MotiView>

          {/* Warning Icon */}
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 100 }}
            style={styles.iconSection}
          >
            <View style={styles.iconContainer}>
              <NeonText variant="display" style={styles.iconEmoji}>⚠️</NeonText>
              <View style={styles.iconGlow} />
            </View>
          </MotiView>

          {/* Warning Card */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 150, duration: 400 }}
          >
            <Card variant="default" padding="lg" style={styles.warningCard}>
              <NeonText variant="h4" color="danger" style={styles.warningTitle}>
                This action is permanent
              </NeonText>
              <NeonText variant="body" color="muted" style={styles.warningText}>
                Deleting your account will:
              </NeonText>
              
              <View style={styles.impactList}>
                <View style={styles.impactItem}>
                  <NeonText variant="body" color="danger">✕</NeonText>
                  <NeonText variant="body" color="muted">Remove all your data</NeonText>
                </View>
                <View style={styles.impactItem}>
                  <NeonText variant="body" color="danger">✕</NeonText>
                  <NeonText variant="body" color="muted">Cancel your subscription</NeonText>
                </View>
                <View style={styles.impactItem}>
                  <NeonText variant="body" color="danger">✕</NeonText>
                  <NeonText variant="body" color="muted">Disconnect all brokers</NeonText>
                </View>
              </View>
            </Card>
          </MotiView>

          {/* Confirmation Input */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 200, duration: 400 }}
          >
            <Card variant="default" padding="lg" style={styles.confirmCard}>
              <NeonText variant="body" color="muted" style={styles.confirmLabel}>
                Type <NeonText variant="body" color="white">DELETE</NeonText> to confirm
              </NeonText>
              <NeonInput
                placeholder="DELETE"
                autoCapitalize="characters"
                autoCorrect={false}
                value={confirmText}
                onChangeText={setConfirmText}
              />
            </Card>
          </MotiView>

          {/* Delete Button */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 250, duration: 400 }}
            style={styles.buttonSection}
          >
            {isDeleting ? (
              <View style={styles.loadingContainer}>
                <NeonLoader size="medium" />
                <NeonText variant="body" color="muted">Deleting account...</NeonText>
              </View>
            ) : (
              <NeonButton 
                variant="danger" 
                onPress={handleDelete}
                disabled={!isConfirmValid}
              >
                Delete Account
              </NeonButton>
            )}
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: layout.tabBarHeight + spacing[4],
  },
  header: {
    paddingVertical: spacing[2],
    gap: spacing[2],
  },
  backButton: {
    paddingVertical: spacing[2],
    alignSelf: 'flex-start',
  },
  iconSection: {
    alignItems: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[4],
  },
  iconContainer: {
    position: 'relative',
  },
  iconEmoji: {
    fontSize: 64,
    zIndex: 1,
  },
  iconGlow: {
    position: 'absolute',
    top: -15,
    left: -15,
    right: -15,
    bottom: -15,
    borderRadius: 50,
    backgroundColor: colors.accent.muted,
    opacity: 0.5,
    zIndex: 0,
  },
  warningCard: {
    marginBottom: spacing[4],
  },
  warningTitle: {
    marginBottom: spacing[2],
  },
  warningText: {
    marginBottom: spacing[3],
  },
  impactList: {
    gap: spacing[2],
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  confirmCard: {
    marginBottom: spacing[4],
  },
  confirmLabel: {
    marginBottom: spacing[3],
  },
  buttonSection: {
    marginTop: spacing[2],
  },
  loadingContainer: {
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[4],
  },
});

