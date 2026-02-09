import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

export default function LogoutConfirmScreen() {
  const router = useRouter();

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      const { logout } = await import('@/lib/stores/auth-store');
      const authStore = await import('@/lib/stores/auth-store');
      await authStore.useAuthStore.getState().logout();
      router.replace('/(auth)/signin');
    } catch (error) {
      console.error('Logout error:', error);
      router.replace('/(auth)/signin');
    }
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
          <Pressable onPress={handleCancel} style={styles.backButton}>
            <NeonText variant="body" color="muted">‹ Back</NeonText>
          </Pressable>
          <NeonText variant="h2" color="white">Log Out?</NeonText>
        </MotiView>

        {/* Icon with Glow */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.iconSection}
        >
          <View style={styles.iconContainer}>
            <MotiView
              from={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ 
                type: 'timing', 
                duration: 2000, 
                loop: true,
              }}
            >
              <NeonText variant="display" style={styles.iconEmoji}>👋</NeonText>
            </MotiView>
            <MotiView
              from={{ opacity: 0.3, scale: 0.9 }}
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.2, 0.9] }}
              transition={{ 
                type: 'timing', 
                duration: 2000, 
                loop: true,
              }}
              style={styles.iconGlow}
            />
          </View>
        </MotiView>

        {/* What Happens Card */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 150, duration: 400 }}
        >
          <Card variant="default" padding="lg" style={styles.infoCard}>
            <NeonText variant="body" color="white" style={styles.infoTitle}>
              What happens when you log out?
            </NeonText>
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <NeonText variant="body" color="primary">•</NeonText>
                <NeonText variant="caption" color="muted" style={styles.infoItemText}>
                  You'll need to sign in again to access your account
                </NeonText>
              </View>
              <View style={styles.infoItem}>
                <NeonText variant="body" color="primary">•</NeonText>
                <NeonText variant="caption" color="muted" style={styles.infoItemText}>
                  Your portfolio and trading activity remain safe
                </NeonText>
              </View>
              <View style={styles.infoItem}>
                <NeonText variant="body" color="primary">•</NeonText>
                <NeonText variant="caption" color="muted" style={styles.infoItemText}>
                  This device will be logged out only
                </NeonText>
              </View>
            </View>
          </Card>
        </MotiView>

        {/* Action Buttons */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.buttonSection}
        >
          <NeonButton variant="danger" onPress={handleLogout}>
            Log Out
          </NeonButton>
          <NeonButton variant="secondary" onPress={handleCancel} style={styles.cancelButton}>
            Cancel
          </NeonButton>
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
  iconSection: {
    alignItems: 'center',
    marginTop: spacing[6],
    marginBottom: spacing[6],
  },
  iconContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 70,
    position: 'relative',
  },
  iconEmoji: {
    fontSize: 64,
  },
  iconGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    backgroundColor: colors.primary[500],
    borderRadius: 70,
    zIndex: -1,
  },
  infoCard: {
    marginBottom: spacing[4],
  },
  infoTitle: {
    fontWeight: '600',
    marginBottom: spacing[3],
  },
  infoList: {
    gap: spacing[3],
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  infoItemText: {
    flex: 1,
    lineHeight: 20,
  },
  buttonSection: {
    marginTop: spacing[4],
    gap: spacing[3],
  },
  cancelButton: {
    marginTop: spacing[2],
  },
});

