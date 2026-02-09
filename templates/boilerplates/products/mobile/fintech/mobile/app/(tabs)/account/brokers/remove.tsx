import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card, NeonLoader } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';
import { useDisconnectAccount } from '@/lib/hooks/use-brokers';

export default function BrokersRemoveScreen() {
  const router = useRouter();
  const { brokerId, brokerName } = useLocalSearchParams<{ brokerId: string; brokerName: string }>();
  const { mutate: disconnectAccount, isPending: isRemoving } = useDisconnectAccount();

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleDisconnect = async () => {
    if (!brokerId) {
      Alert.alert('Error', 'No broker ID provided');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    disconnectAccount(brokerId, {
      onSuccess: () => {
        // Navigate back to brokers list
        router.back();
      },
      onError: (error: any) => {
        Alert.alert(
          'Disconnect Failed',
          error.message || 'Failed to disconnect broker account. Please try again.',
          [{ text: 'OK' }]
        );
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
          <Pressable onPress={handleCancel} style={styles.backButton}>
            <NeonText variant="body" color="muted">‹ Back</NeonText>
          </Pressable>
          <NeonText variant="h2" color="white">Disconnect Broker?</NeonText>
        </MotiView>

        {/* Warning Icon */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.iconSection}
        >
          <View style={styles.iconContainer}>
            <NeonText variant="display" style={styles.iconEmoji}>🔌</NeonText>
            <View style={styles.iconGlow} />
          </View>
        </MotiView>

        {/* Broker Name */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 120, duration: 300 }}
          style={styles.brokerNameSection}
        >
          <NeonText variant="h4" color="white" style={styles.brokerName}>
            {brokerName || 'This Account'}
          </NeonText>
        </MotiView>

        {/* Impact Card */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 150, duration: 400 }}
        >
          <Card variant="default" padding="lg" style={styles.impactCard}>
            <NeonText variant="label" color="muted" style={styles.impactTitle}>
              This will:
            </NeonText>
            
            <View style={styles.impactList}>
              <View style={styles.impactItem}>
                <NeonText variant="body" color="danger">✕</NeonText>
                <NeonText variant="body" color="muted">
                  Stop AI trading on this account
                </NeonText>
              </View>
              <View style={styles.impactItem}>
                <NeonText variant="body" color="danger">✕</NeonText>
                <NeonText variant="body" color="muted">
                  Remove stored credentials
                </NeonText>
              </View>
              <View style={styles.impactItem}>
                <NeonText variant="body" color="primary">✓</NeonText>
                <NeonText variant="body" color="muted">
                  Keep your broker account intact
                </NeonText>
              </View>
            </View>

            <View style={styles.warningBox}>
              <NeonText variant="caption" color="warning" style={styles.warningText}>
                Any open positions will remain open. You'll need to manage them manually through your broker.
              </NeonText>
            </View>
          </Card>
        </MotiView>

        {/* Action Buttons */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.buttonSection}
        >
          {isRemoving ? (
            <View style={styles.loadingContainer}>
              <NeonLoader size="medium" />
              <NeonText variant="body" color="muted" style={styles.loadingText}>
                Disconnecting...
              </NeonText>
            </View>
          ) : (
            <View style={styles.buttonRow}>
              <NeonButton 
                variant="danger" 
                onPress={handleDisconnect}
                style={styles.disconnectButton}
              >
                Disconnect
              </NeonButton>
              <NeonButton 
                variant="secondary" 
                onPress={handleCancel}
                style={styles.cancelButton}
              >
                Cancel
              </NeonButton>
            </View>
          )}
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
    marginBottom: spacing[3],
  },
  iconContainer: {
    position: 'relative',
  },
  iconEmoji: {
    fontSize: 64,
    zIndex: 1,
  },
  iconGlow: {
    position: 'absolute',
    top: -15,
    left: -15,
    right: -15,
    bottom: -15,
    borderRadius: 50,
    backgroundColor: colors.accent.muted,
    opacity: 0.5,
    zIndex: 0,
  },
  brokerNameSection: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  brokerName: {
    textAlign: 'center',
  },
  impactCard: {
    marginBottom: spacing[4],
  },
  impactTitle: {
    marginBottom: spacing[3],
  },
  impactList: {
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  warningBox: {
    backgroundColor: 'rgba(255, 220, 0, 0.1)',
    borderRadius: 8,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: 'rgba(255, 220, 0, 0.2)',
  },
  warningText: {
    textAlign: 'center',
    lineHeight: 18,
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
  buttonRow: {
    gap: spacing[3],
  },
  disconnectButton: {
    marginBottom: spacing[2],
  },
  cancelButton: {},
});

