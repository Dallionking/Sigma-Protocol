import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/lib/theme';
import { NeonText } from './NeonText';

interface BadgeProps {
  children: string;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md';
}

export function Badge({ 
  children, 
  variant = 'default',
  size = 'md',
}: BadgeProps) {
  return (
    <View style={[
      styles.container,
      styles[variant],
      size === 'sm' && styles.sm,
    ]}>
      <NeonText 
        variant="label" 
        color={variant === 'default' ? 'muted' : 'white'}
        style={[
          styles.text,
          size === 'sm' && styles.textSm,
          variant === 'success' && styles.successText,
          variant === 'danger' && styles.dangerText,
        ]}
      >
        {children}
      </NeonText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  sm: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  default: {
    backgroundColor: colors.neutral[100],
  },
  success: {
    backgroundColor: colors.primary[900],
  },
  danger: {
    backgroundColor: colors.accent.muted,
  },
  warning: {
    backgroundColor: 'rgba(255, 220, 0, 0.15)',
  },
  info: {
    backgroundColor: 'rgba(0, 191, 255, 0.15)',
  },
  text: {
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  textSm: {
    fontSize: 10,
  },
  successText: {
    color: colors.primary.DEFAULT,
  },
  dangerText: {
    color: colors.accent.DEFAULT,
  },
});

