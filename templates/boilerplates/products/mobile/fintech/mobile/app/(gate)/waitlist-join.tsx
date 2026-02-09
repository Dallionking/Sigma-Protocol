import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Screen, NeonText, NeonButton, NeonInput } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import { verticalScale } from '@/lib/utils/responsive';

const waitlistSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

export default function WaitlistJoinScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleAppleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Placeholder for Apple Sign In - in production would use expo-apple-authentication
    console.log('Apple Sign In pressed');
    // For now, just navigate to status
    router.push('/(gate)/waitlist-status');
  };

  const onSubmit = async (data: WaitlistFormData) => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Waitlist signup:', data.email);
    setIsSubmitting(false);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/(gate)/waitlist-status');
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSkipDemo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(onboarding)/welcome');
  };

  return (
    <Screen safeArea padded={false} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
        >
        {/* Top nav */}
        <View style={styles.topNav}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <NeonText variant="body" color="primary">
              ← Back
            </NeonText>
          </Pressable>
          <Pressable onPress={handleSkipDemo} style={styles.skipDemoButton}>
            <NeonText variant="label" color="muted">
              Skip (Demo)
            </NeonText>
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerSection}>
            <NeonText variant="h2" style={styles.title}>
              Join Waitlist
            </NeonText>
            <NeonText variant="body" color="muted" style={styles.subtitle}>
              Get early access when your spot opens.
            </NeonText>
          </View>

          {/* Apple Sign In */}
          <View style={styles.formSection}>
            <NeonButton onPress={handleAppleSignIn}>
              Continue with Apple
            </NeonButton>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <NeonText variant="label" color="muted" style={styles.dividerText}>
                or
              </NeonText>
              <View style={styles.dividerLine} />
            </View>

            {/* Email form */}
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
                {isSubmitting ? 'Joining...' : 'Join'}
              </NeonButton>
            </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing[4],
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  backButton: {
    paddingVertical: spacing[2],
  },
  skipDemoButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing[6],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral[200],
  },
  dividerText: {
    marginHorizontal: spacing[4],
  },
  submitButton: {
    marginTop: spacing[6],
  },
});

