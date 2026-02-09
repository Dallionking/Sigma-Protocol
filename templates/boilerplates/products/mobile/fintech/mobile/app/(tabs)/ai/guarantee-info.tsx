import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card, Badge } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';

export default function GuaranteeInfoScreen() {
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleClaimGuarantee = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/ai/guarantee-claim');
  };

  return (
    <Screen safeArea style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <NeonText variant="body" color="muted">‹ Back</NeonText>
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Hero Section */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 12, delay: 100 }}
          style={styles.heroSection}
        >
          {/* Animated Shield */}
          <View style={styles.shieldContainer}>
            <MotiView
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ type: 'timing', duration: 3000, loop: true }}
              style={styles.shieldGlow}
            />
            <View style={styles.shieldIcon}>
              <NeonText style={styles.shieldEmoji}>🛡️</NeonText>
            </View>
          </View>
          
          {/* 48 Hour Badge */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 200 }}
          >
            <View style={styles.hoursBadge}>
              <NeonText variant="display" color="primary" glow style={styles.hoursNumber}>48</NeonText>
              <NeonText variant="caption" color="muted">HOUR</NeonText>
            </View>
          </MotiView>
        </MotiView>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300 }}
        >
          <NeonText variant="h2" color="white" align="center">
            AI Guarantee
          </NeonText>
          <NeonText variant="body" color="muted" align="center" style={styles.subtitle}>
            If you don't see a return within 48 hours, your first month is on us.
          </NeonText>
        </MotiView>

        {/* Requirements */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400 }}
        >
          <Card variant="glassmorphism" padding="lg" style={styles.requirementsCard}>
            <View style={styles.requirementHeader}>
              <NeonText variant="caption" color="muted">REQUIREMENTS</NeonText>
            </View>
            
            <View style={styles.requirementsList}>
              <View style={styles.requirementRow}>
                <View style={styles.requirementCheck}>
                  <NeonText variant="body" color="primary">✓</NeonText>
                </View>
                <View style={styles.requirementText}>
                  <NeonText variant="body" color="white">Balance ≥ $500</NeonText>
                </View>
                <Badge variant="success" size="sm">MET</Badge>
              </View>
              
              <View style={styles.requirementDivider} />
              
              <View style={styles.requirementRow}>
                <View style={styles.requirementCheck}>
                  <NeonText variant="body" color="primary">✓</NeonText>
                </View>
                <View style={styles.requirementText}>
                  <NeonText variant="body" color="white">AI Bot Active</NeonText>
                </View>
                <Badge variant="success" size="sm">MET</Badge>
              </View>
              
              <View style={styles.requirementDivider} />
              
              <View style={styles.requirementRow}>
                <View style={styles.requirementCheck}>
                  <NeonText variant="body" color="primary">✓</NeonText>
                </View>
                <View style={styles.requirementText}>
                  <NeonText variant="body" color="white">48 Hours Elapsed</NeonText>
                </View>
                <Badge variant="success" size="sm">MET</Badge>
              </View>
            </View>
          </Card>
        </MotiView>

        {/* Fine Print */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 500 }}
          style={styles.finePrint}
        >
          <NeonText variant="caption" color="muted" align="center">
            One claim per account • Credit applied within 24h
          </NeonText>
        </MotiView>
      </View>

      {/* CTA */}
      <View style={styles.actions}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', delay: 600 }}
        >
          <NeonButton onPress={handleClaimGuarantee}>
            Claim Guarantee
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
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  backButton: {
    paddingVertical: spacing[2],
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[4],
    alignItems: 'center',
  },
  
  // Hero
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing[4],
    marginTop: spacing[4],
  },
  shieldContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  shieldGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primary[900],
    ...(Platform.OS === 'web' ? {
      filter: 'blur(30px)',
    } : {}),
  },
  shieldIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.card.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary[800],
  },
  shieldEmoji: {
    fontSize: 48,
  },
  hoursBadge: {
    alignItems: 'center',
    marginTop: spacing[2],
  },
  hoursNumber: {
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -2,
  },
  subtitle: {
    marginTop: spacing[2],
    marginBottom: spacing[5],
    maxWidth: 280,
    lineHeight: 22,
  },
  
  // Requirements
  requirementsCard: {
    width: '100%',
    maxWidth: 340,
  },
  requirementHeader: {
    marginBottom: spacing[3],
  },
  requirementsList: {},
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  requirementCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[900],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  requirementText: {
    flex: 1,
  },
  requirementDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
  },
  
  // Fine Print
  finePrint: {
    marginTop: spacing[4],
    maxWidth: 280,
  },
  
  // Actions
  actions: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
});

