/**
 * Global Border Beam Sync Hook
 * 
 * Provides a synchronized animation value for all cards to animate
 * their border beams in perfect sync across the app.
 */

import { useEffect, useRef } from 'react';
import {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
  SharedValue,
} from 'react-native-reanimated';

// Global shared value singleton - ensures all cards use the same animation
let globalBeamProgress: SharedValue<number> | null = null;
let instanceCount = 0;

/**
 * Hook to get the synchronized border beam progress value.
 * All components using this hook will receive the same animated value,
 * ensuring all border beams animate in perfect sync.
 * 
 * @param duration - Animation loop duration in ms (default: 5000ms)
 * @returns SharedValue<number> that cycles from 0 to 1
 */
export function useBorderBeamSync(duration: number = 5000): SharedValue<number> {
  const localProgress = useSharedValue(0);
  const isInitialized = useRef(false);

  useEffect(() => {
    instanceCount++;

    // Initialize global value on first use
    if (!globalBeamProgress) {
      globalBeamProgress = localProgress;

      // Start the infinite animation loop: 0 → 1 over duration, repeat forever
      globalBeamProgress.value = withRepeat(
        withTiming(1, { 
          duration, 
          easing: Easing.linear,
        }),
        -1, // infinite repeats
        false // don't reverse (0→1→0→1...), just restart (0→1, 0→1...)
      );
      
      isInitialized.current = true;
    }

    return () => {
      instanceCount--;
      
      // Clean up when last instance unmounts
      if (instanceCount === 0 && globalBeamProgress) {
        cancelAnimation(globalBeamProgress);
        globalBeamProgress = null;
      }
    };
  }, [duration]);

  // Return the global value if it exists, otherwise the local one
  return globalBeamProgress || localProgress;
}

/**
 * Reset the global beam animation (useful for testing or restarting)
 */
export function resetBorderBeamSync(): void {
  if (globalBeamProgress) {
    cancelAnimation(globalBeamProgress);
    globalBeamProgress.value = 0;
    globalBeamProgress.value = withRepeat(
      withTiming(1, { duration: 5000, easing: Easing.linear }),
      -1,
      false
    );
  }
}

