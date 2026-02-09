import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { colors, spacing } from '@/lib/theme';
import { NeonText } from './NeonText';
import { Icon, type IconName, isValidIconName } from './Icon';
import { ChevronRight } from 'lucide-react-native';

interface ListRowProps {
  /** Icon to display - can be IconName string or React element */
  icon?: IconName | React.ReactNode;
  /** Background color for icon container */
  iconBg?: string;
  /** Primary text */
  title: string;
  /** Secondary text below title */
  subtitle?: string;
  /** Value displayed on the right side */
  value?: string | React.ReactNode;
  /** Color for the value text */
  valueColor?: 'primary' | 'white' | 'muted' | 'danger';
  /** Custom trailing element */
  trailing?: React.ReactNode;
  /** Show chevron arrow on the right */
  showArrow?: boolean;
  /** Press handler - makes the row tappable */
  onPress?: () => void;
  /** Show bottom divider */
  divider?: boolean;
}

export function ListRow({
  icon,
  iconBg,
  title,
  subtitle,
  value,
  valueColor = 'white',
  trailing,
  showArrow = false,
  onPress,
  divider = true,
}: ListRowProps) {
  // Render the icon based on its type
  const renderIcon = () => {
    if (!icon) return null;
    
    // If it's a valid IconName string, render the Icon component
    if (typeof icon === 'string' && isValidIconName(icon)) {
      return <Icon name={icon} size={20} color="primary" />;
    }
    
    // If it's a string but not a valid icon name (legacy emoji support)
    if (typeof icon === 'string') {
      return <NeonText variant="body" style={styles.iconText}>{icon}</NeonText>;
    }
    
    // Otherwise it's a ReactNode, render directly
    return icon;
  };

  const content = (
    <View style={[styles.container, divider && styles.divider]}>
      {icon && (
        <View style={[
          styles.iconContainer,
          iconBg ? { backgroundColor: iconBg } : styles.defaultIconBg,
        ]}>
          {renderIcon()}
        </View>
      )}
      
      <View style={styles.content}>
        <NeonText variant="body" color="white" numberOfLines={1}>
          {title}
        </NeonText>
        {subtitle && (
          <NeonText variant="caption" color="muted" numberOfLines={1}>
            {subtitle}
          </NeonText>
        )}
      </View>
      
      <View style={styles.trailing}>
        {typeof value === 'string' ? (
          <NeonText variant="body" color={valueColor}>
            {value}
          </NeonText>
        ) : value}
        {trailing}
        {showArrow && (
          <ChevronRight size={20} color={colors.neutral[500]} style={styles.arrow} />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable 
        onPress={onPress}
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    minHeight: 56,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  defaultIconBg: {
    backgroundColor: colors.neutral[100],
  },
  iconText: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  arrow: {
    marginLeft: spacing[1],
  },
});

