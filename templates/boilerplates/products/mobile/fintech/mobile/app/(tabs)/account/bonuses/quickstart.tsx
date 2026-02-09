import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

const QUICKSTART_GUIDES = [
  {
    id: 'first-100',
    icon: '💰',
    title: 'Your First $100',
    duration: '5 min read',
    description: 'Fund your account and make your first trade',
    isCompleted: true,
  },
  {
    id: 'ai-signals',
    icon: '🤖',
    title: 'Understanding AI Signals',
    duration: '8 min read',
    description: 'How to interpret confidence levels',
    isCompleted: true,
  },
  {
    id: 'deposits',
    icon: '💳',
    title: 'Deposits & Withdrawals',
    duration: '4 min read',
    description: 'Move money in and out safely',
    isCompleted: false,
  },
  {
    id: 'risk-management',
    icon: '🛡️',
    title: 'Risk Management 101',
    duration: '6 min read',
    description: 'Protect your capital like a pro',
    isCompleted: false,
  },
  {
    id: 'advanced-settings',
    icon: '⚙️',
    title: 'Advanced Settings',
    duration: '7 min read',
    description: 'Fine-tune your trading preferences',
    isCompleted: false,
  },
];

export default function QuickStartScreen() {
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleGuidePress = (guideId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(tabs)/account/bonuses/quickstart-detail',
      params: { id: guideId },
    });
  };

  const completedCount = QUICKSTART_GUIDES.filter(g => g.isCompleted).length;
  const progressPercent = (completedCount / QUICKSTART_GUIDES.length) * 100;

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
          <NeonText variant="h2" color="white">Quick-Start</NeonText>
          <View style={styles.titleUnderline} />
        </MotiView>

        {/* Progress Card */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.progressSection}
        >
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <NeonText variant="caption" color="muted" style={styles.progressLabel}>
                  YOUR PROGRESS
                </NeonText>
                <NeonText variant="h3" color="white">
                  {completedCount} of {QUICKSTART_GUIDES.length} complete
                </NeonText>
              </View>
              <View style={styles.progressBadge}>
                <NeonText variant="h4" color="primary">{Math.round(progressPercent)}%</NeonText>
              </View>
            </View>
            
            <View style={styles.progressBarContainer}>
              <MotiView
                from={{ width: '0%' }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ type: 'timing', delay: 200, duration: 600 }}
                style={styles.progressBarFill}
              />
            </View>
          </View>
        </MotiView>

        {/* Guides List */}
        <View style={styles.guidesSection}>
          <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
            GUIDES
          </NeonText>
          
          {QUICKSTART_GUIDES.map((guide, index) => (
            <MotiView
              key={guide.id}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', delay: 150 + index * 50, duration: 400 }}
            >
              <Pressable
                style={[styles.guideCard, guide.isCompleted && styles.guideCompleted]}
                onPress={() => handleGuidePress(guide.id)}
              >
                <View style={styles.guideIcon}>
                  <NeonText style={styles.guideEmoji}>{guide.icon}</NeonText>
                  {guide.isCompleted && (
                    <View style={styles.completedBadge}>
                      <NeonText style={styles.checkmark}>✓</NeonText>
                    </View>
                  )}
                </View>
                
                <View style={styles.guideContent}>
                  <View style={styles.guideHeader}>
                    <NeonText variant="body" color="white">{guide.title}</NeonText>
                    <NeonText variant="caption" color="muted">{guide.duration}</NeonText>
                  </View>
                  <NeonText variant="caption" color="muted">{guide.description}</NeonText>
                </View>
                
                <NeonText variant="body" color="muted" style={styles.guideArrow}>›</NeonText>
              </Pressable>
            </MotiView>
          ))}
        </View>

        {/* Completion Bonus */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 500, duration: 400 }}
          style={styles.bonusSection}
        >
          <View style={styles.bonusCard}>
            <View style={styles.bonusAccent} />
            <NeonText style={styles.bonusEmoji}>🎁</NeonText>
            <View style={styles.bonusContent}>
              <NeonText variant="body" color="white">Complete All Guides</NeonText>
              <NeonText variant="caption" color="primary">Earn $5 bonus credit!</NeonText>
            </View>
          </View>
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
  titleUnderline: {
    height: 2,
    width: 60,
    backgroundColor: colors.primary[500],
    borderRadius: 1,
    marginTop: spacing[1],
  },
  progressSection: {
    marginTop: spacing[4],
  },
  progressCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    padding: spacing[4],
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  progressLabel: {
    letterSpacing: 1,
    fontSize: 10,
    marginBottom: spacing[1],
  },
  progressBadge: {
    backgroundColor: colors.primary[900],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 4,
  },
  guidesSection: {
    marginTop: spacing[6],
  },
  sectionLabel: {
    letterSpacing: 1.5,
    fontSize: 11,
    marginBottom: spacing[3],
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[3],
    marginBottom: spacing[2],
  },
  guideCompleted: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  guideIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
    position: 'relative',
  },
  guideEmoji: {
    fontSize: 24,
  },
  completedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 10,
    color: colors.neutral[0],
    fontWeight: '700',
  },
  guideContent: {
    flex: 1,
    gap: 2,
  },
  guideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guideArrow: {
    fontSize: 20,
    marginLeft: spacing[2],
  },
  bonusSection: {
    marginTop: spacing[4],
  },
  bonusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[4],
    gap: spacing[3],
    position: 'relative',
    overflow: 'hidden',
  },
  bonusAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primary[500],
  },
  bonusEmoji: {
    fontSize: 32,
  },
  bonusContent: {
    flex: 1,
    gap: 2,
  },
});


