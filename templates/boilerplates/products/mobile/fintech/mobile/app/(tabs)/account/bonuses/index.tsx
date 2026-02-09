import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, Card, ListRow, Icon, type IconName } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

const BONUS_SECTIONS: Array<{
  id: string;
  title: string;
  items: Array<{ id: string; icon: IconName; title: string; subtitle: string; route: string }>;
}> = [
  {
    id: 'learning',
    title: 'LEARNING',
    items: [
      { id: 'quickstart', icon: 'rocket', title: 'Quick-Start Guides', subtitle: 'Get trading in minutes', route: '/(tabs)/account/bonuses/quickstart' },
      { id: 'masterclass', icon: 'award', title: 'AI Masterclass', subtitle: 'Deep dive into signals', route: '/(tabs)/account/bonuses/masterclass' },
      { id: 'digest', icon: 'mail', title: 'Weekly Digest', subtitle: 'Market insights & tips', route: '/(tabs)/account/bonuses/weekly-digest' },
    ],
  },
  {
    id: 'community',
    title: 'COMMUNITY',
    items: [
      { id: 'discord', icon: 'message', title: 'The Vault (Discord)', subtitle: 'Join elite traders', route: '/(tabs)/account/bonuses/discord' },
      { id: 'voting', icon: 'flag', title: 'Feature Voting', subtitle: 'Shape the roadmap', route: '/(tabs)/account/bonuses/voting' },
    ],
  },
  {
    id: 'customization',
    title: 'CUSTOMIZATION',
    items: [
      { id: 'skins', icon: 'gem', title: 'Dashboard Skins', subtitle: 'Personalize your HUD', route: '/(tabs)/account/bonuses/skins' },
    ],
  },
];

export default function BonusesHubScreen() {
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleItemPress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
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
          <NeonText variant="h2" color="white">Bonuses & Perks</NeonText>
          <View style={styles.titleUnderline} />
          <NeonText variant="body" color="muted" style={styles.subtitle}>
            Exclusive content for Pro members
          </NeonText>
        </MotiView>

        {/* Hero Badge */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.heroSection}
        >
          <View style={styles.heroBadge}>
            <View style={styles.heroGlow} />
            <MotiView
              animate={{ rotate: ['0deg', '5deg', '-5deg', '0deg'] }}
              transition={{ type: 'timing', duration: 3000, loop: true }}
            >
              <Icon name="star" size={40} color="primary" />
            </MotiView>
            <View style={styles.heroTextContainer}>
              <NeonText variant="h4" color="primary" glow>Member Benefits</NeonText>
              <NeonText variant="caption" color="muted">Unlock your full potential</NeonText>
            </View>
          </View>
        </MotiView>

        {/* Sections */}
        {BONUS_SECTIONS.map((section, sectionIndex) => (
          <MotiView
            key={section.id}
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 150 + sectionIndex * 50, duration: 400 }}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
                {section.title}
              </NeonText>
              <View style={styles.sectionLine} />
            </View>

            <View style={styles.sectionContent}>
              {section.items.map((item, index) => (
                <MotiView
                  key={item.id}
                  from={{ opacity: 0, translateX: -15 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'timing', delay: 200 + sectionIndex * 50 + index * 40, duration: 400 }}
                >
                  <Pressable
                    style={styles.itemRow}
                    onPress={() => handleItemPress(item.route)}
                  >
                    <View style={styles.itemIcon}>
                      <Icon name={item.icon} size={20} color="primary" />
                    </View>
                    <View style={styles.itemContent}>
                      <NeonText variant="body" color="white">{item.title}</NeonText>
                      <NeonText variant="caption" color="muted">{item.subtitle}</NeonText>
                    </View>
                    <NeonText variant="body" color="muted" style={styles.itemArrow}>›</NeonText>
                  </Pressable>
                  {index < section.items.length - 1 && <View style={styles.itemDivider} />}
                </MotiView>
              ))}
            </View>
          </MotiView>
        ))}

        {/* Pro Tip */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 500, duration: 400 }}
          style={styles.tipSection}
        >
          <View style={styles.tipCard}>
            <View style={styles.tipAccent} />
            <NeonText variant="caption" color="primary" style={styles.tipLabel}>PRO TIP</NeonText>
            <NeonText variant="caption" color="muted" style={styles.tipText}>
              Complete the Quick-Start guides to earn bonus trading credits!
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
    width: 80,
    backgroundColor: colors.primary[500],
    borderRadius: 1,
    marginTop: spacing[1],
  },
  subtitle: {
    marginTop: spacing[1],
  },
  heroSection: {
    marginTop: spacing[4],
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    padding: spacing[4],
    gap: spacing[3],
    borderWidth: 1,
    borderColor: colors.primary[500],
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[500],
    opacity: 0.1,
  },
  heroEmoji: {
    fontSize: 40,
  },
  heroTextContainer: {
    flex: 1,
    gap: 2,
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
  sectionContent: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[3],
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  iconEmoji: {
    fontSize: 20,
  },
  itemContent: {
    flex: 1,
    gap: 2,
  },
  itemArrow: {
    fontSize: 20,
    marginLeft: spacing[2],
  },
  itemDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginLeft: 60,
  },
  tipSection: {
    marginTop: spacing[6],
  },
  tipCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[4],
    position: 'relative',
    overflow: 'hidden',
  },
  tipAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.primary[500],
  },
  tipLabel: {
    letterSpacing: 1,
    marginBottom: spacing[1],
  },
  tipText: {
    lineHeight: 18,
  },
});


