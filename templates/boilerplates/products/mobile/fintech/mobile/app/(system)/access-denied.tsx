import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { SystemStateLayout } from '@/components/system';
import { NeonText, Badge, Card, Icon, type IconName } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';

const PRO_FEATURES: Array<{ icon: IconName; text: string }> = [
  { icon: 'target', text: 'Unlimited AI signals' },
  { icon: 'barChart', text: 'Advanced analytics' },
  { icon: 'zap', text: 'Priority execution' },
  { icon: 'shield', text: 'Extended guarantee' },
];

export default function AccessDeniedScreen() {
  const router = useRouter();

  const handleComparePlans = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/account/subscription/compare');
  };

  const handleMaybeLater = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <SystemStateLayout
      type="access-denied"
      icon="★"
      title="Upgrade Required"
      subtitle="This feature is part of Pro — unlock the full trading experience."
      primaryAction={{
        label: 'Compare Plans',
        onPress: handleComparePlans,
      }}
      secondaryAction={{
        label: 'Maybe Later',
        onPress: handleMaybeLater,
        variant: 'ghost',
      }}
      showBackButton
    >
      {/* Pro features preview */}
      <Card variant="glassmorphism" padding="lg" showBorderBeam>
        <View style={styles.featuresHeader}>
          <Badge variant="success" size="sm">Pro</Badge>
          <NeonText variant="label" color="primary">PREMIUM</NeonText>
        </View>

        <View style={styles.featuresList}>
          {PRO_FEATURES.map((feature, index) => (
            <MotiView
              key={feature.text}
              from={{ opacity: 0, translateX: -10 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', duration: 300, delay: 500 + index * 100 }}
            >
              <View style={styles.featureItem}>
                <Icon name={feature.icon} size={18} color="primary" />
                <NeonText variant="body" color="white">{feature.text}</NeonText>
              </View>
            </MotiView>
          ))}
        </View>

        {/* Promo tag */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 900 }}
        >
          <Pressable onPress={handleComparePlans} style={styles.promoTag}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="sparkles" size={14} color="primary" />
              <NeonText variant="caption" color="primary">
                7-day free trial available
              </NeonText>
            </View>
          </Pressable>
        </MotiView>
      </Card>
    </SystemStateLayout>
  );
}

const styles = StyleSheet.create({
  featuresHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  featuresList: {
    gap: spacing[3],
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  promoTag: {
    marginTop: spacing[4],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.primary[900],
    borderRadius: 8,
    alignSelf: 'center',
  },
});

