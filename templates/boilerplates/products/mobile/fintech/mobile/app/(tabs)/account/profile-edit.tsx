import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen, NeonText, NeonButton, NeonInput, Card } from '@/components/primitives';
import { profileSchema, ProfileFormData } from '@/lib/validations/profile';
import { colors, spacing, layout } from '@/lib/theme';

// Mock user data
const USER_DATA = {
  name: 'Tyler',
  avatarInitial: 'T',
};

export default function ProfileEditScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: USER_DATA.name,
    },
  });

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleChangeAvatar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/account/avatar');
  };

  const onSubmit = async (data: ProfileFormData) => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Profile updated:', data);
    setIsSubmitting(false);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
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
            <NeonText variant="h2" color="white">Edit Profile</NeonText>
          </MotiView>

          {/* Avatar Section */}
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 100 }}
            style={styles.avatarSection}
          >
            <View style={styles.avatar}>
              <NeonText variant="display" color="primary" style={styles.avatarText}>
                {USER_DATA.avatarInitial}
              </NeonText>
            </View>
            <Pressable 
              onPress={handleChangeAvatar}
              style={({ pressed }) => [
                styles.changeAvatarButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <NeonText variant="body" color="primary">Change Avatar</NeonText>
            </Pressable>
          </MotiView>

          {/* Form */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 150, duration: 400 }}
          >
            <Card variant="default" padding="lg" style={styles.formCard}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <NeonInput
                    label="Name"
                    placeholder="Enter your name"
                    autoCapitalize="words"
                    autoCorrect={false}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.name?.message}
                    containerStyle={styles.inputContainer}
                  />
                )}
              />
            </Card>
          </MotiView>

          {/* Save Button */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 200, duration: 400 }}
            style={styles.buttonSection}
          >
            <NeonButton
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </NeonButton>
          </MotiView>
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
    paddingHorizontal: spacing[4],
    paddingBottom: layout.tabBarHeight + spacing[4],
  },
  header: {
    paddingVertical: spacing[2],
    gap: spacing[2],
  },
  backButton: {
    paddingVertical: spacing[2],
    alignSelf: 'flex-start',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[6],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[900],
    borderWidth: 2,
    borderColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  avatarText: {
    fontSize: 40,
  },
  changeAvatarButton: {
    paddingVertical: spacing[2],
  },
  formCard: {
    marginBottom: spacing[4],
  },
  inputContainer: {
    marginBottom: spacing[2],
  },
  buttonSection: {
    marginTop: spacing[2],
  },
});

