/**
 * Card Component
 * 
 * A versatile card component with multiple variants including a premium
 * glassmorphism style with animated border beam effect.
 * Based on 21st.dev glass-card design patterns.
 */

import React from 'react';
import { View, StyleSheet, Pressable, Platform, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, spacing } from '@/lib/theme';
import { moderateScale } from '@/lib/utils/responsive';
import { BorderBeamSimple } from './BorderBeam';

interface CardProps {
  children: React.ReactNode;
  /** Card visual style */
  variant?: 'default' | 'elevated' | 'outlined' | 'highlight' | 'glassmorphism';
  /** Press handler for interactive cards */
  onPress?: () => void;
  /** Custom styles */
  style?: ViewStyle;
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Show animated border beam (only for glassmorphism variant) */
  showBorderBeam?: boolean;
  /** Border radius override */
  borderRadius?: number;
  /** Blur intensity for glassmorphism (0-100) */
  blurIntensity?: number;
  /** Whether to animate entry */
  animateEntry?: boolean;
}

export function Card({ 
  children, 
  variant = 'glassmorphism',
  onPress,
  style,
  padding = 'md',
  showBorderBeam = false,
  borderRadius: customBorderRadius,
  blurIntensity = 60,
  animateEntry = false,
}: CardProps) {
  const borderRadius = customBorderRadius ?? moderateScale(20);

  const paddingStyles: Record<string, ViewStyle> = {
    none: {},
    sm: { padding: spacing[3] },
    md: { padding: spacing[4] },
    lg: { padding: spacing[5] },
  };

  // Glassmorphism variant has special rendering
  if (variant === 'glassmorphism') {
    const cardContent = (
      <View 
        style={[
          styles.container,
          styles.glassmorphism,
          { borderRadius },
          paddingStyles[padding],
          style,
        ]}
      >
        {/* Blur background layer */}
        <BlurView
          intensity={blurIntensity}
          tint="dark"
          style={[StyleSheet.absoluteFill, { borderRadius }]}
        />
        
        {/* Glass background with subtle white overlay */}
        <View 
          style={[
            StyleSheet.absoluteFill,
            styles.glassBackground,
            { borderRadius },
          ]} 
        />

        {/* Top highlight gradient (light reflection) */}
        <LinearGradient
          colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.03)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius }]}
          pointerEvents="none"
        />

        {/* Bottom shadow gradient (depth) */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius }]}
          pointerEvents="none"
        />

        {/* Animated border beam */}
        {showBorderBeam && (
          <BorderBeamSimple
            borderRadius={borderRadius}
            borderWidth={1}
            active={showBorderBeam}
          />
        )}

        {/* Content */}
        <View style={styles.content}>
          {children}
        </View>
      </View>
    );

    // Wrap with animated entry if requested
    const wrappedContent = animateEntry ? (
      <Animated.View entering={FadeIn.duration(400)}>
        {cardContent}
      </Animated.View>
    ) : cardContent;

    if (onPress) {
      return (
        <Pressable 
          onPress={onPress} 
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
        >
          {wrappedContent}
        </Pressable>
      );
    }

    return wrappedContent;
  }

  // Standard variants
  const content = (
    <View 
      style={[
        styles.container,
        styles[variant],
        { borderRadius },
        paddingStyles[padding],
        style,
      ]}
    >
      {children}
    </View>
  );

  const wrappedContent = animateEntry ? (
    <Animated.View entering={FadeIn.duration(400)}>
      {content}
    </Animated.View>
  ) : content;

  if (onPress) {
    return (
      <Pressable 
        onPress={onPress} 
        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
      >
        {wrappedContent}
      </Pressable>
    );
  }

  return wrappedContent;
}

/**
 * Compact card variant for smaller UI elements like feature rows
 */
export function CardCompact({
  children,
  onPress,
  style,
  showBorderBeam = false,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  showBorderBeam?: boolean;
}) {
  return (
    <Card
      variant="glassmorphism"
      padding="sm"
      borderRadius={moderateScale(12)}
      showBorderBeam={showBorderBeam}
      blurIntensity={40}
      onPress={onPress}
      style={style}
    >
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  // BAGS-style clean cards
  default: {
    backgroundColor: colors.card.DEFAULT,
    borderWidth: 1,
    borderColor: colors.card.border,
  },
  elevated: {
    backgroundColor: colors.card.elevated,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: moderateScale(12),
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      },
    }),
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  // Highlighted card with subtle green glow
  highlight: {
    backgroundColor: colors.card.DEFAULT,
    borderWidth: 1,
    borderColor: colors.primary[800],
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.DEFAULT,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: moderateScale(16),
      },
      web: {
        boxShadow: `0 0 24px ${colors.glow}`,
      },
      android: {},
    }),
  },
  // Glassmorphism style - 21st.dev inspired
  glassmorphism: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: moderateScale(16),
      },
      web: {
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      android: {
        elevation: 8,
      },
    }),
  },
  glassBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});

