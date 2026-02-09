import React from 'react';
import { View, StyleSheet, Pressable, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import { verticalScale, moderateScale } from '@/lib/utils/responsive';

export default function BiometricScreen() {
  const router = useRouter();

  const handleEnable = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Enable biometric login',
          fallbackLabel: 'Use passcode',
        });
        
        if (result.success) {
          console.log('Biometric authentication enabled');
        }
      }
    } catch (error) {
      console.log('Biometric error:', error);
    }
    
    // Always proceed for demo
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(auth)/signup');
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(auth)/signup');
  };

  const biometricType = Platform.OS === 'ios' ? 'Face ID' : 'Biometric';

  return (
    <Screen safeArea padded={false} style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
      <View style={styles.content}>
        {/* Icon */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.iconContainer}
        >
          <View style={styles.iconCircle}>
            <NeonText variant="display" style={styles.iconEmoji}>
              {Platform.OS === 'ios' ? '👤' : '🔐'}
            </NeonText>
          </View>
        </MotiView>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200 }}
        >
          <NeonText variant="h2" color="white" align="center">
            Secure Access
          </NeonText>
        </MotiView>

        {/* Description */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300 }}
        >
          <NeonText variant="body" color="muted" align="center" style={styles.description}>
            Use {biometricType} to quickly and securely access your portfolio.
          </NeonText>
        </MotiView>

        {/* Benefits Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400 }}
        >
          <Card variant="highlight" padding="md" style={styles.benefitsCard}>
            <View style={styles.benefitRow}>
              <NeonText variant="body" color="primary">✓</NeonText>
              <NeonText variant="body" color="white">Instant login</NeonText>
            </View>
            <View style={styles.benefitRow}>
              <NeonText variant="body" color="primary">✓</NeonText>
              <NeonText variant="body" color="white">Bank-grade security</NeonText>
            </View>
            <View style={styles.benefitRow}>
              <NeonText variant="body" color="primary">✓</NeonText>
              <NeonText variant="body" color="white">Protect your portfolio</NeonText>
            </View>
          </Card>
        </MotiView>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 500 }}
        >
          <NeonButton onPress={handleEnable}>
            Enable {biometricType}
          </NeonButton>
        </MotiView>
        
        <Pressable onPress={handleSkip} style={styles.skipLink}>
          <NeonText variant="body" color="muted">Maybe later</NeonText>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  iconContainer: {
    marginBottom: spacing[4],
  },
  iconCircle: {
    width: moderateScale(90),
    height: moderateScale(90),
    borderRadius: moderateScale(45),
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  iconEmoji: {
    fontSize: moderateScale(42),
  },
  description: {
    marginTop: spacing[2],
    marginBottom: spacing[6],
    maxWidth: 300,
    lineHeight: 24,
  },
  benefitsCard: {
    width: '100%',
    maxWidth: 280,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
  },
  actions: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
  skipLink: {
    alignItems: 'center',
    paddingVertical: spacing[3],
    marginTop: spacing[2],
  },
});

