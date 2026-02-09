import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonLoader } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';

export default function PurchaseProcessingScreen() {
  useEffect(() => {
    // Subtle haptic feedback while processing
    const interval = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <NeonLoader size="large" />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300, duration: 400 }}
          style={styles.textContainer}
        >
          <NeonText variant="h3" color="white" style={styles.title}>
            Processing…
          </NeonText>
          <NeonText variant="body" color="muted" style={styles.subtitle}>
            Confirming with Apple
          </NeonText>
        </MotiView>

        {/* Animated dots */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((index) => (
            <MotiView
              key={index}
              from={{ opacity: 0.3, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'timing',
                duration: 600,
                delay: index * 200,
                loop: true,
              }}
              style={styles.dot}
            />
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  textContainer: {
    alignItems: 'center',
    marginTop: spacing[6],
  },
  title: {
    marginBottom: spacing[2],
  },
  subtitle: {
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[6],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
  },
});

