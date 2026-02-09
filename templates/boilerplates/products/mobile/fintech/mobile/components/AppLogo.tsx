/**
 * AppLogo Component
 *
 * Renders the app logo at various sizes.
 * Replace the icon.png asset with your own logo.
 */

import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface AppLogoProps {
  /** Size of the logo (width and height) */
  size?: number;
  /** Additional styles */
  style?: StyleProp<ImageStyle>;
}

export function AppLogo({ size = 24, style }: AppLogoProps) {
  return (
    <Image
      source={require('@/assets/icon.png')}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
      accessibilityLabel="App Logo"
    />
  );
}

export default AppLogo;
