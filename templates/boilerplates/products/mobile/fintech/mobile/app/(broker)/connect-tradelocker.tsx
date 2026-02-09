import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useForm, Controller } from 'react-hook-form';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, NeonInput, Card } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import { verticalScale, moderateScale } from '@/lib/utils/responsive';

interface TradeLockerCredentials {
  email: string;
  password: string;
}

export default function ConnectTradeLockerScreen() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<TradeLockerCredentials>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const onSubmit = async (data: TradeLockerCredentials) => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsConnecting(true);

    // Simulate TradeLocker authentication
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('TradeLocker credentials:', data);
    
    // Simulate success/failure (80% success rate for demo)
    const isSuccess = Math.random() > 0.2;
    
    if (isSuccess) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(broker)/connect-success');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      router.replace('/(broker)/connect-failure');
    }
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
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <NeonText variant="body" color="muted">‹ Back</NeonText>
          </Pressable>
          <NeonText variant="h4" color="white">TradeLocker</NeonText>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          {/* Logo */}
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 100 }}
            style={styles.logoSection}
          >
            <View style={styles.logoCircle}>
              <NeonText variant="h2" style={styles.logoEmoji}>🔐</NeonText>
            </View>
          </MotiView>

          {/* Form Card */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 200 }}
          >
            <Card variant="default" padding="lg" style={styles.formCard}>
              <NeonText variant="body" color="muted" align="center" style={styles.formSubtitle}>
                Sign in with your TradeLocker credentials
              </NeonText>

              {/* Email */}
              <Controller
                control={control}
                name="email"
                rules={{ required: 'Email is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <NeonInput
                    label="TradeLocker Email"
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

              {/* Password */}
              <Controller
                control={control}
                name="password"
                rules={{ required: 'Password is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <NeonInput
                    label="Password"
                    placeholder="••••••••"
                    secureTextEntry
                    autoCapitalize="none"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    containerStyle={styles.inputContainer}
                  />
                )}
              />

              {/* Submit */}
              <NeonButton 
                onPress={handleSubmit(onSubmit)} 
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : 'Connect Account'}
              </NeonButton>
            </Card>
          </MotiView>

          {/* Security Note */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', delay: 400 }}
            style={styles.securityNote}
          >
            <NeonText variant="caption" color="muted" align="center">
              🔒 Your credentials are encrypted and never stored
            </NeonText>
          </MotiView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  backButton: {
    paddingVertical: spacing[2],
    width: 60,
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  logoCircle: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(35),
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  logoEmoji: {
    fontSize: moderateScale(32),
  },
  formCard: {},
  formSubtitle: {
    marginBottom: spacing[4],
  },
  inputContainer: {
    marginBottom: spacing[4],
  },
  securityNote: {
    marginTop: spacing[4],
  },
});

