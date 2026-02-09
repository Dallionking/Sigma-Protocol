import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import { verticalScale } from '@/lib/utils/responsive';

export default function ConnectStartScreen() {
  const router = useRouter();

  const handleConnect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(broker)/connect-tradelocker');
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
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
        <Pressable onPress={handleBack} style={styles.backButton}>
          <NeonText variant="body" color="muted">‹ Back</NeonText>
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Icon */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.iconContainer}
        >
          <View style={styles.iconCircle}>
            <NeonText variant="display" style={styles.iconEmoji}>🔗</NeonText>
          </View>
        </MotiView>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200 }}
        >
          <NeonText variant="h2" color="white" align="center">
            Connect Your Broker
          </NeonText>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300 }}
        >
          <NeonText variant="body" color="muted" align="center" style={styles.subtitle}>
            Link your trading account via TradeLocker
          </NeonText>
        </MotiView>

        {/* Benefits */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400 }}
          style={styles.benefitsContainer}
        >
          <Card variant="default" padding="md" style={styles.benefitCard}>
            <View style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <NeonText variant="body" color="primary">🔒</NeonText>
              </View>
              <View style={styles.benefitText}>
                <NeonText variant="body" color="white">Secure Connection</NeonText>
                <NeonText variant="caption" color="muted">Bank-grade encryption</NeonText>
              </View>
            </View>
          </Card>
          
          <Card variant="default" padding="md" style={styles.benefitCard}>
            <View style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <NeonText variant="body" color="primary">⚡</NeonText>
              </View>
              <View style={styles.benefitText}>
                <NeonText variant="body" color="white">Instant Sync</NeonText>
                <NeonText variant="caption" color="muted">Real-time balance updates</NeonText>
              </View>
            </View>
          </Card>
          
          <Card variant="default" padding="md" style={styles.benefitCard}>
            <View style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <NeonText variant="body" color="primary">🎮</NeonText>
              </View>
              <View style={styles.benefitText}>
                <NeonText variant="body" color="white">Full Control</NeonText>
                <NeonText variant="caption" color="muted">Disconnect anytime</NeonText>
              </View>
            </View>
          </Card>
        </MotiView>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 500 }}
        >
          <NeonButton onPress={handleConnect}>
            Connect via TradeLocker
          </NeonButton>
        </MotiView>
        
        <View style={styles.poweredBy}>
          <NeonText variant="caption" color="muted">
            Powered by TradeLocker API
          </NeonText>
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
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  backButton: {
    paddingVertical: spacing[2],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
  },
  iconContainer: {
    marginBottom: spacing[4],
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  iconEmoji: {
    fontSize: 48,
  },
  subtitle: {
    marginTop: spacing[2],
    marginBottom: spacing[6],
    maxWidth: 280,
  },
  benefitsContainer: {
    width: '100%',
    maxWidth: 320,
    gap: spacing[3],
  },
  benefitCard: {},
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    gap: 2,
  },
  actions: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
  poweredBy: {
    alignItems: 'center',
    marginTop: spacing[3],
  },
});

