import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';

export default function BotSettingsScreen() {
  const router = useRouter();
  const [isActive, setIsActive] = useState(true);
  const [riskLevel, setRiskLevel] = useState('BALANCED');

  const handleToggleActive = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(value);
  };

  const handleChangeRisk = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(risk)/select');
  };

  const handleViewDetails = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to AI details when implemented
    console.log('View AI details');
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <Screen safeArea padded style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <NeonText variant="body" color="primary">
            ← Back
          </NeonText>
        </Pressable>
        <NeonText variant="h3" style={styles.headerTitle}>
          AI Bot Settings
        </NeonText>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Status card */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 100 }}
          style={styles.statusCard}
        >
          <View style={styles.statusHeader}>
            <View style={styles.statusInfo}>
              <NeonText variant="label" color="muted">
                Status
              </NeonText>
              <View style={styles.statusBadge}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: isActive ? colors.primary.DEFAULT : colors.neutral[400] }
                ]} />
                <NeonText 
                  variant="h4" 
                  color={isActive ? 'primary' : 'muted'}
                  glow={isActive}
                >
                  {isActive ? 'ACTIVE' : 'PAUSED'}
                </NeonText>
              </View>
            </View>
            <Switch
              value={isActive}
              onValueChange={handleToggleActive}
              trackColor={{ 
                false: colors.neutral[300], 
                true: colors.primary.DEFAULT,
              }}
              thumbColor={colors.neutral[0]}
              ios_backgroundColor={colors.neutral[300]}
            />
          </View>
        </MotiView>

        {/* Risk level card */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200 }}
          style={styles.card}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardInfo}>
              <NeonText variant="label" color="muted">
                Risk Level
              </NeonText>
              <NeonText variant="h4" color="primary" glow>
                {riskLevel}
              </NeonText>
            </View>
            <Pressable onPress={handleChangeRisk} style={styles.changeButton}>
              <NeonText variant="body" color="primary">
                Change
              </NeonText>
            </Pressable>
          </View>
        </MotiView>

        {/* Environment status */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300 }}
          style={styles.infoCard}
        >
          <NeonText variant="h4" style={styles.infoTitle}>
            Market Conditions
          </NeonText>
          
          <View style={styles.infoRow}>
            <NeonText variant="body" color="muted">
              Environment
            </NeonText>
            <View style={styles.environmentBadge}>
              <NeonText variant="body" color="primary">
                STABLE
              </NeonText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <NeonText variant="body" color="muted">
              AI Confidence
            </NeonText>
            <View style={styles.confidenceContainer}>
              <View style={styles.confidenceBars}>
                {[1, 2, 3, 4, 5].map((bar, index) => (
                  <View
                    key={bar}
                    style={[
                      styles.confidenceBar,
                      index < 4 && styles.confidenceBarActive,
                    ]}
                  />
                ))}
              </View>
              <NeonText variant="body" color="primary">
                HIGH
              </NeonText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <NeonText variant="body" color="muted">
              Last Trade
            </NeonText>
            <NeonText variant="body" color="white">
              2 hours ago
            </NeonText>
          </View>

          <View style={styles.infoRow}>
            <NeonText variant="body" color="muted">
              Today's P&L
            </NeonText>
            <NeonText variant="body" color="primary">
              +$42.50
            </NeonText>
          </View>
        </MotiView>

        {/* Active pairs */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400 }}
          style={styles.pairsCard}
        >
          <NeonText variant="h4" style={styles.pairsTitle}>
            Active Trading Pairs
          </NeonText>
          <View style={styles.pairsList}>
            {['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD'].map((pair, index) => (
              <View key={pair} style={styles.pairBadge}>
                <NeonText variant="label" color="white">
                  {pair}
                </NeonText>
              </View>
            ))}
          </View>
        </MotiView>
      </View>

      {/* CTA */}
      <View style={styles.actions}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 500 }}
          style={styles.buttonContainer}
        >
          <NeonButton onPress={handleViewDetails}>
            View AI Details
          </NeonButton>
        </MotiView>
      </View>
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
    marginBottom: spacing[6],
  },
  backButton: {
    paddingVertical: spacing[2],
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[2],
  },
  statusCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: spacing[4],
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.DEFAULT,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      web: {
        boxShadow: `0 0 15px ${colors.glow}`,
      },
      android: {},
    }),
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusInfo: {
    gap: spacing[1],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  card: {
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: spacing[4],
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardInfo: {
    gap: spacing[1],
  },
  changeButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT,
  },
  infoCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: spacing[4],
  },
  infoTitle: {
    marginBottom: spacing[4],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  environmentBadge: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary[700],
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  confidenceBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  confidenceBar: {
    width: 4,
    height: 16,
    backgroundColor: colors.neutral[300],
    borderRadius: 2,
  },
  confidenceBarActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  pairsCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  pairsTitle: {
    marginBottom: spacing[3],
  },
  pairsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  pairBadge: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  actions: {
    paddingBottom: spacing[6],
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
});

