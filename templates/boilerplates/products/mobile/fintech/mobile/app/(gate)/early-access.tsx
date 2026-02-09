import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card, Badge, Icon } from '@/components/primitives';
import { AppLogo } from '@/components';
import { colors, spacing } from '@/lib/theme';
import { verticalScale } from '@/lib/utils/responsive';

export default function EarlyAccessScreen() {
  const router = useRouter();

  const handleJoinWaitlist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(gate)/waitlist-join');
  };

  const handleEnterCode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(gate)/invite-code');
  };

  const handleSkipDemo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(onboarding)/welcome');
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
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <AppLogo size={24} />
          </View>
          <NeonText variant="h4" color="white">TRADING PLATFORM</NeonText>
        </View>
        <Pressable onPress={handleSkipDemo} style={styles.skipButton}>
          <NeonText variant="caption" color="muted">Skip →</NeonText>
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Hero */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 100 }}
          style={styles.heroSection}
        >
          <Badge variant="success">EARLY ACCESS</Badge>
          <NeonText variant="h1" color="white" align="center" style={styles.title}>
            The Trading Platform
          </NeonText>
          <NeonText variant="body" color="muted" align="center" style={styles.subtitle}>
            AI-powered trading automation
          </NeonText>
        </MotiView>

        {/* Stats card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200 }}
        >
          <Card variant="highlight" padding="lg" style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <NeonText variant="h2" color="primary">1,000</NeonText>
                <NeonText variant="caption" color="muted">Founding Spots</NeonText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <NeonText variant="h2" color="white">Forever</NeonText>
                <NeonText variant="caption" color="muted">Locked Pricing</NeonText>
              </View>
            </View>
          </Card>
        </MotiView>

        {/* Features */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300 }}
          style={styles.featuresRow}
        >
          <View style={styles.featurePill}>
            <View style={styles.featureContent}>
              <Icon name="ai" size={14} color="muted" />
              <NeonText variant="caption" color="muted">AI Trading</NeonText>
            </View>
          </View>
          <View style={styles.featurePill}>
            <View style={styles.featureContent}>
              <Icon name="trendUp" size={14} color="muted" />
              <NeonText variant="caption" color="muted">24/7</NeonText>
            </View>
          </View>
          <View style={styles.featurePill}>
            <View style={styles.featureContent}>
              <Icon name="lock" size={14} color="muted" />
              <NeonText variant="caption" color="muted">Secure</NeonText>
            </View>
          </View>
        </MotiView>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400 }}
        >
          <NeonButton onPress={handleJoinWaitlist} size="lg">
            Join the Waitlist
          </NeonButton>
        </MotiView>
        
        <View style={styles.codeSection}>
          <NeonText variant="body" color="muted">Have an invite code? </NeonText>
          <Pressable onPress={handleEnterCode}>
            <NeonText variant="body" color="primary">Enter Code</NeonText>
          </Pressable>
        </View>
        
        <View style={styles.trustBadges}>
          <View style={styles.featureContent}>
            <Icon name="lock" size={12} color="muted" />
            <NeonText variant="caption" color="muted">No spam</NeonText>
          </View>
          <NeonText variant="caption" color="muted">•</NeonText>
          <NeonText variant="caption" color="muted">Cancel anytime</NeonText>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  title: {
    marginTop: spacing[3],
    marginBottom: spacing[2],
  },
  subtitle: {
    maxWidth: 260,
  },
  statsCard: {
    marginBottom: spacing[4],
    minWidth: 280,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.neutral[300],
    marginHorizontal: spacing[4],
  },
  featuresRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  featurePill: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.neutral[100],
    borderRadius: 20,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  actions: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
  codeSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[4],
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[3],
  },
});

