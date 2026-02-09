import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { SystemStateLayout } from '@/components/system';
import { NeonText, CardCompact, Icon, type IconName } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import { moderateScale } from '@/lib/utils/responsive';

export default function NoBrokerConnectedScreen() {
  const router = useRouter();

  const handleConnectBroker = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(broker)/connect-start');
  };

  const handleLearnMore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to broker info screen
    router.push('/(tabs)/account/brokers');
  };

  return (
    <SystemStateLayout
      type="no-broker"
      icon="⬡"
      title="Connect a Broker"
      subtitle="Link your TradeLocker account to start automated trading with Trading Platform."
      primaryAction={{
        label: 'Connect Broker',
        onPress: handleConnectBroker,
      }}
      secondaryAction={{
        label: 'Learn More',
        onPress: handleLearnMore,
        variant: 'ghost',
      }}
      showBackButton
    >
      {/* Broker feature highlights */}
      <View style={styles.features}>
        <FeatureRow icon="zap" text="Instant trade execution" delay={500} />
        <FeatureRow icon="lock" text="Bank-grade security" delay={600} />
        <FeatureRow icon="ai" text="AI-powered decisions" delay={700} />
      </View>
    </SystemStateLayout>
  );
}

function FeatureRow({ icon, text, delay }: { icon: IconName; text: string; delay: number }) {
  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 400, delay }}
    >
      <CardCompact style={styles.featureRow}>
        <View style={styles.featureContent}>
          <View style={styles.featureIcon}>
            <Icon name={icon} size={18} color="primary" />
          </View>
          <NeonText variant="body" color="muted">{text}</NeonText>
        </View>
      </CardCompact>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  features: {
    gap: spacing[3],
  },
  featureRow: {
    width: '100%',
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  featureIcon: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: colors.primary[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
});

