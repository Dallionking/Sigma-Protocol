// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable package exports for Three.js and React Three Fiber compatibility
config.resolver.unstable_enablePackageExports = true;

// Add support for .mjs and .cjs files
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// Set condition names for proper module resolution
config.resolver.unstable_conditionNames = [
  'browser',
  'require',
  'react-native',
];

module.exports = withNativeWind(config, { input: './global.css' });

