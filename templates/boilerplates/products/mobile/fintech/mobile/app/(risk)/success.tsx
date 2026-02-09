import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card, Badge } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import { verticalScale, moderateScale } from '@/lib/utils/responsive';

export default function ActivateSuccessScreen() {
  const router = useRouter();

  useEffect(() => {
    const hapticSequence = async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await new Promise(resolve => setTimeout(resolve, 300));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };
    hapticSequence();
  }, []);

  const handleGoToDashboard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(tabs)/home');
  };

  const handleViewSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(risk)/settings');
  };

  return (
    <Screen safeArea padded={false} style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
      <View style={styles.content}>
        {/* Success icon */}
        <MotiView
          from={{ scale: 0, rotate: '-180deg' }}
          animate={{ scale: 1, rotate: '0deg' }}
          transition={{ type: 'spring', damping: 10, delay: 100 }}
          style={styles.iconContainer}
        >
          <View style={styles.successCircle}>
            <NeonText variant="display" style={styles.checkmark}>✓</NeonText>
          </View>
        </MotiView>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300 }}
        >
          <NeonText variant="h1" color="primary" align="center" glow>
            AI ACTIVE
          </NeonText>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400 }}
        >
          <NeonText variant="body" color="muted" align="center" style={styles.subtitle}>
            Your AI Trading Bot is now working for you
          </NeonText>
        </MotiView>

        {/* Status card */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 500 }}
        >
          <Card variant="highlight" padding="md" style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusIndicator} />
              <NeonText variant="body" color="white">AI Trading Bot</NeonText>
              <Badge variant="success">ACTIVE</Badge>
            </View>
            <View style={styles.statusBars}>
              {[1, 2, 3, 4, 5].map((bar, index) => (
                <MotiView
                  key={bar}
                  from={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ type: 'spring', delay: 600 + index * 80 }}
                  style={[styles.statusBar, { height: 10 + index * 4 }]}
                />
              ))}
              <NeonText variant="caption" color="muted" style={styles.analyzingText}>
                Analyzing markets...
              </NeonText>
            </View>
          </Card>
        </MotiView>

        {/* What's next */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 800 }}
          style={styles.nextSection}
        >
          <NeonText variant="caption" color="muted" style={styles.nextTitle}>
            WHAT HAPPENS NEXT
          </NeonText>
          <View style={styles.nextItems}>
            <View style={styles.nextItem}>
              <NeonText variant="body" color="primary">📊</NeonText>
              <NeonText variant="caption" color="muted">AI scans markets for opportunities</NeonText>
            </View>
            <View style={styles.nextItem}>
              <NeonText variant="body" color="primary">🔔</NeonText>
              <NeonText variant="caption" color="muted">Get notified when trades execute</NeonText>
            </View>
            <View style={styles.nextItem}>
              <NeonText variant="body" color="primary">💰</NeonText>
              <NeonText variant="caption" color="muted">Track P&L on your dashboard</NeonText>
            </View>
          </View>
        </MotiView>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 900 }}
        >
          <NeonButton onPress={handleGoToDashboard}>
            Go to Dashboard
          </NeonButton>
        </MotiView>
        
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 1000 }}
        >
          <NeonButton onPress={handleViewSettings}>
            View Bot Settings
          </NeonButton>
        </MotiView>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  iconContainer: {
    marginBottom: spacing[4],
  },
  successCircle: {
    width: moderateScale(90),
    height: moderateScale(90),
    borderRadius: moderateScale(45),
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: moderateScale(42),
    color: colors.neutral[0],
  },
  subtitle: {
    marginTop: spacing[2],
    marginBottom: spacing[6],
  },
  statusCard: {
    width: '100%',
    maxWidth: 300,
    marginBottom: spacing[6],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.DEFAULT,
  },
  statusBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBar: {
    width: 6,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 3,
  },
  analyzingText: {
    marginLeft: 'auto',
  },
  nextSection: {
    width: '100%',
    maxWidth: 300,
  },
  nextTitle: {
    marginBottom: spacing[3],
  },
  nextItems: {
    gap: spacing[2],
  },
  nextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  actions: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
    gap: spacing[3],
  },
});

