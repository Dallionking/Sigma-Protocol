import { moderateScale, verticalScale } from '@/lib/utils/responsive';

// Responsive spacing - scales based on device size
export const spacing = {
  0: 0,
  1: moderateScale(4),
  2: moderateScale(8),
  3: moderateScale(12),
  4: moderateScale(16),
  5: moderateScale(20),
  6: moderateScale(24),
  8: moderateScale(32),
  10: moderateScale(40),
  12: moderateScale(48),
  16: moderateScale(64),
  20: moderateScale(80),
  24: moderateScale(96),
} as const;

// Common layout values - responsive
export const layout = {
  screenPaddingHorizontal: moderateScale(20),
  screenPaddingTop: verticalScale(16),
  cardPadding: moderateScale(16),
  sectionGap: verticalScale(24),
  itemGap: verticalScale(12),
  tabBarHeight: verticalScale(84), // includes safe area
  headerHeight: verticalScale(44),
} as const;

