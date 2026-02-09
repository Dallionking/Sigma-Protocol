import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Keyboard, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Screen, NeonText, NeonButton, NeonInput, Card } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

const SUBJECTS = [
  'General Question',
  'Billing Issue',
  'Technical Problem',
  'Broker Connection',
  'Feature Request',
  'Other',
];

const contactSchema = z.object({
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactSupportScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');

  const { control, handleSubmit, formState: { errors }, setValue } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      subject: '',
      message: '',
    },
  });

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSubjectSelect = (subject: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSubject(subject);
    setValue('subject', subject);
  };

  const onSubmit = async (data: ContactFormData) => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)/account/support/success');
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
            <NeonText variant="h2" color="white">Contact Support</NeonText>
          </MotiView>

          {/* Subject Selection */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 100, duration: 400 }}
          >
            <View style={styles.sectionHeader}>
              <NeonText variant="label" color="muted" style={styles.sectionTitle}>
                Subject
              </NeonText>
              <View style={styles.sectionUnderline} />
            </View>
            <View style={styles.subjectGrid}>
              {SUBJECTS.map((subject, index) => (
                <MotiView
                  key={subject}
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', delay: 150 + index * 30 }}
                >
                  <Pressable
                    onPress={() => handleSubjectSelect(subject)}
                    style={[
                      styles.subjectChip,
                      selectedSubject === subject && styles.subjectChipSelected,
                    ]}
                  >
                    <NeonText 
                      variant="caption" 
                      color={selectedSubject === subject ? 'primary' : 'muted'}
                      style={selectedSubject === subject ? styles.subjectTextSelected : undefined}
                    >
                      {subject}
                    </NeonText>
                  </Pressable>
                </MotiView>
              ))}
            </View>
            {errors.subject && (
              <NeonText variant="caption" style={styles.errorText}>
                {errors.subject.message}
              </NeonText>
            )}
          </MotiView>

          {/* Message */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 200, duration: 400 }}
            style={styles.messageSection}
          >
            <View style={styles.sectionHeader}>
              <NeonText variant="label" color="muted" style={styles.sectionTitle}>
                Message
              </NeonText>
              <View style={styles.sectionUnderline} />
            </View>
            <Card variant="default" padding="md" style={styles.messageCard}>
              <Controller
                control={control}
                name="message"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.messageInput}
                    placeholder="Describe your issue or question..."
                    placeholderTextColor={colors.neutral[500]}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </Card>
            {errors.message && (
              <NeonText variant="caption" style={styles.errorText}>
                {errors.message.message}
              </NeonText>
            )}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Submit'}
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
  sectionHeader: {
    marginTop: spacing[5],
    marginBottom: spacing[3],
  },
  sectionTitle: {
    marginLeft: spacing[1],
    marginBottom: spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  sectionUnderline: {
    height: 2,
    backgroundColor: colors.primary[500],
    width: 40,
    marginLeft: spacing[1],
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  subjectChip: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.neutral[100],
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
  },
  subjectChipSelected: {
    backgroundColor: colors.primary[900],
    borderColor: colors.primary[500],
  },
  subjectTextSelected: {
    fontWeight: '600',
  },
  messageSection: {
    marginTop: spacing[2],
  },
  messageCard: {
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  messageInput: {
    color: colors.neutral[900],
    fontSize: 16,
    minHeight: 140,
    lineHeight: 24,
  },
  errorText: {
    color: colors.error,
    marginTop: spacing[2],
    marginLeft: spacing[1],
  },
  buttonSection: {
    marginTop: spacing[6],
  },
});


