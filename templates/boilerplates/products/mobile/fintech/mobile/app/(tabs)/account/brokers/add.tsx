import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

export default function BrokersAddScreen() {
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to the broker connection flow
    router.push('/(broker)/connect-start');
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
          <NeonText variant="h2" color="white">Add Broker Account</NeonText>
        </MotiView>

        {/* Icon Section */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.iconSection}
        >
          <View style={styles.iconContainer}>
            <NeonText variant="display" style={styles.iconEmoji}>🔗</NeonText>
            <View style={styles.iconGlow} />
          </View>
        </MotiView>

        {/* Info Card */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 150, duration: 400 }}
        >
          <Card variant="default" padding="lg" style={styles.infoCard}>
            <NeonText variant="h4" color="white" style={styles.infoTitle}>
              Connect via TradeLocker
            </NeonText>
            <NeonText variant="body" color="muted" style={styles.infoText}>
              Add another trading account by connecting through TradeLocker. This allows Trading Platform to execute trades on your behalf.
            </NeonText>

            {/* Benefits List */}
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <NeonText variant="body" color="primary">✓</NeonText>
                <NeonText variant="body" color="muted">Secure OAuth connection</NeonText>
              </View>
              <View style={styles.benefitItem}>
                <NeonText variant="body" color="primary">✓</NeonText>
                <NeonText variant="body" color="muted">AI-powered trading enabled</NeonText>
              </View>
              <View style={styles.benefitItem}>
                <NeonText variant="body" color="primary">✓</NeonText>
                <NeonText variant="body" color="muted">Multiple accounts supported</NeonText>
              </View>
            </View>
          </Card>
        </MotiView>

        {/* Supported Brokers */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.supportedSection}
        >
          <NeonText variant="label" color="muted" style={styles.supportedTitle}>
            Supported Brokers
          </NeonText>
          <View style={styles.brokerIcons}>
            {['📊', '🌶️', '📈', '🏆', '🚀'].map((icon, index) => (
              <View key={index} style={styles.brokerIconCircle}>
                <NeonText variant="body">{icon}</NeonText>
              </View>
            ))}
          </View>
          <NeonText variant="caption" color="muted" style={styles.supportedText}>
            IC Markets, Pepperstone, OANDA, FTMO, FundedNext & more
          </NeonText>
        </MotiView>

        {/* Continue Button */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 250, duration: 400 }}
          style={styles.buttonSection}
        >
          <NeonButton onPress={handleContinue}>
            Continue to TradeLocker
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
  },
  header: {
    paddingVertical: spacing[2],
    gap: spacing[2],
  },
  backButton: {
    paddingVertical: spacing[2],
    alignSelf: 'flex-start',
  },
  iconSection: {
    alignItems: 'center',
    marginTop: spacing[6],
    marginBottom: spacing[6],
  },
  iconContainer: {
    position: 'relative',
  },
  iconEmoji: {
    fontSize: 72,
    zIndex: 1,
  },
  iconGlow: {
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
  infoCard: {
    marginBottom: spacing[4],
  },
  infoTitle: {
    marginBottom: spacing[2],
  },
  infoText: {
    marginBottom: spacing[4],
    lineHeight: 22,
  },
  benefitsList: {
    gap: spacing[2],
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  supportedSection: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  supportedTitle: {
    marginBottom: spacing[3],
  },
  brokerIcons: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  brokerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportedText: {
    textAlign: 'center',
  },
  buttonSection: {
    marginTop: spacing[2],
  },
});

