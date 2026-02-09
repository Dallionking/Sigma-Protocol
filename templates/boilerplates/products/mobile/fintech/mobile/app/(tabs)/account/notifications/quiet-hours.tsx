import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MotiView } from 'moti';
import { Screen, NeonText, Card } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';
import { useQuietHours, useUpdateQuietHours } from '@/lib/hooks/use-notifications';

export default function QuietHoursScreen() {
  const router = useRouter();
  const { data: quietHours } = useQuietHours();
  const updateQuietHours = useUpdateQuietHours();
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleToggleEnabled = (value: boolean) => {
    updateQuietHours.mutate({ enabled: value });
  };

  const handleStartTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
    }
    
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      updateQuietHours.mutate({ startTime: `${hours}:${minutes}` });
    }
  };

  const handleEndTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndPicker(false);
    }
    
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      updateQuietHours.mutate({ endTime: `${hours}:${minutes}` });
    }
  };

  // Convert time string to Date for picker
  const timeStringToDate = (time: string): Date => {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Format time for display
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayHour}:${minutes} ${period}`;
  };

  const isEnabled = quietHours?.enabled ?? false;
  const startTime = quietHours?.startTime ?? '22:00';
  const endTime = quietHours?.endTime ?? '07:00';

  return (
    <Screen safeArea style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
          <NeonText variant="h2" color="white">Quiet Hours</NeonText>
        </MotiView>

        {/* Icon & Description */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.iconSection}
        >
          <View style={styles.iconContainer}>
            <MotiView
              animate={{ 
                opacity: isEnabled ? [0.5, 1, 0.5] : 1,
              }}
              transition={{ 
                type: 'timing', 
                duration: 2000, 
                loop: isEnabled,
              }}
            >
              <NeonText variant="display" style={styles.icon}>🌙</NeonText>
            </MotiView>
          </View>
          <NeonText variant="body" color="muted" align="center" style={styles.description}>
            Pause notifications during certain hours to avoid disturbances.
          </NeonText>
        </MotiView>

        {/* Enable Toggle */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 150, duration: 400 }}
        >
          <Card variant="default" padding="none">
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <NeonText variant="body" color="white" style={styles.toggleTitle}>
                  Enable Quiet Hours
                </NeonText>
              </View>
              <MotiView
                animate={{ scale: isEnabled ? 1.05 : 1 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <Switch
                  value={isEnabled}
                  onValueChange={handleToggleEnabled}
                  trackColor={{ false: colors.neutral[300], true: colors.primary[700] }}
                  thumbColor={isEnabled ? colors.primary.DEFAULT : colors.neutral[500]}
                />
              </MotiView>
            </View>
          </Card>
        </MotiView>

        {/* Time Pickers */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: isEnabled ? 1 : 0.5, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.timeSection}
        >
          <Card variant="default" padding="none">
            {/* Start Time */}
            <Pressable
              onPress={() => isEnabled && setShowStartPicker(true)}
              disabled={!isEnabled}
              style={[styles.timeRow, styles.timeRowBorder]}
            >
              <View style={styles.timeInfo}>
                <NeonText variant="caption" color="muted">Start Time</NeonText>
                <NeonText variant="body" color={isEnabled ? 'white' : 'muted'} style={styles.timeValue}>
                  {formatTime(startTime)}
                </NeonText>
              </View>
              <NeonText variant="body" color="muted">›</NeonText>
            </Pressable>

            {/* End Time */}
            <Pressable
              onPress={() => isEnabled && setShowEndPicker(true)}
              disabled={!isEnabled}
              style={styles.timeRow}
            >
              <View style={styles.timeInfo}>
                <NeonText variant="caption" color="muted">End Time</NeonText>
                <NeonText variant="body" color={isEnabled ? 'white' : 'muted'} style={styles.timeValue}>
                  {formatTime(endTime)}
                </NeonText>
              </View>
              <NeonText variant="body" color="muted">›</NeonText>
            </Pressable>
          </Card>
        </MotiView>

        {/* Info Card */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 250, duration: 400 }}
          style={styles.infoSection}
        >
          <Card variant="default" padding="md" style={styles.infoCard}>
            <NeonText variant="body" color="muted" style={styles.infoText}>
              During quiet hours, notifications will be silently delivered. You'll see them when you open the app.
            </NeonText>
          </Card>
        </MotiView>

        {/* Time Pickers (Modal on iOS) */}
        {showStartPicker && (
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Pressable onPress={() => setShowStartPicker(false)}>
                <NeonText variant="body" color="primary">Done</NeonText>
              </Pressable>
            </View>
            <DateTimePicker
              value={timeStringToDate(startTime)}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleStartTimeChange}
              themeVariant="dark"
              style={styles.picker}
            />
          </View>
        )}

        {showEndPicker && (
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Pressable onPress={() => setShowEndPicker(false)}>
                <NeonText variant="body" color="primary">Done</NeonText>
              </Pressable>
            </View>
            <DateTimePicker
              value={timeStringToDate(endTime)}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleEndTimeChange}
              themeVariant="dark"
              style={styles.picker}
            />
          </View>
        )}
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
  iconSection: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
    borderWidth: 2,
    borderColor: colors.primary[700],
  },
  icon: {
    fontSize: 36,
  },
  description: {
    maxWidth: 280,
    lineHeight: 22,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontWeight: '600',
  },
  timeSection: {
    marginTop: spacing[4],
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
  },
  timeRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  timeInfo: {
    gap: spacing[1],
  },
  timeValue: {
    fontWeight: '600',
    fontSize: 18,
  },
  infoSection: {
    marginTop: spacing[4],
  },
  infoCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  infoText: {
    lineHeight: 22,
  },
  pickerContainer: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    marginTop: spacing[4],
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  picker: {
    height: 200,
    backgroundColor: colors.neutral[100],
  },
});


