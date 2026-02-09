import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Screen, NeonText, NeonButton } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

const redeemSchema = z.object({
  code: z.string()
    .min(1, 'Please enter a referral code')
    .min(6, 'Code must be at least 6 characters')
    .regex(/^[A-Z0-9-]+$/i, 'Invalid code format'),
});

type RedeemFormData = z.infer<typeof redeemSchema>;

export default function RedeemScreen() {
  const router = useRouter();
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  const { control, handleSubmit, formState: { errors }, watch } = useForm<RedeemFormData>({
    resolver: zodResolver(redeemSchema),
    defaultValues: {
      code: '',
    },
  });

  const codeValue = watch('code');

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const onSubmit = async (data: RedeemFormData) => {
    Keyboard.dismiss();
    setIsRedeeming(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsRedeeming(false);
    setRedeemSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (redeemSuccess) {
    return (
      <Screen safeArea style={styles.container}>
        <View style={styles.successContainer}>
          <MotiView
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' }}
            style={styles.successIconContainer}
          >
            <MotiView
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ type: 'timing', duration: 2000, loop: true }}
            >
              <NeonText style={styles.successIcon}>🎉</NeonText>
            </MotiView>
          </MotiView>
          
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 200, duration: 400 }}
          >
            <NeonText variant="h2" color="white" style={styles.successTitle}>
              Code Redeemed!
            </NeonText>
            <NeonText variant="body" color="muted" style={styles.successMessage}>
              You've received{' '}
              <NeonText variant="body" color="primary">$10 in trading credits</NeonText>
            </NeonText>
          </MotiView>
          
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 400, duration: 400 }}
            style={styles.successButton}
          >
            <NeonButton onPress={() => router.replace('/(tabs)/account/referral')}>
              Back to Referrals
            </NeonButton>
          </MotiView>
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeArea style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.header}
        >
          <Pressable onPress={handleBack} style={styles.backButton}>
            <NeonText variant="body" color="muted">‹ Back</NeonText>
          </Pressable>
          <NeonText variant="h2" color="white">Redeem Code</NeonText>
          <View style={styles.titleUnderline} />
        </MotiView>

        {/* Icon */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.iconSection}
        >
          <View style={styles.iconContainer}>
            <NeonText style={styles.icon}>🎫</NeonText>
          </View>
          <NeonText variant="body" color="muted" style={styles.iconText}>
            Enter a friend's referral code to receive $10 credit
          </NeonText>
        </MotiView>

        {/* Code Input */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 150, duration: 400 }}
          style={styles.inputSection}
        >
          <NeonText variant="caption" color="muted" style={styles.inputLabel}>
            REFERRAL CODE
          </NeonText>
          
          <Controller
            control={control}
            name="code"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={[styles.inputContainer, errors.code && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. TRADE-ABC"
                  placeholderTextColor={colors.neutral[500]}
                  value={value}
                  onChangeText={(text) => onChange(text.toUpperCase())}
                  onBlur={onBlur}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={20}
                />
                {codeValue.length > 0 && (
                  <Pressable
                    onPress={() => onChange('')}
                    style={styles.clearButton}
                  >
                    <NeonText variant="caption" color="muted">✕</NeonText>
                  </Pressable>
                )}
              </View>
            )}
          />
          
          {errors.code && (
            <MotiView
              from={{ opacity: 0, translateY: -5 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 200 }}
            >
              <NeonText variant="caption" color="error" style={styles.errorText}>
                {errors.code.message}
              </NeonText>
            </MotiView>
          )}
        </MotiView>

        {/* Info Card */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.infoSection}
        >
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <NeonText style={styles.infoIcon}>💰</NeonText>
              <NeonText variant="caption" color="muted">
                Credits are applied to your next subscription payment
              </NeonText>
            </View>
            <View style={styles.infoRow}>
              <NeonText style={styles.infoIcon}>⏱️</NeonText>
              <NeonText variant="caption" color="muted">
                Credits never expire
              </NeonText>
            </View>
          </View>
        </MotiView>

        {/* Submit Button */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 250, duration: 400 }}
          style={styles.submitSection}
        >
          <NeonButton
            onPress={handleSubmit(onSubmit)}
            disabled={isRedeeming || codeValue.length === 0}
          >
            {isRedeeming ? 'Redeeming...' : 'Redeem Code'}
          </NeonButton>
        </MotiView>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: layout.tabBarHeight + spacing[4],
  },
  header: {
    paddingVertical: spacing[2],
    gap: spacing[1],
  },
  backButton: {
    paddingVertical: spacing[2],
    alignSelf: 'flex-start',
  },
  titleUnderline: {
    height: 2,
    width: 60,
    backgroundColor: colors.primary[500],
    borderRadius: 1,
    marginTop: spacing[1],
  },
  iconSection: {
    alignItems: 'center',
    marginTop: spacing[6],
    gap: spacing[3],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  icon: {
    fontSize: 40,
  },
  iconText: {
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
  inputSection: {
    marginTop: spacing[6],
  },
  inputLabel: {
    letterSpacing: 1.5,
    fontSize: 11,
    marginBottom: spacing[2],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    paddingHorizontal: spacing[4],
  },
  inputError: {
    borderColor: colors.error[500] || '#FF4444',
  },
  input: {
    flex: 1,
    color: colors.neutral[900],
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
    paddingVertical: spacing[4],
    textAlign: 'center',
  },
  clearButton: {
    padding: spacing[2],
  },
  errorText: {
    marginTop: spacing[2],
  },
  infoSection: {
    marginTop: spacing[6],
  },
  infoCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[4],
    gap: spacing[3],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  infoIcon: {
    fontSize: 18,
  },
  submitSection: {
    marginTop: spacing[6],
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  successIconContainer: {
    marginBottom: spacing[6],
  },
  successIcon: {
    fontSize: 80,
  },
  successTitle: {
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  successMessage: {
    textAlign: 'center',
  },
  successButton: {
    marginTop: spacing[8],
    width: '100%',
  },
});


