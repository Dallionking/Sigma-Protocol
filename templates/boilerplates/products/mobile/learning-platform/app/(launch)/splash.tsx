import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { GradientBackground } from "@/components/GradientBackground";
import { NeonMonogram } from "@/components/NeonMonogram";
import { Wordmark } from "@/components/Wordmark";
import { useReduceMotion } from "@/hooks/useReduceMotion";
import { colors } from "@/theme/tokens";
import type { GateTarget } from "@/lib/gate";
import { resolveGateTarget } from "@/lib/gate";

type TargetRoute = GateTarget;

const MIN_SPLASH_MS = 1200;
const MAX_SPLASH_MS = 3000;
const SLOW_COPY_MS = 2500;
const TRANSITION_OUT_MS = 300;

export default function SplashScreen() {
  const router = useRouter();
  const reduceMotion = useReduceMotion();

  const startedAt = useRef(Date.now());
  const hasNavigated = useRef(false);

  const [target, setTarget] = useState<TargetRoute | null>(null);
  const [showSlowCopy, setShowSlowCopy] = useState(false);

  const outro = useSharedValue(0);

  const rootStyle = useAnimatedStyle(() => {
    const t = outro.value;
    return {
      opacity: 1 - t,
      transform: [{ scale: 1 + t * 0.06 }],
    };
  });

  const navigate = useCallback(
    (to: TargetRoute) => {
      if (hasNavigated.current) return;
      hasNavigated.current = true;
      router.replace(to);
    },
    [router]
  );

  const beginExit = useCallback(
    (to: TargetRoute) => {
      if (hasNavigated.current) return;

      if (reduceMotion) {
        navigate(to);
        return;
      }

      outro.value = withTiming(
        1,
        { duration: TRANSITION_OUT_MS, easing: Easing.out(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(navigate)(to);
        }
      );
    },
    [navigate, outro, reduceMotion]
  );

  const scheduleExitIfReady = useCallback(
    (to: TargetRoute) => {
      const elapsed = Date.now() - startedAt.current;
      const delay = Math.max(MIN_SPLASH_MS - elapsed, 0);

      setTimeout(() => beginExit(to), delay);
    },
    [beginExit]
  );

  useEffect(() => {
    const slowTimer = setTimeout(() => {
      if (!hasNavigated.current) setShowSlowCopy(true);
    }, SLOW_COPY_MS);

    const hardTimer = setTimeout(() => {
      if (!hasNavigated.current) {
        setTarget("/error-offline");
        scheduleExitIfReady("/error-offline");
      }
    }, MAX_SPLASH_MS);

    return () => {
      clearTimeout(slowTimer);
      clearTimeout(hardTimer);
    };
  }, [scheduleExitIfReady]);

  useEffect(() => {
    let cancelled = false;

    async function runGate() {
      const gate = await resolveGateTarget();
      const decided: TargetRoute = gate.target;

      if (!cancelled) {
        setTarget(decided);
        scheduleExitIfReady(decided);
      }
    }

    void runGate();

    return () => {
      cancelled = true;
    };
  }, [scheduleExitIfReady]);

  return (
    <GradientBackground>
      <Pressable
        onPress={() => {
          if (!target) return;
          const elapsed = Date.now() - startedAt.current;
          if (elapsed >= MIN_SPLASH_MS) beginExit(target);
        }}
        onLongPress={__DEV__ ? () => router.push("/dev") : undefined}
        delayLongPress={550}
        style={{ flex: 1 }}
      >
        <Animated.View style={[styles.contentContainer, rootStyle]}>
          <View style={styles.centerContent}>
            <NeonMonogram size={156} />

            <View style={styles.wordmarkContainer}>
              <Wordmark />
            </View>

            <View style={styles.progressSection}>
              <ProgressDots />
              {showSlowCopy ? (
                <Text style={styles.slowCopy}>
                  Warming up the night sky…
                </Text>
              ) : null}
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </GradientBackground>
  );
}

function ProgressDots() {
  const reduceMotion = useReduceMotion();

  return (
    <View style={styles.dotsContainer}>
      <Dot delay={0} reduceMotion={reduceMotion} />
      <Dot delay={220} reduceMotion={reduceMotion} />
      <Dot delay={440} reduceMotion={reduceMotion} />
    </View>
  );
}

function Dot({ delay, reduceMotion }: { delay: number; reduceMotion: boolean }) {
  const v = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;

    let intervalId: ReturnType<typeof setInterval> | undefined;

    const timeoutId = setTimeout(() => {
      v.value = 0;
      v.value = withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) });

      // loop
      intervalId = setInterval(() => {
        v.value = 0;
        v.value = withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) });
      }, 1100);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [delay, reduceMotion, v]);

  const style = useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: 0.25 };

    const opacity = 0.15 + v.value * 0.65;
    const translateY = -v.value * 2;

    return {
      opacity,
      transform: [{ translateY }],
    };
  }, [reduceMotion]);

  return (
    <Animated.View
      style={[
        {
          width: 6,
          height: 6,
          borderRadius: 999,
          backgroundColor: "rgba(248, 250, 252, 0.9)",
          marginHorizontal: 4,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerContent: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  wordmarkContainer: {
    marginTop: 24,
  },
  progressSection: {
    marginTop: 40,
    alignItems: "center",
  },
  slowCopy: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
    marginTop: 16,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
