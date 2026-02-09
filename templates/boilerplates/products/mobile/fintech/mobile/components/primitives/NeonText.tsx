import React from 'react';
import { Text, TextProps, StyleSheet, Platform } from 'react-native';
import { colors } from '@/lib/theme';
import { fontSize, moderateScale } from '@/lib/utils/responsive';

export interface NeonTextProps extends TextProps {
  children: React.ReactNode;
  glow?: boolean;
  variant?: 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label' | 'mono' | 'balance';
  color?: 'primary' | 'white' | 'muted' | 'danger' | 'success';
  align?: 'left' | 'center' | 'right';
}

export function NeonText({ 
  children, 
  glow = false, 
  variant = 'body',
  color = 'white',
  align,
  style,
  ...props 
}: NeonTextProps) {
  const colorStyle = {
    primary: colors.primary.DEFAULT,
    white: colors.neutral[900],
    muted: colors.neutral[600],
    danger: colors.accent.DEFAULT,
    success: colors.success,
  }[color];

  return (
    <Text 
      style={[
        styles.base,
        styles[variant],
        { color: colorStyle },
        align && { textAlign: align },
        glow && styles.glow,
        style
      ]} 
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.neutral[900],
  },
  // Large display number - BAGS balance style (responsive)
  display: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'sans-serif',
    fontSize: fontSize(38),
    fontWeight: '700',
    letterSpacing: -1.5,
  },
  // Balance-specific - tabular numbers for aligned digits
  balance: {
    fontFamily: Platform.OS === 'ios' ? 'SF Mono' : 'monospace',
    fontSize: fontSize(32),
    fontWeight: '600',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  h1: {
    fontSize: fontSize(28),
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: fontSize(24),
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: fontSize(18),
    fontWeight: '600',
  },
  h4: {
    fontSize: fontSize(16),
    fontWeight: '600',
  },
  body: {
    fontSize: fontSize(15),
    fontWeight: '400',
    letterSpacing: -0.2,
    lineHeight: fontSize(21),
  },
  caption: {
    fontSize: fontSize(12),
    fontWeight: '400',
    letterSpacing: -0.1,
    lineHeight: fontSize(17),
  },
  label: {
    fontSize: fontSize(11),
    fontWeight: '500',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  mono: {
    fontFamily: Platform.OS === 'ios' ? 'SF Mono' : 'monospace',
    fontSize: fontSize(13),
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  // Subtle glow - refined
  glow: Platform.select({
    web: {
      textShadow: `0 0 ${moderateScale(12)}px ${colors.glow}`,
    },
    ios: {
      textShadowColor: colors.glow,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: moderateScale(10),
    },
    android: {},
  }) as object,
});

