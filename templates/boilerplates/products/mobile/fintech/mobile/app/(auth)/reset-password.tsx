import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen, NeonText, NeonButton, NeonInput } from '@/components/primitives';
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/validations/auth';
import { colors, spacing } from '@/lib/theme';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirm: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Password reset successful');
    setIsSubmitting(false);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Navigate to sign in after password reset
    router.replace('/(auth)/signin');
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
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <Pressable onPress={handleBack} style={styles.backButton}>
            <NeonText variant="body" color="primary">
              ← Back
            </NeonText>
          </Pressable>

          {/* Header */}
          <View style={styles.headerSection}>
            <NeonText variant="h2" style={styles.title}>
              Create new password
            </NeonText>
            <NeonText variant="body" color="muted" style={styles.subtitle}>
              Your new password must be at least 8 characters.
            </NeonText>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            {/* New Password */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <NeonInput
                  label="New Password"
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password-new"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  containerStyle={styles.inputContainer}
                />
              )}
            />

            {/* Confirm Password */}
            <Controller
              control={control}
              name="confirm"
              render={({ field: { onChange, onBlur, value } }) => (
                <NeonInput
                  label="Confirm Password"
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password-new"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirm?.message}
                  containerStyle={styles.inputContainer}
                />
              )}
            />

            {/* Submit button */}
            <View style={styles.submitButton}>
              <NeonButton 
                onPress={handleSubmit(onSubmit)} 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save & Sign In'}
              </NeonButton>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing[6],
  },
  backButton: {
    paddingVertical: spacing[2],
    marginBottom: spacing[4],
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
  inputContainer: {
    marginBottom: spacing[4],
  },
  submitButton: {
    marginTop: spacing[4],
  },
});

