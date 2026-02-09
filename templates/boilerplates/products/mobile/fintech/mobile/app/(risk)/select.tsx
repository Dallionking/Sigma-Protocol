import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card, Icon, type IconName } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import { verticalScale } from '@/lib/utils/responsive';

type RiskLevel = 'safe' | 'balanced' | 'aggressive';

interface RiskOption {
  id: RiskLevel;
  label: string;
  description: string;
  icon: IconName;
  color: string;
  recommended?: boolean;
}

const RISK_OPTIONS: RiskOption[] = [
  {
    id: 'safe',
    label: 'Safe',
    description: 'Steady, conservative growth',
    icon: 'shield',
    color: colors.primary.DEFAULT,
  },
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Recommended for most',
    icon: 'scale',
    color: colors.primary.DEFAULT,
    recommended: true,
  },
  {
    id: 'aggressive',
    label: 'Aggressive',
    description: 'Maximum growth potential',
    icon: 'rocket',
    color: colors.accent.DEFAULT,
  },
];

export default function RiskSelectScreen() {
  const router = useRouter();
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel>('balanced');

  const handleSelectRisk = (riskId: RiskLevel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRisk(riskId);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/(risk)/activate',
      params: { risk: selectedRisk },
    });
  };

  const handleCustomize = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(risk)/customize');
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
        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.titleSection}
        >
          <NeonText variant="h2" color="white" align="center">
            Choose Risk Level
          </NeonText>
          <NeonText variant="body" color="muted" align="center" style={styles.subtitle}>
            You can change this anytime
          </NeonText>
        </MotiView>

        {/* Risk Options - BAGS style cards */}
        <View style={styles.optionsContainer}>
          {RISK_OPTIONS.map((option, index) => (
            <MotiView
              key={option.id}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', delay: 100 + index * 100, duration: 400 }}
            >
              <Pressable onPress={() => handleSelectRisk(option.id)}>
                <Card
                  variant="glassmorphism"
                  padding="md"
                  showBorderBeam={selectedRisk === option.id}
                  style={styles.optionCard}
                >
                  <View style={styles.optionContent}>
                    <View style={[
                      styles.iconCircle,
                      selectedRisk === option.id && { borderColor: colors.primary.DEFAULT }
                    ]}>
                      <Icon name={option.icon} size={24} color={selectedRisk === option.id ? 'primary' : 'white'} />
                    </View>
                    
                    <View style={styles.optionText}>
                      <View style={styles.optionHeader}>
                        <NeonText 
                          variant="h4" 
                          color={selectedRisk === option.id ? 'primary' : 'white'}
                        >
                          {option.label}
                        </NeonText>
                        {option.recommended && (
                          <View style={styles.recommendedBadge}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <Icon name="star" size={12} color="primary" />
                              <NeonText variant="label" color="primary" style={styles.recommendedText}>
                                BEST
                              </NeonText>
                            </View>
                          </View>
                        )}
                      </View>
                      <NeonText variant="caption" color="muted">
                        {option.description}
                      </NeonText>
                    </View>
                    
                    <View style={[
                      styles.radio,
                      selectedRisk === option.id && styles.radioSelected
                    ]}>
                      {selectedRisk === option.id && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                  </View>
                </Card>
              </Pressable>
            </MotiView>
          ))}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400 }}
        >
          <NeonButton onPress={handleContinue}>
            Continue
          </NeonButton>
        </MotiView>
        
        <Pressable onPress={handleCustomize} style={styles.customizeLink}>
          <NeonText variant="body" color="muted">
            Advanced: Custom %
          </NeonText>
        </Pressable>
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
    paddingHorizontal: spacing[4],
  },
  titleSection: {
    marginBottom: spacing[6],
    paddingTop: spacing[4],
  },
  subtitle: {
    marginTop: spacing[2],
  },
  optionsContainer: {
    gap: spacing[3],
  },
  optionCard: {
    marginBottom: 0,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  recommendedBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: colors.primary[900],
    borderRadius: 4,
  },
  recommendedText: {
    fontSize: 10,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.neutral[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary.DEFAULT,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary.DEFAULT,
  },
  actions: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
  customizeLink: {
    alignItems: 'center',
    paddingVertical: spacing[3],
    marginTop: spacing[2],
  },
});

