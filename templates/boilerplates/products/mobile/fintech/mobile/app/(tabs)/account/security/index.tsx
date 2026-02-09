import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, Card, ListRow } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useBiometricStatus } from '@/lib/hooks/use-auth';
import { enableBiometric, disableBiometric, getBiometricLabel } from '@/lib/utils/biometric';

export default function SecurityCenterScreen() {
  const router = useRouter();
  const biometricEnabled = useAuthStore(state => state.biometricEnabled);
  const setBiometric = useAuthStore(state => state.setBiometric);
  const { data: biometricStatus } = useBiometricStatus();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleFaceIdToggle = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      if (value) {
        // Enable biometric - requires authentication
        const result = await enableBiometric();
        if (result.success) {
          await setBiometric(true);
        } else {
          // Show error, don't toggle
          console.error('Biometric enable failed:', result.error);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      } else {
        // Disable biometric - no authentication needed
        await disableBiometric();
        await setBiometric(false);
      }
    } catch (error) {
      console.error('Biometric toggle error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleChangePassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/account/security/change-password');
  };

  const handleSessions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/account/security/sessions');
  };

  const handleDeleteAccount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/account/security/delete-account');
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/(tabs)/account/security/logout');
  };

  // Get biometric label based on device
  const biometricLabel = biometricStatus 
    ? getBiometricLabel(biometricStatus.biometricType)
    : Platform.OS === 'ios' ? 'Face ID' : 'Biometric';

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
          <NeonText variant="h2" color="white">Security & Privacy</NeonText>
          <NeonText variant="caption" color="muted" style={styles.subtitle}>
            Manage your account security and privacy settings
          </NeonText>
        </MotiView>

        {/* Authentication Section */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 100, duration: 400 }}
        >
          <View style={styles.sectionHeader}>
            <NeonText variant="label" color="muted" style={styles.sectionTitle}>
              Authentication
            </NeonText>
            <View style={styles.sectionUnderline} />
          </View>
          <Card variant="default" padding="none">
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <View style={styles.toggleTitleRow}>
                  <NeonText variant="body" color="white" style={styles.toggleTitle}>
                    {biometricLabel}
                  </NeonText>
                  {biometricEnabled && (
                    <View style={styles.enabledBadge}>
                      <NeonText variant="caption" style={styles.enabledBadgeText}>
                        Enabled
                      </NeonText>
                    </View>
                  )}
                </View>
                <NeonText variant="caption" color="muted">
                  {biometricStatus?.isAvailable 
                    ? `Unlock the app with ${biometricLabel.toLowerCase()}`
                    : 'Biometric authentication not available'}
                </NeonText>
              </View>
              <MotiView
                animate={{ 
                  scale: biometricEnabled ? 1.05 : 1,
                }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleFaceIdToggle}
                  disabled={!biometricStatus?.isAvailable}
                  trackColor={{ false: colors.neutral[300], true: colors.primary[700] }}
                  thumbColor={biometricEnabled ? colors.primary.DEFAULT : colors.neutral[500]}
                />
              </MotiView>
            </View>
            <ListRow
              icon="🔑"
              title="Change Password"
              subtitle="Update your account password"
              showArrow
              onPress={handleChangePassword}
            />
            <ListRow
              icon="📱"
              title="Active Sessions"
              subtitle="Manage where you're logged in"
              showArrow
              divider={false}
              onPress={handleSessions}
            />
          </Card>
        </MotiView>

        {/* Security Tips */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 150, duration: 400 }}
          style={styles.tipsSection}
        >
          <Card variant="default" padding="md" style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <NeonText variant="body">💡</NeonText>
              <NeonText variant="body" color="white" style={styles.tipsTitle}>
                Security Tips
              </NeonText>
            </View>
            <NeonText variant="caption" color="muted" style={styles.tipsText}>
              • Use a strong, unique password{'\n'}
              • Enable biometric authentication{'\n'}
              • Review active sessions regularly{'\n'}
              • Never share your login credentials
            </NeonText>
          </Card>
        </MotiView>

        {/* Danger Zone */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.dangerSection}
        >
          <View style={styles.sectionHeader}>
            <NeonText variant="label" style={styles.dangerSectionTitle}>
              Danger Zone
            </NeonText>
            <View style={styles.dangerUnderline} />
          </View>
          <Card variant="default" padding="none" style={styles.dangerCard}>
            <ListRow
              icon="🗑️"
              title="Delete Account"
              subtitle="Permanently delete your account and data"
              showArrow
              divider={false}
              onPress={handleDeleteAccount}
            />
          </Card>
        </MotiView>

        {/* Logout */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 250, duration: 400 }}
          style={styles.logoutSection}
        >
          <Pressable 
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              { 
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <NeonText variant="body" style={styles.logoutText}>Log Out</NeonText>
          </Pressable>
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
    gap: spacing[1],
  },
  backButton: {
    paddingVertical: spacing[2],
    alignSelf: 'flex-start',
  },
  subtitle: {
    marginTop: spacing[1],
  },
  sectionHeader: {
    marginTop: spacing[5],
    marginBottom: spacing[3],
  },
  sectionTitle: {
    marginLeft: spacing[1],
    marginBottom: spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  sectionUnderline: {
    height: 2,
    backgroundColor: colors.primary[500],
    width: 40,
    marginLeft: spacing[1],
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  toggleInfo: {
    flex: 1,
    gap: spacing[1],
    paddingRight: spacing[3],
  },
  toggleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  toggleTitle: {
    fontWeight: '600',
  },
  enabledBadge: {
    backgroundColor: colors.primary[900],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 6,
  },
  enabledBadgeText: {
    color: colors.primary[500],
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tipsSection: {
    marginTop: spacing[4],
  },
  tipsCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  tipsTitle: {
    fontWeight: '600',
  },
  tipsText: {
    lineHeight: 20,
  },
  dangerSection: {
    marginTop: spacing[4],
  },
  dangerSectionTitle: {
    marginLeft: spacing[1],
    marginBottom: spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
    color: colors.error,
  },
  dangerUnderline: {
    height: 2,
    backgroundColor: colors.error,
    width: 40,
    marginLeft: spacing[1],
  },
  dangerCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  logoutSection: {
    marginTop: spacing[6],
    marginBottom: spacing[2],
  },
  logoutButton: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    color: colors.error,
    fontWeight: '700',
    fontSize: 16,
  },
});

