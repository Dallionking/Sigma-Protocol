import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import { Screen, NeonText } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';

export default function WithdrawProcessingScreen() {
  const router = useRouter();
  const { amount } = useLocalSearchParams<{ amount: string }>();

  useEffect(() => {
    // Simulate processing time
    const timer = setTimeout(() => {
      // Randomly succeed or fail (90% success rate for demo)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        router.replace({
          pathname: '/(tabs)/withdraw/success',
          params: { amount },
        });
      } else {
        router.replace({
          pathname: '/(tabs)/withdraw/failure',
          params: { amount },
        });
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Screen safeArea style={styles.container}>
      <View style={styles.content}>
        {/* Animated Loader */}
        <View style={styles.loaderContainer}>
          {/* Outer Ring */}
          <MotiView
            style={styles.outerRing}
            animate={{ rotate: '360deg' }}
            transition={{
              type: 'timing',
              duration: 3000,
              loop: true,
            }}
          />
          
          {/* Middle Ring */}
          <MotiView
            style={styles.middleRing}
            animate={{ rotate: '-360deg' }}
            transition={{
              type: 'timing',
              duration: 2000,
              loop: true,
            }}
          />
          
          {/* Inner Pulse */}
          <MotiView
            style={styles.innerPulse}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{
              type: 'timing',
              duration: 1500,
              loop: true,
            }}
          />
          
          {/* Center Icon */}
          <View style={styles.centerIcon}>
            <NeonText style={styles.icon}>💸</NeonText>
          </View>
        </View>

        {/* Text */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300, duration: 400 }}
          style={styles.textContainer}
        >
          <NeonText variant="h2" color="white" style={styles.title}>
            Processing...
          </NeonText>
          <NeonText variant="body" color="muted" style={styles.subtitle}>
            Initiating your withdrawal
          </NeonText>
        </MotiView>

        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((index) => (
            <MotiView
              key={index}
              style={styles.dot}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{
                type: 'timing',
                duration: 1000,
                delay: index * 200,
                loop: true,
              }}
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  loaderContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  outerRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: colors.primary[500],
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  middleRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.primary[500],
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    opacity: 0.6,
  },
  innerPulse: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[500],
    opacity: 0.2,
  },
  centerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
  },
  textContainer: {
    alignItems: 'center',
    gap: spacing[2],
  },
  title: {
    textAlign: 'center',
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

