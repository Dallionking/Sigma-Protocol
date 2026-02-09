import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

const DISCORD_INVITE = 'https://discord.gg/example';

const COMMUNITY_STATS = [
  { label: 'Members', value: '2.4K+' },
  { label: 'Online Now', value: '127' },
  { label: 'Daily Messages', value: '500+' },
];

const CHANNELS = [
  { icon: '📢', name: '#announcements', description: 'Official updates' },
  { icon: '💬', name: '#general', description: 'Chat with traders' },
  { icon: '📊', name: '#signals', description: 'Live AI signal discussion' },
  { icon: '🎓', name: '#education', description: 'Learn & grow' },
  { icon: '🏆', name: '#wins', description: 'Share your trades' },
];

export default function DiscordScreen() {
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleOpenDiscord = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await Linking.openURL(DISCORD_INVITE);
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
          <NeonText variant="h2" color="white">The Vault</NeonText>
          <View style={styles.titleUnderline} />
          <NeonText variant="body" color="muted">Private Discord Community</NeonText>
        </MotiView>

        {/* Hero */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.heroSection}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroGlow} />
            <MotiView
              animate={{ rotate: ['0deg', '10deg', '-10deg', '0deg'] }}
              transition={{ type: 'timing', duration: 4000, loop: true }}
            >
              <NeonText style={styles.heroEmoji}>💬</NeonText>
            </MotiView>
            <NeonText variant="h3" color="white" style={styles.heroTitle}>
              Join Elite Traders
            </NeonText>
            <NeonText variant="body" color="muted" style={styles.heroSubtitle}>
              Connect with the Trading Platform community, share strategies, and learn from top performers.
            </NeonText>
          </View>
        </MotiView>

        {/* Stats */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 150, duration: 400 }}
          style={styles.statsSection}
        >
          <View style={styles.statsRow}>
            {COMMUNITY_STATS.map((stat, index) => (
              <MotiView
                key={stat.label}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', delay: 200 + index * 50, duration: 300 }}
                style={styles.statItem}
              >
                <NeonText variant="h3" color="primary">{stat.value}</NeonText>
                <NeonText variant="caption" color="muted">{stat.label}</NeonText>
              </MotiView>
            ))}
          </View>
        </MotiView>

        {/* Channels Preview */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 250, duration: 400 }}
          style={styles.channelsSection}
        >
          <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
            POPULAR CHANNELS
          </NeonText>

          <View style={styles.channelsList}>
            {CHANNELS.map((channel, index) => (
              <MotiView
                key={channel.name}
                from={{ opacity: 0, translateX: -10 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', delay: 300 + index * 40, duration: 300 }}
              >
                <View style={styles.channelRow}>
                  <NeonText style={styles.channelIcon}>{channel.icon}</NeonText>
                  <View style={styles.channelContent}>
                    <NeonText variant="body" color="white">{channel.name}</NeonText>
                    <NeonText variant="caption" color="muted">{channel.description}</NeonText>
                  </View>
                </View>
                {index < CHANNELS.length - 1 && <View style={styles.channelDivider} />}
              </MotiView>
            ))}
          </View>
        </MotiView>

        {/* Join Button */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 500, duration: 400 }}
          style={styles.joinSection}
        >
          <NeonButton onPress={handleOpenDiscord}>
            Open Discord Invite
          </NeonButton>
          <NeonText variant="caption" color="muted" style={styles.joinHint}>
            Opens in Discord app
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
    gap: spacing[1],
  },
  backButton: {
    paddingVertical: spacing[2],
    alignSelf: 'flex-start',
  },
  titleUnderline: {
    height: 2,
    width: 50,
    backgroundColor: colors.primary[500],
    borderRadius: 1,
    marginTop: spacing[1],
    marginBottom: spacing[1],
  },
  heroSection: {
    marginTop: spacing[4],
  },
  heroCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 20,
    padding: spacing[6],
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary[500],
    opacity: 0.1,
  },
  heroEmoji: {
    fontSize: 64,
    marginBottom: spacing[3],
  },
  heroTitle: {
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  heroSubtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  statsSection: {
    marginTop: spacing[4],
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    paddingVertical: spacing[4],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  channelsSection: {
    marginTop: spacing[6],
  },
  sectionLabel: {
    letterSpacing: 1.5,
    fontSize: 11,
    marginBottom: spacing[3],
  },
  channelsList: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    overflow: 'hidden',
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    gap: spacing[3],
  },
  channelIcon: {
    fontSize: 24,
  },
  channelContent: {
    flex: 1,
    gap: 2,
  },
  channelDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginLeft: 52,
  },
  joinSection: {
    marginTop: spacing[6],
    alignItems: 'center',
  },
  joinHint: {
    marginTop: spacing[2],
  },
});


