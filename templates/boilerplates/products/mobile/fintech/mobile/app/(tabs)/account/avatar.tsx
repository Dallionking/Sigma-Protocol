import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

// Mock user data
const USER_DATA = {
  avatarInitial: 'T',
  hasAvatar: false,
};

export default function ProfileAvatarScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleChoosePhoto = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Integrate expo-image-picker
    // This is a placeholder for future implementation
    console.log('Choose photo - expo-image-picker integration pending');
  };

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('Remove avatar');
  };

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    setIsLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <Screen safeArea style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
          <NeonText variant="h2" color="white">Update Avatar</NeonText>
        </MotiView>

        {/* Avatar Preview */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.avatarSection}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <NeonText variant="display" color="primary" style={styles.avatarText}>
                {USER_DATA.avatarInitial}
              </NeonText>
            </View>
            <View style={styles.avatarGlow} />
          </View>
          <NeonText variant="caption" color="muted" style={styles.avatarHint}>
            Tap below to change your avatar
          </NeonText>
        </MotiView>

        {/* Action Buttons */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 150, duration: 400 }}
        >
          <Card variant="default" padding="lg" style={styles.actionsCard}>
            <NeonButton
              onPress={handleChoosePhoto}
              style={styles.actionButton}
            >
              Choose Photo
            </NeonButton>

            <NeonButton
              variant="ghost"
              onPress={handleRemove}
              style={styles.actionButton}
            >
              Remove
            </NeonButton>
          </Card>
        </MotiView>

        {/* Save Button */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.saveSection}
        >
          <NeonButton
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </NeonButton>
        </MotiView>

        {/* Note about future feature */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 300, duration: 400 }}
          style={styles.noteSection}
        >
          <NeonText variant="caption" color="muted" style={styles.noteText}>
            Photo picker coming soon. Your avatar will be synced across all devices.
          </NeonText>
        </MotiView>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
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
  avatarSection: {
    alignItems: 'center',
    marginTop: spacing[8],
    marginBottom: spacing[8],
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing[4],
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.primary[900],
    borderWidth: 3,
    borderColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  avatarText: {
    fontSize: 64,
  },
  avatarGlow: {
    position: 'absolute',
    top: -15,
    left: -15,
    right: -15,
    bottom: -15,
    borderRadius: 95,
    backgroundColor: colors.glow,
    opacity: 0.4,
    zIndex: 0,
  },
  avatarHint: {
    textAlign: 'center',
  },
  actionsCard: {
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  actionButton: {
    marginBottom: spacing[2],
  },
  saveSection: {
    marginTop: spacing[2],
  },
  noteSection: {
    marginTop: spacing[6],
    alignItems: 'center',
  },
  noteText: {
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
});

