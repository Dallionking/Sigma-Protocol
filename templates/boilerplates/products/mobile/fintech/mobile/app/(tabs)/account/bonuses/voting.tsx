import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

const FEATURE_REQUESTS = [
  { id: 'dark-mode', title: 'Dark Mode Skins', description: 'Custom HUD themes', votes: 247, hasVoted: false, status: 'voting' },
  { id: 'faster-cycles', title: 'Faster Trading Cycles', description: '5-min signal updates', votes: 189, hasVoted: true, status: 'voting' },
  { id: 'portfolio-view', title: 'Portfolio Analytics', description: 'Track all positions', votes: 156, hasVoted: false, status: 'voting' },
  { id: 'alerts', title: 'Push Alerts for Signals', description: 'Never miss a trade', votes: 312, hasVoted: true, status: 'planned' },
  { id: 'copy-trading', title: 'Copy Trading', description: 'Follow top traders', votes: 423, hasVoted: false, status: 'planned' },
];

export default function VotingScreen() {
  const router = useRouter();
  const [features, setFeatures] = useState(FEATURE_REQUESTS);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleVote = (featureId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFeatures(prev => prev.map(f => {
      if (f.id === featureId) {
        return {
          ...f,
          hasVoted: !f.hasVoted,
          votes: f.hasVoted ? f.votes - 1 : f.votes + 1,
        };
      }
      return f;
    }));
  };

  const votingFeatures = features.filter(f => f.status === 'voting');
  const plannedFeatures = features.filter(f => f.status === 'planned');

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
          <NeonText variant="h2" color="white">Feature Voting</NeonText>
          <View style={styles.titleUnderline} />
          <NeonText variant="body" color="muted">Shape the roadmap</NeonText>
        </MotiView>

        {/* Voting Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
              VOTE NOW
            </NeonText>
            <View style={styles.sectionLine} />
          </View>

          {votingFeatures.map((feature, index) => (
            <MotiView
              key={feature.id}
              from={{ opacity: 0, translateX: -15 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', delay: 100 + index * 50, duration: 400 }}
            >
              <View style={[styles.featureCard, feature.hasVoted && styles.featureVoted]}>
                <View style={styles.featureContent}>
                  <NeonText variant="body" color="white">{feature.title}</NeonText>
                  <NeonText variant="caption" color="muted">{feature.description}</NeonText>
                </View>
                
                <Pressable
                  style={[styles.voteButton, feature.hasVoted && styles.voteButtonActive]}
                  onPress={() => handleVote(feature.id)}
                >
                  <NeonText
                    variant="caption"
                    color={feature.hasVoted ? 'primary' : 'muted'}
                    style={styles.voteIcon}
                  >
                    ▲
                  </NeonText>
                  <NeonText
                    variant="body"
                    color={feature.hasVoted ? 'primary' : 'white'}
                    style={styles.voteCount}
                  >
                    {feature.votes}
                  </NeonText>
                </Pressable>
              </View>
            </MotiView>
          ))}
        </View>

        {/* Planned Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
              PLANNED
            </NeonText>
            <View style={styles.sectionLine} />
          </View>

          {plannedFeatures.map((feature, index) => (
            <MotiView
              key={feature.id}
              from={{ opacity: 0, translateX: -15 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', delay: 300 + index * 50, duration: 400 }}
            >
              <View style={styles.plannedCard}>
                <View style={styles.plannedBadge}>
                  <NeonText variant="caption" color="primary">✓</NeonText>
                </View>
                <View style={styles.featureContent}>
                  <NeonText variant="body" color="white">{feature.title}</NeonText>
                  <NeonText variant="caption" color="muted">{feature.description}</NeonText>
                </View>
                <NeonText variant="caption" color="muted">{feature.votes} votes</NeonText>
              </View>
            </MotiView>
          ))}
        </View>

        {/* Suggest Feature */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 500, duration: 400 }}
          style={styles.suggestSection}
        >
          <View style={styles.suggestCard}>
            <View style={styles.suggestAccent} />
            <NeonText style={styles.suggestEmoji}>💡</NeonText>
            <View style={styles.suggestContent}>
              <NeonText variant="body" color="white">Have an idea?</NeonText>
              <NeonText variant="caption" color="muted">
                Submit feature requests in Discord
              </NeonText>
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
    width: 80,
    backgroundColor: colors.primary[500],
    borderRadius: 1,
    marginTop: spacing[1],
    marginBottom: spacing[1],
  },
  section: {
    marginTop: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  sectionLabel: {
    letterSpacing: 1.5,
    fontSize: 11,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral[200],
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[2],
    gap: spacing[3],
  },
  featureVoted: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  featureContent: {
    flex: 1,
    gap: 2,
  },
  voteButton: {
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.neutral[200],
    borderRadius: 10,
    minWidth: 56,
  },
  voteButtonActive: {
    backgroundColor: colors.primary[900],
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  voteIcon: {
    fontSize: 10,
  },
  voteCount: {
    fontWeight: '600',
  },
  plannedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[2],
    gap: spacing[3],
  },
  plannedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[900],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  suggestSection: {
    marginTop: spacing[4],
  },
  suggestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[4],
    gap: spacing[3],
    position: 'relative',
    overflow: 'hidden',
  },
  suggestAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primary[500],
  },
  suggestEmoji: {
    fontSize: 28,
  },
  suggestContent: {
    flex: 1,
    gap: 2,
  },
});


