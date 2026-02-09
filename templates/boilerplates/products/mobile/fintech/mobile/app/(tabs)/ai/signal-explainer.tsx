import React from 'react';
import { View, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, Card } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';

interface SignalInfo {
  name: string;
  icon: string;
  color: string;
  description: string;
  scale: { label: string; color: string }[];
}

const SIGNALS: SignalInfo[] = [
  {
    name: 'Momentum',
    icon: '🚀',
    color: colors.primary.DEFAULT,
    description: 'Measures how fast and decisively prices are moving in a direction. Strong momentum suggests clear market conviction.',
    scale: [
      { label: 'Weak', color: colors.error },
      { label: 'Moderate', color: colors.warning },
      { label: 'Strong', color: colors.primary.DEFAULT },
    ],
  },
  {
    name: 'Volatility',
    icon: '📊',
    color: colors.warning,
    description: 'Shows how much price fluctuation is occurring. Lower volatility means more predictable, safer trading conditions.',
    scale: [
      { label: 'High', color: colors.error },
      { label: 'Moderate', color: colors.warning },
      { label: 'Low', color: colors.primary.DEFAULT },
    ],
  },
  {
    name: 'Liquidity',
    icon: '💧',
    color: colors.info,
    description: 'Indicates how easily trades can be executed. Higher liquidity means better fills and less slippage.',
    scale: [
      { label: 'Low', color: colors.error },
      { label: 'Moderate', color: colors.warning },
      { label: 'High', color: colors.primary.DEFAULT },
    ],
  },
  {
    name: 'Trend',
    icon: '📈',
    color: colors.primary.DEFAULT,
    description: 'The overall direction of the market. Trading with the trend generally leads to better outcomes.',
    scale: [
      { label: 'Bearish', color: colors.error },
      { label: 'Sideways', color: colors.warning },
      { label: 'Bullish', color: colors.primary.DEFAULT },
    ],
  },
];

function SignalCard({ signal, index }: { signal: SignalInfo; index: number }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 30 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', delay: 200 + index * 100 }}
    >
      <Card variant="default" padding="lg" style={styles.signalCard}>
        {/* Header */}
        <View style={styles.signalHeader}>
          <View style={[styles.signalIcon, { backgroundColor: `${signal.color}15` }]}>
            <NeonText style={styles.signalEmoji}>{signal.icon}</NeonText>
          </View>
          <NeonText variant="h3" color="white">{signal.name}</NeonText>
        </View>
        
        {/* Description */}
        <NeonText variant="body" color="muted" style={styles.signalDescription}>
          {signal.description}
        </NeonText>
        
        {/* Scale */}
        <View style={styles.scaleContainer}>
          <NeonText variant="caption" color="muted" style={styles.scaleLabel}>READING SCALE</NeonText>
          <View style={styles.scaleItems}>
            {signal.scale.map((item, i) => (
              <View key={item.label} style={styles.scaleItem}>
                <View style={[styles.scaleDot, { backgroundColor: item.color }]} />
                <NeonText variant="caption" style={{ color: item.color }}>{item.label}</NeonText>
              </View>
            ))}
          </View>
        </View>
      </Card>
    </MotiView>
  );
}

export default function SignalExplainerScreen() {
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleMasterclass = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Would navigate to masterclass
    console.log('Navigate to masterclass');
  };

  return (
    <Screen safeArea style={styles.container}>
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', delay: 50 }}
      >
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <NeonText variant="body" color="muted">‹ Back</NeonText>
          </Pressable>
          <NeonText variant="h4" color="white">Signal Guide</NeonText>
          <View style={styles.headerSpacer} />
        </View>
      </MotiView>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 100 }}
          style={styles.intro}
        >
          <View style={styles.introIcon}>
            <NeonText style={styles.introEmoji}>💡</NeonText>
          </View>
          <NeonText variant="body" color="muted" align="center" style={styles.introText}>
            Understanding market signals helps you make informed decisions about your AI trading settings.
          </NeonText>
        </MotiView>

        {/* Signal Cards */}
        {SIGNALS.map((signal, index) => (
          <SignalCard key={signal.name} signal={signal} index={index} />
        ))}

        {/* Masterclass CTA */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 700 }}
        >
          <Pressable onPress={handleMasterclass}>
            <View style={styles.masterclassCard}>
              <View style={styles.masterclassGlow} />
              <View style={styles.masterclassContent}>
                <View style={styles.masterclassIcon}>
                  <NeonText style={styles.masterclassEmoji}>🎓</NeonText>
                </View>
                <View style={styles.masterclassText}>
                  <NeonText variant="h4" color="white">Trading Masterclass</NeonText>
                  <NeonText variant="caption" color="muted">
                    Deep dive into market analysis
                  </NeonText>
                </View>
                <NeonText variant="h3" color="primary">›</NeonText>
              </View>
            </View>
          </Pressable>
        </MotiView>

        {/* Pro Tip */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 800 }}
          style={styles.proTip}
        >
          <View style={styles.proTipBadge}>
            <NeonText variant="caption" color="primary">PRO TIP</NeonText>
          </View>
          <NeonText variant="caption" color="muted" align="center">
            The AI combines all signals to make trading decisions. You don't need to monitor them manually.
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  backButton: {
    paddingVertical: spacing[2],
    width: 60,
  },
  headerSpacer: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[8],
  },
  
  // Intro
  intro: {
    alignItems: 'center',
    marginBottom: spacing[5],
    paddingHorizontal: spacing[4],
  },
  introIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[900],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.primary[800],
  },
  introEmoji: {
    fontSize: 28,
  },
  introText: {
    lineHeight: 22,
    maxWidth: 300,
  },
  
  // Signal Cards
  signalCard: {
    marginBottom: spacing[4],
  },
  signalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  signalIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signalEmoji: {
    fontSize: 26,
  },
  signalDescription: {
    lineHeight: 22,
    marginBottom: spacing[4],
  },
  scaleContainer: {
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  scaleLabel: {
    marginBottom: spacing[2],
  },
  scaleItems: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  scaleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  scaleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  // Masterclass
  masterclassCard: {
    position: 'relative',
    backgroundColor: colors.primary[900],
    borderRadius: 16,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.primary[800],
    marginBottom: spacing[4],
    overflow: 'hidden',
  },
  masterclassGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primary.DEFAULT,
    opacity: 0.1,
    ...(Platform.OS === 'web' ? {
      filter: 'blur(40px)',
    } : {}),
  },
  masterclassContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  masterclassIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary[800],
  },
  masterclassEmoji: {
    fontSize: 26,
  },
  masterclassText: {
    flex: 1,
    gap: 2,
  },
  
  // Pro Tip
  proTip: {
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  proTipBadge: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.primary[900],
    borderRadius: 12,
    marginBottom: spacing[2],
  },
});

