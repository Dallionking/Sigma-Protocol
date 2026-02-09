import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen, NeonText, NeonButton, NeonInput, Card } from '@/components/primitives';
import { signUpSchema, SignUpFormData } from '@/lib/validations/auth';
import { colors, spacing } from '@/lib/theme';

export default function SignUpScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);

  React.useEffect(() => {
    AppleAuthentication.isAvailableAsync().then(setIsAppleAvailable);
  }, []);

  const { control, handleSubmit, formState: { errors } } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleAppleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      console.log('Apple Sign In success:', credential);
      router.replace('/(auth)/oauth-callback');
    } catch (error: any) {
      if (error.code !== 'ERR_CANCELED') {
        console.log('Apple Sign In error:', error);
        await new Promise(resolve => setTimeout(resolve, 500));
        router.replace('/(auth)/oauth-callback');
      }
    }
  };

  const onSubmit = async (data: SignUpFormData) => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Sign up with:', data);
    setIsSubmitting(false);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(auth)/oauth-callback');
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(auth)/signin');
  };

  return (
    <Screen safeArea style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.backButton}>
              <NeonText variant="body" color="muted">‹ Back</NeonText>
            </Pressable>
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <NeonText variant="h2" color="white" style={styles.title}>
              Create Account
            </NeonText>
            <NeonText variant="body" color="muted">
              Start your automated trading journey
            </NeonText>
          </View>

          {/* Form Card */}
          <Card variant="default" padding="lg" style={styles.formCard}>
            {/* Apple Sign In */}
            {isAppleAvailable && (
              <>
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                  cornerRadius={12}
                  style={styles.appleButton}
                  onPress={handleAppleSignIn}
                />

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <NeonText variant="caption" color="muted">or</NeonText>
                  <View style={styles.dividerLine} />
                </View>
              </>
            )}

            {/* Email input */}
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
                  containerStyle={styles.inputContainer}
                />
              )}
            />

            {/* Password input */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <NeonInput
                  label="Password"
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

            {/* Submit button */}
            <View style={styles.submitButton}>
              <NeonButton 
                onPress={handleSubmit(onSubmit)} 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </NeonButton>
            </View>
          </Card>

          {/* Trust badges */}
          <View style={styles.trustSection}>
            <View style={styles.trustBadge}>
              <NeonText variant="caption" color="muted">🔒 Encrypted</NeonText>
            </View>
            <View style={styles.trustBadge}>
              <NeonText variant="caption" color="muted">🚫 No spam</NeonText>
            </View>
            <View style={styles.trustBadge}>
              <NeonText variant="caption" color="muted">✓ Cancel anytime</NeonText>
            </View>
          </View>

          {/* Sign in link */}
          <View style={styles.signInContainer}>
            <NeonText variant="body" color="muted">
              Already have an account?{' '}
            </NeonText>
            <Pressable onPress={handleSignIn}>
              <NeonText variant="body" color="primary">
                Sign In
              </NeonText>
            </Pressable>
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
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
  header: {
    paddingVertical: spacing[2],
  },
  backButton: {
    paddingVertical: spacing[2],
  },
  titleSection: {
    marginTop: spacing[4],
    marginBottom: spacing[6],
  },
  title: {
    marginBottom: spacing[2],
  },
  formCard: {
    marginBottom: spacing[4],
  },
  appleButton: {
    height: 50,
    width: '100%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing[5],
    gap: spacing[3],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral[300],
  },
  inputContainer: {
    marginBottom: spacing[4],
  },
  submitButton: {
    marginTop: spacing[2],
  },
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  trustBadge: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

