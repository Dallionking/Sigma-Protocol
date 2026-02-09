import { useReduceMotion } from "./useReduceMotion";
import { durations } from "@/theme/tokens";

type TimingConfig = {
  type: "timing";
  duration?: number;
  delay?: number;
};

type SpringConfig = {
  type: "spring";
  damping?: number;
  stiffness?: number;
  delay?: number;
};

type TransitionConfig = TimingConfig | SpringConfig;

const INSTANT_TIMING = { type: "timing" as const, duration: 0, delay: 0 };
const DEFAULT_SMOOTH_TIMING = { 
  type: "timing" as const, 
  duration: durations.normal,
};

/**
 * Returns motion-aware transition configs for Moti animations.
 * When reduced motion is enabled, returns instant transitions.
 */
export function useMotionTransition() {
  const reduceMotion = useReduceMotion();

  // Overloaded function that preserves the input type
  function getTransition(config?: TransitionConfig): TransitionConfig {
    if (reduceMotion) {
      return INSTANT_TIMING;
    }
    
    if (!config) {
      return DEFAULT_SMOOTH_TIMING;
    }

    // If we want to move away from springs, we can optionally 
    // convert spring configs to timing here if a global flag was set.
    // For now, we allow the config but favor timing in the app.
    return config;
  }

  return {
    reduceMotion,
    getTransition,
    defaultTiming: getTransition(),
  };
}

/**
 * Returns static "from" values or identity values based on reduced motion.
 * When reduced motion is enabled, animations start from their final position.
 */
export function useMotionFrom(reduceMotion: boolean) {
  return {
    // Small subtle slide up
    fadeUp: reduceMotion
      ? { opacity: 1, translateY: 0 }
      : { opacity: 0, translateY: 8 },
    // Slightly larger but still subtle slide up
    fadeUpLarge: reduceMotion
      ? { opacity: 1, translateY: 0 }
      : { opacity: 0, translateY: 12 },
    // Pure fade
    fade: reduceMotion ? { opacity: 1 } : { opacity: 0 },
    // Subtle scale in
    scaleIn: reduceMotion
      ? { opacity: 1, scale: 1 }
      : { opacity: 0, scale: 0.96 },
  };
}

