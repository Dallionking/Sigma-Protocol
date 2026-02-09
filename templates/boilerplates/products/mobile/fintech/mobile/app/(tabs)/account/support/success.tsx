import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

export default function SupportSuccessScreen() {
  const router = useRouter();

  const handleBackToAccount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(tabs)/account');
  };

  return (
    <Screen safeArea style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <MotiView
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.iconSection}
        >
          <View style={styles.iconContainer}>
            <MotiView
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ type: 'timing', duration: 2000, loop: true }}
            >
              <NeonText variant="display" style={styles.iconEmoji}>✓</NeonText>
            </MotiView>
            <MotiView
              style={styles.iconGlow}
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
              transition={{ type: 'timing', duration: 2000, loop: true }}
            />
          </View>
        </MotiView>

        {/* Success Message */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.messageSection}
        >
          <NeonText variant="h2" color="primary" glow style={styles.title}>
            Sent!
          </NeonText>
          <NeonText variant="body" color="muted" style={styles.subtitle}>
            We'll reply by email within 24 hours.
          </NeonText>
        </MotiView>

        {/* Info Card */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300, duration: 400 }}
        >
          <Card variant="default" padding="lg" style={styles.infoCard}>
            <View style={styles.infoRow}>
              <NeonText variant="body">📧</NeonText>
              <NeonText variant="body" color="muted" style={styles.infoRowText}>
                Check your email inbox for our response
              </NeonText>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <NeonText variant="body">⏱️</NeonText>
              <NeonText variant="body" color="muted" style={styles.infoRowText}>
                We typically respond within 24 hours
              </NeonText>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <NeonText variant="body">📁</NeonText>
              <NeonText variant="body" color="muted" style={styles.infoRowText}>
                Check spam folder if you don't see it
              </NeonText>
            </View>
          </Card>
        </MotiView>

        {/* Back Button */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400, duration: 400 }}
          style={styles.buttonSection}
        >
          <NeonButton onPress={handleBackToAccount}>
            Back to Account
          </NeonButton>
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
    justifyContent: 'center',
    flexGrow: 1,
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  iconContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 64,
    color: colors.primary.DEFAULT,
    zIndex: 1,
  },
  iconGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: colors.glow,
    opacity: 0.4,
    zIndex: 0,
  },
  messageSection: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  title: {
    marginBottom: spacing[2],
  },
  subtitle: {
    textAlign: 'center',
  },
  infoCard: {
    marginBottom: spacing[6],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  infoRowText: {
    flex: 1,
    lineHeight: 22,
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing[3],
  },
  buttonSection: {
    marginTop: spacing[2],
  },
});


