import { Easing } from 'react-native-reanimated';

export const animationPresets = {
  // Micro-interactions
  micro: {
    duration: 150,
    easing: Easing.out(Easing.ease),
  },
  
  // Standard transitions
  standard: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
  },
  
  // Emphasis (success, important events)
  emphasis: {
    duration: 400,
    easing: Easing.out(Easing.back(1.5)),
  },
  
  // Spring configs
  spring: {
    gentle: {
      damping: 20,
      stiffness: 200,
      mass: 1,
    },
    bouncy: {
      damping: 12,
      stiffness: 150,
      mass: 1,
    },
    snappy: {
      damping: 15,
      stiffness: 400,
      mass: 0.8,
    },
  },
  
  // Pulse animation (for AI status, splash)
  pulse: {
    duration: 2000,
    easing: Easing.inOut(Easing.ease),
  },
} as const;

// Worklet-safe spring config
export const springConfigs = {
  button: { damping: 15, stiffness: 400 },
  card: { damping: 20, stiffness: 200 },
  modal: { damping: 25, stiffness: 300 },
  page: { damping: 20, stiffness: 250 },
  splash: { damping: 20, stiffness: 120 },
} as const;

