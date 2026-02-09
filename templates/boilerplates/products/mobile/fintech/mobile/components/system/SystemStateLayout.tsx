import React from 'react';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Screen, NeonText, NeonButton } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import { moderateScale, verticalScale } from '@/lib/utils/responsive';

export type SystemStateType = 
  | 'offline' 
  | 'no-broker' 
  | 'insufficient-balance' 
  | 'session-expired' 
  | 'access-denied' 
  | 'error';

interface ActionButton {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
}

interface SystemStateLayoutProps {
  type: SystemStateType;
  icon: string;
  title: string;
  subtitle: string;
  primaryAction?: ActionButton;
  secondaryAction?: ActionButton;
  showBackButton?: boolean;
  /** Optional status footer text */
  statusText?: string;
  children?: React.ReactNode;
}

const ICON_CONFIGS: Record<SystemStateType, { 
  bgColor: string; 
  glowColor: string;
  animate?: 'pulse' | 'rotate' | 'bounce';
}> = {
  'offline': { 
    bgColor: colors.neutral[100], 
    glowColor: colors.neutral[400],
    animate: 'pulse',
  },
  'no-broker': { 
    bgColor: colors.primary[900], 
    glowColor: colors.primary.DEFAULT,
  },
  'insufficient-balance': { 
    bgColor: colors.accent.muted, 
    glowColor: colors.accent.DEFAULT,
    animate: 'pulse',
  },
  'session-expired': { 
    bgColor: colors.neutral[100], 
    glowColor: colors.neutral[500],
  },
  'access-denied': { 
    bgColor: colors.primary[900], 
    glowColor: colors.primary.DEFAULT,
    animate: 'bounce',
  },
  'error': { 
    bgColor: colors.accent.muted, 
    glowColor: colors.accent.DEFAULT,
    animate: 'pulse',
  },
};

export function SystemStateLayout({
  type,
  icon,
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  showBackButton = false,
  statusText,
  children,
}: SystemStateLayoutProps) {
  const router = useRouter();
  const config = ICON_CONFIGS[type];
  
  // Animation values
  const pulseOpacity = useSharedValue(0.6);
  const bounceY = useSharedValue(0);

  useEffect(() => {
    // Haptic feedback on mount
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Setup animations based on type
    if (config.animate === 'pulse') {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.6, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
    
    if (config.animate === 'bounce') {
      bounceY.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounceY.value }],
  }));

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <Screen safeArea padded style={styles.container}>
      {/* Optional Back Button */}
      {showBackButton && (
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <NeonText variant="body" color="muted">‹ Back</NeonText>
          </Pressable>
        </View>
      )}

      <View style={styles.content}>
        {/* Animated Icon Container */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100, damping: 12 }}
        >
          <Animated.View 
            style={[
              styles.iconContainer,
              config.animate === 'bounce' && bounceStyle,
            ]}
          >
            {/* Outer glow ring */}
            <Animated.View
              style={[
                styles.glowRing,
                { borderColor: config.glowColor },
                config.animate === 'pulse' && pulseStyle,
              ]}
            />
            
            {/* Icon circle */}
            <View style={[styles.iconCircle, { backgroundColor: config.bgColor }]}>
              <NeonText 
                variant="display" 
                style={styles.icon}
                color={type === 'access-denied' || type === 'no-broker' ? 'primary' : 'white'}
              >
                {icon}
              </NeonText>
            </View>
          </Animated.View>
        </MotiView>

        {/* Title with staggered entrance */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
        >
          <NeonText 
            variant="h1" 
            align="center" 
            style={styles.title}
            glow={type === 'no-broker' || type === 'access-denied'}
            color={type === 'offline' || type === 'session-expired' ? 'white' : 
                   type === 'error' || type === 'insufficient-balance' ? 'danger' : 'primary'}
          >
            {title}
          </NeonText>
        </MotiView>

        {/* Subtitle */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 300 }}
        >
          <NeonText variant="body" color="muted" align="center" style={styles.subtitle}>
            {subtitle}
          </NeonText>
        </MotiView>

        {/* Optional custom content */}
        {children && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 400 }}
            style={styles.customContent}
          >
            {children}
          </MotiView>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {primaryAction && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 400 }}
          >
            <NeonButton 
              onPress={primaryAction.onPress}
              variant={primaryAction.variant || 'primary'}
            >
              {primaryAction.label}
            </NeonButton>
          </MotiView>
        )}
        
        {secondaryAction && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 500 }}
          >
            <NeonButton 
              onPress={secondaryAction.onPress}
              variant={secondaryAction.variant || 'ghost'}
              style={styles.secondaryButton}
            >
              {secondaryAction.label}
            </NeonButton>
          </MotiView>
        )}
      </View>

      {/* Optional status footer */}
      {statusText && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 600 }}
          style={styles.footer}
        >
          <View style={styles.statusRow}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: type === 'offline' ? colors.neutral[500] : colors.primary.DEFAULT }
            ]} />
            <NeonText variant="mono" color="muted" style={styles.statusText}>
              {statusText}
            </NeonText>
          </View>
        </MotiView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
  },
  header: {
    paddingVertical: spacing[2],
  },
  backButton: {
    paddingVertical: spacing[2],
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  iconContainer: {
    width: moderateScale(110),
    height: moderateScale(110),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  glowRing: {
    position: 'absolute',
    width: moderateScale(130),
    height: moderateScale(130),
    borderRadius: moderateScale(65),
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.DEFAULT,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {},
    }),
  },
  iconCircle: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: moderateScale(42),
  },
  title: {
    marginBottom: spacing[3],
    maxWidth: 280,
  },
  subtitle: {
    lineHeight: 24,
    maxWidth: 300,
  },
  customContent: {
    marginTop: spacing[6],
    width: '100%',
    maxWidth: 340,
  },
  actions: {
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
    gap: spacing[2],
  },
  secondaryButton: {
    marginTop: spacing[1],
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing[4],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing[2],
  },
  statusText: {
    fontSize: 11,
  },
});

