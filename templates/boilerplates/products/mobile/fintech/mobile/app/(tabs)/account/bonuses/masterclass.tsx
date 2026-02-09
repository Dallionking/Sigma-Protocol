import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

const MASTERCLASS_CHAPTERS = [
  { id: 'intro', title: 'Introduction to AI Trading', duration: '5:32', isCompleted: true, isLocked: false },
  { id: 'signals', title: 'Signals Explained', duration: '12:18', isCompleted: true, isLocked: false },
  { id: 'volatility', title: 'Understanding Volatility', duration: '8:45', isCompleted: false, isLocked: false },
  { id: 'confidence', title: 'Confidence Scoring Deep Dive', duration: '14:22', isCompleted: false, isLocked: false },
  { id: 'risk', title: 'Advanced Risk Management', duration: '10:05', isCompleted: false, isLocked: true },
  { id: 'psychology', title: 'Trading Psychology', duration: '9:38', isCompleted: false, isLocked: true },
];

export default function MasterclassScreen() {
  const router = useRouter();
  const [currentChapter, setCurrentChapter] = useState('volatility');

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleChapterPress = (chapter: typeof MASTERCLASS_CHAPTERS[0]) => {
    if (chapter.isLocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentChapter(chapter.id);
  };

  const completedCount = MASTERCLASS_CHAPTERS.filter(c => c.isCompleted).length;

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
          <NeonText variant="h2" color="white">AI Masterclass</NeonText>
          <View style={styles.titleUnderline} />
        </MotiView>

        {/* Video Placeholder */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.videoSection}
        >
          <View style={styles.videoContainer}>
            <View style={styles.videoGradient} />
            <MotiView
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ type: 'timing', duration: 2000, loop: true }}
              style={styles.playButton}
            >
              <NeonText style={styles.playIcon}>▶</NeonText>
            </MotiView>
            <View style={styles.videoInfo}>
              <NeonText variant="caption" color="muted">NOW PLAYING</NeonText>
              <NeonText variant="body" color="white">Understanding Volatility</NeonText>
            </View>
          </View>
        </MotiView>

        {/* Progress */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 150, duration: 400 }}
          style={styles.progressSection}
        >
          <View style={styles.progressRow}>
            <NeonText variant="caption" color="muted">Progress</NeonText>
            <NeonText variant="caption" color="primary">
              {completedCount}/{MASTERCLASS_CHAPTERS.length} chapters
            </NeonText>
          </View>
          <View style={styles.progressBar}>
            <MotiView
              from={{ width: '0%' }}
              animate={{ width: `${(completedCount / MASTERCLASS_CHAPTERS.length) * 100}%` }}
              transition={{ type: 'timing', delay: 200, duration: 600 }}
              style={styles.progressFill}
            />
          </View>
        </MotiView>

        {/* Chapters */}
        <View style={styles.chaptersSection}>
          <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
            CHAPTERS
          </NeonText>

          {MASTERCLASS_CHAPTERS.map((chapter, index) => (
            <MotiView
              key={chapter.id}
              from={{ opacity: 0, translateX: -15 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', delay: 200 + index * 40, duration: 400 }}
            >
              <Pressable
                style={[
                  styles.chapterRow,
                  chapter.id === currentChapter && styles.chapterActive,
                  chapter.isLocked && styles.chapterLocked,
                ]}
                onPress={() => handleChapterPress(chapter)}
              >
                <View style={styles.chapterNumber}>
                  {chapter.isCompleted ? (
                    <NeonText variant="caption" color="primary">✓</NeonText>
                  ) : chapter.isLocked ? (
                    <NeonText variant="caption" color="muted">🔒</NeonText>
                  ) : (
                    <NeonText variant="caption" color="white">{index + 1}</NeonText>
                  )}
                </View>
                
                <View style={styles.chapterContent}>
                  <NeonText
                    variant="body"
                    color={chapter.isLocked ? 'muted' : 'white'}
                  >
                    {chapter.title}
                  </NeonText>
                  <NeonText variant="caption" color="muted">{chapter.duration}</NeonText>
                </View>

                {chapter.id === currentChapter && !chapter.isLocked && (
                  <View style={styles.nowPlayingBadge}>
                    <MotiView
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ type: 'timing', duration: 1500, loop: true }}
                    >
                      <NeonText variant="caption" color="primary">●</NeonText>
                    </MotiView>
                  </View>
                )}
              </Pressable>
            </MotiView>
          ))}
        </View>

        {/* Unlock CTA */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 500, duration: 400 }}
          style={styles.unlockSection}
        >
          <View style={styles.unlockCard}>
            <View style={styles.unlockAccent} />
            <NeonText variant="body" color="white">Unlock All Chapters</NeonText>
            <NeonText variant="caption" color="muted">
              Upgrade to Pro for full access
            </NeonText>
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
    width: 70,
    backgroundColor: colors.primary[500],
    borderRadius: 1,
    marginTop: spacing[1],
  },
  videoSection: {
    marginTop: spacing[4],
  },
  videoContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  videoGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.neutral[200],
    opacity: 0.5,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 24,
    color: colors.neutral[0],
    marginLeft: 4,
  },
  videoInfo: {
    position: 'absolute',
    bottom: spacing[3],
    left: spacing[3],
    gap: 2,
  },
  progressSection: {
    marginTop: spacing[4],
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 3,
  },
  chaptersSection: {
    marginTop: spacing[6],
  },
  sectionLabel: {
    letterSpacing: 1.5,
    fontSize: 11,
    marginBottom: spacing[3],
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 10,
    padding: spacing[3],
    marginBottom: spacing[2],
    gap: spacing[3],
  },
  chapterActive: {
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  chapterLocked: {
    opacity: 0.6,
  },
  chapterNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterContent: {
    flex: 1,
    gap: 2,
  },
  nowPlayingBadge: {
    marginLeft: spacing[2],
  },
  unlockSection: {
    marginTop: spacing[4],
  },
  unlockCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[4],
    alignItems: 'center',
    gap: spacing[1],
    position: 'relative',
    overflow: 'hidden',
  },
  unlockAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primary[500],
  },
});


