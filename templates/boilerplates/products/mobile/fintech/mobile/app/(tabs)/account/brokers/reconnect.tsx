import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

export default function BrokersReconnectScreen() {
  const router = useRouter();
  const { brokerId, brokerName } = useLocalSearchParams<{ brokerId: string; brokerName: string }>();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleReconnect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Route to the TradeLocker OAuth flow for re-authentication
    // This reuses the existing broker connection flow
    router.push({
      pathname: '/(broker)/connect-start',
      params: { 
        isReconnect: 'true',
        brokerId: brokerId || '',
        returnTo: '/(tabs)/account/brokers',
      },
    });
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
          <NeonText variant="h2" color="white">Reconnection Needed</NeonText>
        </MotiView>

        {/* Warning Icon */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.iconSection}
        >
          <View style={styles.iconContainer}>
            <NeonText variant="display" style={styles.iconEmoji}>⚠️</NeonText>
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
              Session Expired
            </NeonText>
            <NeonText variant="body" color="muted" style={styles.infoText}>
              Your TradeLocker session for{' '}
              <NeonText variant="body" color="white">{brokerName || 'this account'}</NeonText>{' '}
              has expired. Please log in again to continue automated trading.
            </NeonText>

            {/* What Happens */}
            <View style={styles.impactList}>
              <NeonText variant="label" color="muted" style={styles.impactTitle}>
                Until reconnected:
              </NeonText>
              <View style={styles.impactItem}>
                <NeonText variant="body" color="warning">⏸</NeonText>
                <NeonText variant="body" color="muted">AI trading is paused</NeonText>
              </View>
              <View style={styles.impactItem}>
                <NeonText variant="body" color="warning">📊</NeonText>
                <NeonText variant="body" color="muted">No new positions will open</NeonText>
              </View>
              <View style={styles.impactItem}>
                <NeonText variant="body" color="primary">✓</NeonText>
                <NeonText variant="body" color="muted">Existing positions are safe</NeonText>
              </View>
            </View>
          </Card>
        </MotiView>

        {/* Reconnect Button */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.buttonSection}
        >
          <NeonButton onPress={handleReconnect}>
            Reconnect Now
          </NeonButton>
        </MotiView>

        {/* Skip Note */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 300, duration: 400 }}
          style={styles.noteSection}
        >
          <Pressable onPress={handleBack}>
            <NeonText variant="body" color="muted" style={styles.skipText}>
              I'll do this later
            </NeonText>
          </Pressable>
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
    backgroundColor: 'rgba(255, 220, 0, 0.2)',
    opacity: 0.5,
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
  impactList: {
    gap: spacing[2],
  },
  impactTitle: {
    marginBottom: spacing[1],
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  buttonSection: {
    marginTop: spacing[4],
  },
  loadingContainer: {
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[4],
  },
  loadingText: {
    textAlign: 'center',
  },
  noteSection: {
    marginTop: spacing[6],
    alignItems: 'center',
  },
  skipText: {
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

