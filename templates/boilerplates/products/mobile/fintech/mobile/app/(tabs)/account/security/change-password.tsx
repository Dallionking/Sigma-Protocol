import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Keyboard, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Screen, NeonText, NeonButton, NeonInput, Card } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';
import { useUpdatePassword } from '@/lib/hooks/use-auth';
import { calculatePasswordStrength } from '@/lib/utils/mock-auth-data';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Too weak', color: colors.error });
  const [showSuccess, setShowSuccess] = useState(false);

  const { mutate: updatePassword, isPending } = useUpdatePassword();

  const { control, handleSubmit, watch, formState: { errors } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  // Update password strength as user types
  React.useEffect(() => {
    if (newPassword) {
      const strength = calculatePasswordStrength(newPassword);
      setPasswordStrength(strength);
    }
  }, [newPassword]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const onSubmit = async (data: ChangePasswordFormData) => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    updatePassword(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          setShowSuccess(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setTimeout(() => {
            router.back();
          }, 1500);
        },
        onError: (error: any) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          console.error('Password change error:', error);
        },
      }
    );
  };

  return (
    <Screen safeArea style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
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
            <NeonText variant="h2" color="white">Change Password</NeonText>
            <NeonText variant="caption" color="muted" style={styles.subtitle}>
              Update your account password
            </NeonText>
          </MotiView>

          {/* Success Animation */}
          {showSuccess && (
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring' }}
              style={styles.successOverlay}
            >
              <View style={styles.successCard}>
                <MotiView
                  from={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 100 }}
                >
                  <NeonText variant="display" style={styles.successIcon}>✓</NeonText>
                </MotiView>
                <NeonText variant="h3" color="white" style={styles.successText}>
                  Password Updated!
                </NeonText>
              </View>
            </MotiView>
          )}

          {/* Form */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 100, duration: 400 }}
          >
            <Card variant="default" padding="lg" style={styles.formCard}>
              <Controller
                control={control}
                name="currentPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <NeonInput
                      label="Current Password"
                      placeholder="••••••••"
                      secureTextEntry={!showCurrentPassword}
                      autoCapitalize="none"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.currentPassword?.message}
                    />
                    <TouchableOpacity
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={styles.eyeButton}
                    >
                      <NeonText variant="body">{showCurrentPassword ? '👁️' : '👁️‍🗨️'}</NeonText>
                    </TouchableOpacity>
                  </View>
                )}
              />

              <Controller
                control={control}
                name="newPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <NeonInput
                      label="New Password"
                      placeholder="••••••••"
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.newPassword?.message}
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      style={styles.eyeButton}
                    >
                      <NeonText variant="body">{showNewPassword ? '👁️' : '👁️‍🗨️'}</NeonText>
                    </TouchableOpacity>
                    
                    {/* Password Strength Indicator */}
                    {value && (
                      <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={styles.strengthContainer}
                      >
                        <View style={styles.strengthBar}>
                          {[...Array(4)].map((_, i) => (
                            <MotiView
                              key={i}
                              from={{ backgroundColor: colors.neutral[300] }}
                              animate={{
                                backgroundColor: i <= passwordStrength.score 
                                  ? passwordStrength.color 
                                  : colors.neutral[300]
                              }}
                              transition={{ type: 'timing', duration: 300 }}
                              style={styles.strengthSegment}
                            />
                          ))}
                        </View>
                        <NeonText 
                          variant="caption" 
                          style={[styles.strengthLabel, { color: passwordStrength.color }]}
                        >
                          {passwordStrength.label}
                        </NeonText>
                      </MotiView>
                    )}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <NeonInput
                      label="Confirm New Password"
                      placeholder="••••••••"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.confirmPassword?.message}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeButton}
                    >
                      <NeonText variant="body">{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</NeonText>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </Card>
          </MotiView>

          {/* Password Requirements */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 150, duration: 400 }}
            style={styles.requirementsSection}
          >
            <Card variant="default" padding="md">
              <NeonText variant="label" color="muted" style={styles.requirementsTitle}>
                Password Requirements
              </NeonText>
              <View style={styles.requirementsList}>
                <RequirementItem met={newPassword.length >= 8}>
                  At least 8 characters
                </RequirementItem>
                <RequirementItem met={/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)}>
                  Uppercase and lowercase letters
                </RequirementItem>
                <RequirementItem met={/\d/.test(newPassword)}>
                  At least one number
                </RequirementItem>
                <RequirementItem met={/[^a-zA-Z0-9]/.test(newPassword)}>
                  At least one special character
                </RequirementItem>
              </View>
            </Card>
          </MotiView>

          {/* Submit Button */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 200, duration: 400 }}
            style={styles.buttonSection}
          >
            <NeonButton
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
            >
              {isPending ? 'Saving...' : 'Save Password'}
            </NeonButton>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

// Requirement Item Component
function RequirementItem({ met, children }: { met: boolean; children: string }) {
  return (
    <MotiView
      from={{ opacity: 0, translateX: -10 }}
      animate={{ opacity: 1, translateX: 0 }}
      style={styles.requirementItem}
    >
      <MotiView
        animate={{ 
          scale: met ? 1 : 0.8,
          opacity: met ? 1 : 0.4,
        }}
        transition={{ type: 'spring' }}
      >
        <NeonText variant="body" style={[styles.requirementIcon, met && styles.requirementMet]}>
          {met ? '✓' : '○'}
        </NeonText>
      </MotiView>
      <NeonText 
        variant="caption" 
        color={met ? 'white' : 'muted'}
        style={styles.requirementText}
      >
        {children}
      </NeonText>
    </MotiView>
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
  subtitle: {
    marginTop: spacing[1],
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successCard: {
    alignItems: 'center',
    gap: spacing[4],
  },
  successIcon: {
    fontSize: 64,
    color: colors.primary[500],
  },
  successText: {
    textAlign: 'center',
  },
  formCard: {
    marginTop: spacing[4],
  },
  inputContainer: {
    marginBottom: spacing[4],
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: spacing[4],
    top: 40,
    padding: spacing[2],
  },
  strengthContainer: {
    marginTop: spacing[2],
    gap: spacing[2],
  },
  strengthBar: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  requirementsSection: {
    marginTop: spacing[4],
  },
  requirementsTitle: {
    marginBottom: spacing[3],
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  requirementsList: {
    gap: spacing[2],
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  requirementIcon: {
    fontSize: 16,
    color: colors.neutral[500],
  },
  requirementMet: {
    color: colors.primary[500],
  },
  requirementText: {
    flex: 1,
  },
  buttonSection: {
    marginTop: spacing[6],
  },
});

