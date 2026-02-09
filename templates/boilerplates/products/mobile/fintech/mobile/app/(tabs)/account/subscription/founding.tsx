import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, Card } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

export default function FoundingMemberScreen() {
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        </MotiView>

        {/* Crown Icon */}
        <MotiView
          from={{ opacity: 0, scale: 0, rotate: '-180deg' }}
          animate={{ opacity: 1, scale: 1, rotate: '0deg' }}
          transition={{ type: 'spring', delay: 100, damping: 12 }}
          style={styles.iconSection}
        >
          <View style={styles.crownContainer}>
            <NeonText variant="display" style={styles.crownIcon}>👑</NeonText>
            {/* Shine Effect */}
            <MotiView
              from={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 1] }}
              transition={{ type: 'timing', duration: 2000, loop: true }}
              style={styles.shine}
            />
          </View>
        </MotiView>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300, duration: 400 }}
          style={styles.titleSection}
        >
          <NeonText variant="h1" color="primary" style={styles.title}>
            Founding Member
          </NeonText>
          <NeonText variant="body" color="muted" style={styles.subtitle}>
            You're part of the founding community
          </NeonText>
        </MotiView>

        {/* Benefits Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400, duration: 400 }}
        >
          <Card variant="default" padding="lg" style={styles.benefitsCard}>
            <NeonText variant="h4" color="white" style={styles.benefitsTitle}>
              Your Exclusive Benefits
            </NeonText>

            <View style={styles.benefitsList}>
              <View style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <NeonText variant="body">🔒</NeonText>
                </View>
                <View style={styles.benefitContent}>
                  <NeonText variant="body" color="white">Price Locked Forever</NeonText>
                  <NeonText variant="caption" color="muted">
                    Your subscription price will never increase
                  </NeonText>
                </View>
              </View>

              <View style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <NeonText variant="body">⚡</NeonText>
                </View>
                <View style={styles.benefitContent}>
                  <NeonText variant="body" color="white">Early Access</NeonText>
                  <NeonText variant="caption" color="muted">
                    First to try new features and improvements
                  </NeonText>
                </View>
              </View>

              <View style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <NeonText variant="body">💎</NeonText>
                </View>
                <View style={styles.benefitContent}>
                  <NeonText variant="body" color="white">Exclusive Badge</NeonText>
                  <NeonText variant="caption" color="muted">
                    Display your founding member status
                  </NeonText>
                </View>
              </View>

              <View style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <NeonText variant="body">🎯</NeonText>
                </View>
                <View style={styles.benefitContent}>
                  <NeonText variant="body" color="white">Priority Support</NeonText>
                  <NeonText variant="caption" color="muted">
                    Direct line to the team
                  </NeonText>
                </View>
              </View>
            </View>
          </Card>
        </MotiView>

        {/* Thank You Message */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 600, duration: 400 }}
          style={styles.thankYouSection}
        >
          <Card variant="default" padding="md" style={styles.thankYouCard}>
            <NeonText variant="body" color="primary" style={styles.thankYouText}>
              Thank you for believing in Trading Platform from the beginning. Your support makes everything possible.
            </NeonText>
          </Card>
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
  },
  backButton: {
    paddingVertical: spacing[2],
    alignSelf: 'flex-start',
  },
  iconSection: {
    alignItems: 'center',
    marginTop: spacing[8],
    marginBottom: spacing[6],
  },
  crownContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownIcon: {
    fontSize: 80,
  },
  shine: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary[500],
    opacity: 0.2,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  title: {
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  benefitsCard: {
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.primary[900],
  },
  benefitsTitle: {
    marginBottom: spacing[4],
  },
  benefitsList: {
    gap: spacing[4],
  },
  benefitRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  benefitIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.neutral[100],
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitContent: {
    flex: 1,
    gap: 4,
  },
  thankYouSection: {
    marginTop: spacing[4],
  },
  thankYouCard: {
    backgroundColor: colors.primary[900],
    borderWidth: 1,
    borderColor: colors.primary[800],
  },
  thankYouText: {
    textAlign: 'center',
    lineHeight: 22,
  },
});

