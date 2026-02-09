import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import Slider from '@react-native-community/slider';
import { Screen, NeonText, NeonButton } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';

export default function RiskCustomizeScreen() {
  const router = useRouter();
  const [riskPercent, setRiskPercent] = useState(50);

  const handleSliderChange = (value: number) => {
    const roundedValue = Math.round(value);
    if (roundedValue !== riskPercent) {
      Haptics.selectionAsync();
      setRiskPercent(roundedValue);
    }
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/(risk)/activate',
      params: { risk: 'custom', riskPercent: riskPercent.toString() },
    });
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const getRiskLabel = (percent: number): string => {
    if (percent <= 30) return 'Conservative';
    if (percent <= 50) return 'Moderate';
    if (percent <= 70) return 'Growth';
    return 'Aggressive';
  };

  const getRiskColor = (percent: number): string => {
    if (percent <= 30) return colors.primary.DEFAULT;
    if (percent <= 50) return colors.primary.DEFAULT;
    if (percent <= 70) return '#FFA500'; // Orange
    return colors.error;
  };

  return (
    <Screen safeArea padded style={styles.container}>
      {/* Back button */}
      <Pressable onPress={handleBack} style={styles.backButton}>
        <NeonText variant="body" color="primary">
          ← Back
        </NeonText>
      </Pressable>

      <View style={styles.content}>
        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 100 }}
        >
          <NeonText variant="h2" style={styles.title}>
            Custom Risk
          </NeonText>
        </MotiView>

        {/* Risk percentage display */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 200 }}
          style={styles.percentContainer}
        >
          <NeonText variant="label" color="muted">
            Risk Level
          </NeonText>
          <NeonText 
            variant="display" 
            color="primary" 
            glow 
            style={[styles.percentText, { color: getRiskColor(riskPercent) }]}
          >
            {riskPercent}%
          </NeonText>
          <NeonText variant="h4" color="muted">
            {getRiskLabel(riskPercent)}
          </NeonText>
        </MotiView>

        {/* Slider */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300 }}
          style={styles.sliderContainer}
        >
          <View style={styles.sliderLabels}>
            <NeonText variant="label" color="muted">1%</NeonText>
            <NeonText variant="label" color="muted">100%</NeonText>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={100}
            step={1}
            value={riskPercent}
            onValueChange={handleSliderChange}
            minimumTrackTintColor={colors.primary.DEFAULT}
            maximumTrackTintColor={colors.neutral[300]}
            thumbTintColor={colors.primary.DEFAULT}
          />
        </MotiView>

        {/* Tooltip */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 400 }}
          style={styles.tooltipContainer}
        >
          <View style={styles.tooltip}>
            <NeonText variant="label" color="muted" style={styles.tooltipText}>
              💡 Higher risk = more volatility. The AI will take larger positions 
              and accept wider drawdowns for potentially higher returns.
            </NeonText>
          </View>
        </MotiView>

        {/* Risk breakdown */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 500 }}
          style={styles.breakdownContainer}
        >
          <View style={styles.breakdownRow}>
            <NeonText variant="body" color="muted">Max Position Size:</NeonText>
            <NeonText variant="body" color="white">
              {Math.round(riskPercent * 0.1)}% of portfolio
            </NeonText>
          </View>
          <View style={styles.breakdownRow}>
            <NeonText variant="body" color="muted">Max Drawdown:</NeonText>
            <NeonText variant="body" color="white">
              {Math.round(riskPercent * 0.3)}%
            </NeonText>
          </View>
          <View style={styles.breakdownRow}>
            <NeonText variant="body" color="muted">Trade Frequency:</NeonText>
            <NeonText variant="body" color="white">
              {riskPercent <= 30 ? 'Low' : riskPercent <= 60 ? 'Medium' : 'High'}
            </NeonText>
          </View>
        </MotiView>
      </View>

      {/* CTA */}
      <View style={styles.actions}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 600 }}
          style={styles.buttonContainer}
        >
          <NeonButton onPress={handleSave}>
            Save & Continue
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
  backButton: {
    paddingVertical: spacing[2],
    marginBottom: spacing[4],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  percentContainer: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  percentText: {
    fontSize: 72,
    fontWeight: 'bold',
    marginVertical: spacing[2],
  },
  sliderContainer: {
    width: '100%',
    maxWidth: 320,
    marginBottom: spacing[6],
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  slider: {
    width: '100%',
    height: 40,
  },
  tooltipContainer: {
    width: '100%',
    maxWidth: 320,
    marginBottom: spacing[6],
  },
  tooltip: {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  tooltipText: {
    lineHeight: 20,
    textAlign: 'center',
  },
  breakdownContainer: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
  },
  actions: {
    paddingBottom: spacing[6],
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
});

