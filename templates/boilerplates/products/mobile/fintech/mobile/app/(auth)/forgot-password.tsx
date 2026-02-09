import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen, NeonText, NeonButton, NeonInput } from '@/components/primitives';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validations/auth';
import { colors, spacing } from '@/lib/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors }, getValues } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Reset password for:', data.email);
    setIsSubmitting(false);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push({
      pathname: '/(auth)/check-email',
      params: { email: data.email },
    });
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <Screen safeArea padded style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Back button */}
        <Pressable onPress={handleBack} style={styles.backButton}>
          <NeonText variant="body" color="primary">
            ← Back
          </NeonText>
        </Pressable>

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerSection}>
            <NeonText variant="h2" style={styles.title}>
              Reset your password
            </NeonText>
            <NeonText variant="body" color="muted" style={styles.subtitle}>
              Enter your email and we'll send you a reset link.
            </NeonText>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <NeonInput
                  label="Email"
                  placeholder="you@domain.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            <View style={styles.submitButton}>
              <NeonButton 
                onPress={handleSubmit(onSubmit)} 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </NeonButton>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
  },
  keyboardView: {
    flex: 1,
  },
  backButton: {
    paddingVertical: spacing[2],
    marginBottom: spacing[4],
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[2],
  },
  headerSection: {
    marginBottom: spacing[8],
  },
  title: {
    marginBottom: spacing[2],
  },
  subtitle: {
    lineHeight: 24,
  },
  formSection: {
    width: '100%',
    maxWidth: 400,
  },
  submitButton: {
    marginTop: spacing[6],
  },
});

