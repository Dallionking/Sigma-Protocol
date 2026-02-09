import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import { verticalScale, moderateScale } from '@/lib/utils/responsive';

export default function ConnectFailureScreen() {
  const router = useRouter();

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, []);

  const handleTryAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(broker)/connect-tradelocker');
  };

  const handleGetHelp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Would navigate to support
    console.log('Navigate to support');
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(broker)/connect-start');
  };

  return (
    <Screen safeArea padded={false} style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <NeonText variant="body" color="muted">‹ Back</NeonText>
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Error Icon */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.iconSection}
        >
          <View style={styles.errorCircle}>
            <NeonText variant="display" style={styles.errorIcon}>✕</NeonText>
          </View>
        </MotiView>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200 }}
        >
          <NeonText variant="h2" color="danger" align="center">
            Connection Failed
          </NeonText>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300 }}
        >
          <NeonText variant="body" color="muted" align="center" style={styles.subtitle}>
            We couldn't connect to your broker account. Please try again.
          </NeonText>
        </MotiView>

        {/* Troubleshooting Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400 }}
        >
          <Card variant="default" padding="md" style={styles.troubleshootCard}>
            <NeonText variant="h4" color="white" style={styles.troubleshootTitle}>
              Troubleshooting
            </NeonText>
            <View style={styles.troubleshootList}>
              <View style={styles.troubleshootItem}>
                <NeonText variant="body" color="primary">•</NeonText>
                <NeonText variant="body" color="muted">Check your credentials</NeonText>
              </View>
              <View style={styles.troubleshootItem}>
                <NeonText variant="body" color="primary">•</NeonText>
                <NeonText variant="body" color="muted">Ensure 2FA is completed</NeonText>
              </View>
              <View style={styles.troubleshootItem}>
                <NeonText variant="body" color="primary">•</NeonText>
                <NeonText variant="body" color="muted">Verify account is active</NeonText>
              </View>
            </View>
          </Card>
        </MotiView>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 500 }}
        >
          <NeonButton onPress={handleTryAgain}>
            Try Again
          </NeonButton>
        </MotiView>
        
        <Pressable onPress={handleGetHelp} style={styles.helpLink}>
          <NeonText variant="body" color="muted">Need help? Contact support</NeonText>
        </Pressable>
      </View>
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
    flexGrow: 1,
    paddingHorizontal: spacing[4],
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  backButton: {
    paddingVertical: spacing[2],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  iconSection: {
    marginBottom: spacing[4],
  },
  errorCircle: {
    width: moderateScale(90),
    height: moderateScale(90),
    borderRadius: moderateScale(45),
    backgroundColor: colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    fontSize: moderateScale(42),
    color: colors.neutral[900],
  },
  subtitle: {
    marginTop: spacing[2],
    marginBottom: spacing[6],
    maxWidth: 280,
  },
  troubleshootCard: {
    width: '100%',
    maxWidth: 320,
  },
  troubleshootTitle: {
    marginBottom: spacing[3],
  },
  troubleshootList: {
    gap: spacing[2],
  },
  troubleshootItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  actions: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
  helpLink: {
    alignItems: 'center',
    paddingVertical: spacing[3],
    marginTop: spacing[2],
  },
});

