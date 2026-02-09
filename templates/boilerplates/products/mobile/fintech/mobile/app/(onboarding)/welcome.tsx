import React from 'react';
import { View, StyleSheet, Pressable, Platform, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Icon } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import { verticalScale, moderateScale } from '@/lib/utils/responsive';
import { DEMO_MODE } from '@/lib/config';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(onboarding)/value-prop-1');
  };

  const handleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(auth)/signin');
  };

  const handleSkipDemo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(tabs)/home');
  };

  return (
    <Screen safeArea padded={false} style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
      <View style={styles.content}>
        {/* 3D App Logo */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.heroSection}
        >
          <Image 
            source={require('@/assets/icon.png')}
            style={styles.heroLogo}
            resizeMode="contain"
          />
        </MotiView>

        {/* Headlines - Cleaner BAGS style */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 200 }}
          style={styles.textContainer}
        >
          <NeonText variant="h1" color="primary" align="center" style={styles.title}>
            TRADING PLATFORM
          </NeonText>
          
          <NeonText variant="h3" color="white" align="center" style={styles.tagline}>
            Trade Smarter. Execute Faster.
          </NeonText>
          
          <NeonText variant="body" color="muted" align="center" style={styles.description}>
            Connect your broker.{'\n'}Let the AI trade for you.
          </NeonText>
        </MotiView>

        {/* Feature pills - BAGS style */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 400 }}
          style={styles.features}
        >
          <View style={styles.featurePill}>
            <View style={styles.featureContent}>
              <Icon name="ai" size={14} color="primary" />
              <NeonText variant="caption" color="primary">AI-Powered</NeonText>
            </View>
          </View>
          <View style={styles.featurePill}>
            <View style={styles.featureContent}>
              <Icon name="trendUp" size={14} color="primary" />
              <NeonText variant="caption" color="primary">24/7 Trading</NeonText>
            </View>
          </View>
          <View style={styles.featurePill}>
            <View style={styles.featureContent}>
              <Icon name="lock" size={14} color="primary" />
              <NeonText variant="caption" color="primary">Secure</NeonText>
            </View>
          </View>
        </MotiView>
      </View>

      {/* Actions */}
      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500, delay: 600 }}
        style={styles.actions}
      >
        <NeonButton onPress={handleStart} size="lg">
          Start Trading
        </NeonButton>

        <View style={styles.signInContainer}>
          <NeonText variant="body" color="muted">
            Already have an account?{' '}
          </NeonText>
          <Pressable onPress={handleSignIn}>
            <NeonText variant="body" color="primary">
              Sign In
            </NeonText>
          </Pressable>
        </View>

        {DEMO_MODE && (
          <Pressable onPress={handleSkipDemo} style={styles.skipDemoButton}>
            <NeonText variant="caption" color="muted">Skip for Demo →</NeonText>
          </Pressable>
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
    flexGrow: 1,
    paddingHorizontal: spacing[4],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
    minHeight: verticalScale(600),
  },
  heroSection: {
    width: '100%',
    height: verticalScale(200),
    marginBottom: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLogo: {
    width: moderateScale(180),
    height: moderateScale(180),
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  title: {
    marginBottom: spacing[2],
    letterSpacing: 2,
  },
  tagline: {
    marginBottom: spacing[4],
  },
  description: {
    lineHeight: 24,
    maxWidth: 260,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing[2],
  },
  featurePill: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.primary[900],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary[800],
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  actions: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
    width: '100%',
  },
  signInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[4],
  },
  skipDemoButton: {
    marginTop: spacing[4],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    alignSelf: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
  },
});

