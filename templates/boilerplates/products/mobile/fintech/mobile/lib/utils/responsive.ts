/**
 * Responsive utilities for consistent sizing across iPhone devices
 * 
 * Base design: iPhone 14/15 Pro (393 x 852 points)
 * Scales proportionally for other devices
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 14/15 Pro)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

// Get the shorter dimension for scale calculations
const SCALE = SCREEN_WIDTH < SCREEN_HEIGHT ? SCREEN_WIDTH : SCREEN_HEIGHT;

/**
 * Scales a size based on screen width
 * Use for horizontal dimensions (width, marginHorizontal, paddingHorizontal)
 */
export function scale(size: number): number {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
}

/**
 * Scales a size based on screen height
 * Use for vertical dimensions (height, marginVertical, paddingVertical)
 */
export function verticalScale(size: number): number {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
}

/**
 * Moderate scale - scales but with a dampening factor
 * Good for font sizes and elements that shouldn't grow/shrink too much
 * factor: 0.5 = grow at half rate, 0 = no scaling, 1 = full scaling
 */
export function moderateScale(size: number, factor: number = 0.5): number {
  return size + (scale(size) - size) * factor;
}

/**
 * Moderate vertical scale
 */
export function moderateVerticalScale(size: number, factor: number = 0.5): number {
  return size + (verticalScale(size) - size) * factor;
}

/**
 * Get responsive font size
 * Scales fonts appropriately across devices while respecting user's font scale settings
 */
export function fontSize(size: number): number {
  const scaledSize = moderateScale(size, 0.3);
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
}

/**
 * Width as percentage of screen width
 */
export function wp(percentage: number): number {
  return (SCREEN_WIDTH * percentage) / 100;
}

/**
 * Height as percentage of screen height
 */
export function hp(percentage: number): number {
  return (SCREEN_HEIGHT * percentage) / 100;
}

/**
 * Normalize a size based on screen scale
 * Useful for consistent sizing across different pixel densities
 */
export function normalize(size: number): number {
  const scale = SCREEN_WIDTH / 375; // iPhone 8 width as base
  const newSize = size * scale;
  
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
}

// Device info
export const isSmallDevice = SCREEN_WIDTH < 375;
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
export const isLargeDevice = SCREEN_WIDTH >= 414;

// Screen dimensions
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

// Responsive spacing values (using moderateScale)
export const responsiveSpacing = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(16),
  lg: moderateScale(24),
  xl: moderateScale(32),
  xxl: moderateScale(48),
};

// Responsive font sizes
export const responsiveFontSizes = {
  caption: fontSize(11),
  label: fontSize(12),
  body: fontSize(14),
  h4: fontSize(16),
  h3: fontSize(18),
  h2: fontSize(24),
  h1: fontSize(32),
  display: fontSize(42),
  balance: fontSize(36),
};

// Responsive icon sizes
export const responsiveIconSizes = {
  sm: moderateScale(16),
  md: moderateScale(24),
  lg: moderateScale(32),
  xl: moderateScale(48),
};

// Responsive border radius
export const responsiveBorderRadius = {
  sm: moderateScale(4),
  md: moderateScale(8),
  lg: moderateScale(12),
  xl: moderateScale(16),
  xxl: moderateScale(24),
  full: moderateScale(9999),
};

// Responsive button heights
export const responsiveButtonHeights = {
  sm: verticalScale(36),
  md: verticalScale(48),
  lg: verticalScale(56),
};

// Responsive card padding
export const responsiveCardPadding = {
  sm: moderateScale(12),
  md: moderateScale(16),
  lg: moderateScale(20),
};

export default {
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
  fontSize,
  wp,
  hp,
  normalize,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  screenWidth,
  screenHeight,
  responsiveSpacing,
  responsiveFontSizes,
  responsiveIconSizes,
  responsiveBorderRadius,
  responsiveButtonHeights,
  responsiveCardPadding,
};

