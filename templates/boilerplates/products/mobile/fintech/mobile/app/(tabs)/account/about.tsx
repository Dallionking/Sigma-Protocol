import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';
import { MotiView } from 'moti';
import { Screen, NeonText, Card, ListRow } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

// Get version info from expo-constants
const appVersion = Constants.expoConfig?.version ?? '1.0.0';
const buildNumber = Constants.expoConfig?.ios?.buildNumber ?? Constants.expoConfig?.android?.versionCode ?? '1';

const CREDITS_LINKS = [
  { key: 'website', title: 'Website', url: 'https://example.com' },
  { key: 'privacy', title: 'Privacy Policy', url: 'https://example.com/privacy' },
  { key: 'terms', title: 'Terms of Service', url: 'https://example.com/terms' },
];

export default function AboutAppScreen() {
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleLinkPress = async (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.log('Failed to open URL:', url);
    }
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
          <NeonText variant="h2" color="white">About</NeonText>
        </MotiView>

        {/* App Logo & Name */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.logoSection}
        >
          <View style={styles.logoContainer}>
            <NeonText variant="display" style={styles.logoEmoji}>🦅</NeonText>
            <View style={styles.logoGlow} />
          </View>
          <NeonText variant="h2" color="white" style={styles.appName}>
            Trading Platform
          </NeonText>
          <NeonText variant="caption" color="primary" glow>
            AI-Powered Trading
          </NeonText>
        </MotiView>

        {/* Version Info */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 150, duration: 400 }}
        >
          <Card variant="default" padding="lg" style={styles.versionCard}>
            <View style={styles.versionRow}>
              <NeonText variant="label" color="muted">Version</NeonText>
              <NeonText variant="body" color="white">{appVersion}</NeonText>
            </View>
            <View style={styles.divider} />
            <View style={styles.versionRow}>
              <NeonText variant="label" color="muted">Build</NeonText>
              <NeonText variant="body" color="white">{buildNumber}</NeonText>
            </View>
            <View style={styles.divider} />
            <View style={styles.versionRow}>
              <NeonText variant="label" color="muted">Release</NeonText>
              <NeonText variant="body" color="white">2025.12.12</NeonText>
            </View>
          </Card>
        </MotiView>

        {/* Credits / Links */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
        >
          <NeonText variant="label" color="muted" style={styles.sectionTitle}>
            Links
          </NeonText>
          <Card variant="default" padding="none">
            {CREDITS_LINKS.map((link, index) => (
              <ListRow
                key={link.key}
                icon="🔗"
                title={link.title}
                showArrow
                divider={index < CREDITS_LINKS.length - 1}
                onPress={() => handleLinkPress(link.url)}
              />
            ))}
          </Card>
        </MotiView>

        {/* Footer */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 300, duration: 400 }}
          style={styles.footer}
        >
          <NeonText variant="caption" color="muted" style={styles.footerText}>
            © 2025 Trading Platform
          </NeonText>
          <NeonText variant="caption" color="muted" style={styles.footerText}>
            All rights reserved.
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
    gap: spacing[2],
  },
  backButton: {
    paddingVertical: spacing[2],
    alignSelf: 'flex-start',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: spacing[6],
    marginBottom: spacing[8],
  },
  logoContainer: {
    position: 'relative',
    marginBottom: spacing[4],
  },
  logoEmoji: {
    fontSize: 80,
    zIndex: 1,
  },
  logoGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 60,
    backgroundColor: colors.glow,
    opacity: 0.3,
    zIndex: 0,
  },
  appName: {
    marginBottom: spacing[1],
  },
  versionCard: {
    marginBottom: spacing[6],
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[1],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing[2],
  },
  sectionTitle: {
    marginBottom: spacing[3],
    marginLeft: spacing[1],
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing[8],
    gap: spacing[1],
  },
  footerText: {
    textAlign: 'center',
  },
});

