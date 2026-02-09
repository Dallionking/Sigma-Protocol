import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Keyboard, KeyboardAvoidingView, Platform, Linking, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Screen, NeonText, NeonButton, NeonInput } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import { verticalScale } from '@/lib/utils/responsive';

const inviteCodeSchema = z.object({
  code: z
    .string()
    .min(1, 'Please enter an invite code')
    .regex(/^TRADE-[A-Z0-9]+$/i, 'Invalid code format (e.g., TRADE-XXX)'),
});

type InviteCodeFormData = z.infer<typeof inviteCodeSchema>;

// Support email - in production would be from config
const SUPPORT_EMAIL = 'support@example.com';

export default function InviteCodeScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors }, setError } = useForm<InviteCodeFormData>({
    resolver: zodResolver(inviteCodeSchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (data: InviteCodeFormData) => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    // Simulate API validation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo, accept any valid format code
    // In production, this would validate against backend
    const isValid = data.code.toUpperCase().startsWith('TRADE-');
    
    setIsSubmitting(false);

    if (isValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Navigate to onboarding
      router.replace('/(onboarding)/welcome');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('code', { message: 'This invite code is not valid' });
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleContactSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Invite%20Code%20Help`);
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
        {/* Back button */}
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
              Enter Invite Code
            </NeonText>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <Controller
              control={control}
              name="code"
              render={({ field: { onChange, onBlur, value } }) => (
                <NeonInput
                  label="Code"
                  placeholder="TRADE-XXXX"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  value={value}
                  onChangeText={(text) => onChange(text.toUpperCase())}
                  onBlur={onBlur}
                  error={errors.code?.message}
                />
              )}
            />

            <View style={styles.submitButton}>
              <NeonButton 
                onPress={handleSubmit(onSubmit)} 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Validating...' : 'Unlock'}
              </NeonButton>
            </View>
          </View>
        </View>

        {/* Support footer */}
        <View style={styles.footer}>
          <NeonText variant="body" color="muted">
            Need help?{' '}
          </NeonText>
          <Pressable onPress={handleContactSupport}>
            <NeonText variant="body" color="primary">
              Contact Support
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
  formSection: {
    width: '100%',
    maxWidth: 400,
  },
  submitButton: {
    marginTop: spacing[6],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing[6],
  },
});

