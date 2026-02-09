import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

const DELIVERY_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WeeklyDigestScreen() {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(true);
  const [selectedDay, setSelectedDay] = useState('Sunday');

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEnabled(value);
  };

  const handleDaySelect = (day: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDay(day);
  };

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
          <NeonText variant="h2" color="white">Weekly Digest</NeonText>
          <View style={styles.titleUnderline} />
        </MotiView>

        {/* Preview Card */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.previewSection}
        >
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <NeonText style={styles.previewEmoji}>📧</NeonText>
              <View style={styles.previewText}>
                <NeonText variant="body" color="white">Weekly Market Insights</NeonText>
                <NeonText variant="caption" color="muted">
                  AI performance • Top trades • Market outlook
                </NeonText>
              </View>
            </View>
          </View>
        </MotiView>

        {/* Enable Toggle */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 150, duration: 400 }}
          style={styles.toggleSection}
        >
          <View style={styles.toggleCard}>
            <View style={styles.toggleContent}>
              <NeonText variant="body" color="white">Email Weekly Summary</NeonText>
              <NeonText variant="caption" color="muted">
                Receive insights every {selectedDay}
              </NeonText>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={handleToggle}
              trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
              thumbColor={colors.neutral[900]}
              ios_backgroundColor={colors.neutral[300]}
            />
          </View>
        </MotiView>

        {/* Delivery Day */}
        {isEnabled && (
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 200, duration: 400 }}
            style={styles.daysSection}
          >
            <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
              DELIVERY DAY
            </NeonText>

            <View style={styles.daysGrid}>
              {DELIVERY_DAYS.map((day, index) => (
                <MotiView
                  key={day}
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'timing', delay: 250 + index * 30, duration: 300 }}
                >
                  <Pressable
                    style={[
                      styles.dayChip,
                      selectedDay === day && styles.dayChipSelected,
                    ]}
                    onPress={() => handleDaySelect(day)}
                  >
                    <NeonText
                      variant="caption"
                      color={selectedDay === day ? 'primary' : 'muted'}
                      style={selectedDay === day ? styles.dayTextSelected : undefined}
                    >
                      {day.slice(0, 3)}
                    </NeonText>
                  </Pressable>
                </MotiView>
              ))}
            </View>
          </MotiView>
        )}

        {/* What's Included */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300, duration: 400 }}
          style={styles.includesSection}
        >
          <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
            WHAT'S INCLUDED
          </NeonText>

          <View style={styles.includesList}>
            {[
              { icon: '📊', text: 'Weekly AI performance summary' },
              { icon: '🏆', text: 'Top performing trades' },
              { icon: '📈', text: 'Market outlook for the week' },
              { icon: '💡', text: 'Trading tips & strategies' },
            ].map((item, index) => (
              <MotiView
                key={index}
                from={{ opacity: 0, translateX: -10 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', delay: 350 + index * 40, duration: 300 }}
              >
                <View style={styles.includeItem}>
                  <NeonText style={styles.includeIcon}>{item.icon}</NeonText>
                  <NeonText variant="body" color="muted">{item.text}</NeonText>
                </View>
              </MotiView>
            ))}
          </View>
        </MotiView>
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
  titleUnderline: {
    height: 2,
    width: 70,
    backgroundColor: colors.primary[500],
    borderRadius: 1,
    marginTop: spacing[1],
  },
  previewSection: {
    marginTop: spacing[4],
  },
  previewCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  previewEmoji: {
    fontSize: 40,
  },
  previewText: {
    flex: 1,
    gap: 2,
  },
  toggleSection: {
    marginTop: spacing[4],
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[4],
  },
  toggleContent: {
    flex: 1,
    gap: 2,
  },
  daysSection: {
    marginTop: spacing[6],
  },
  sectionLabel: {
    letterSpacing: 1.5,
    fontSize: 11,
    marginBottom: spacing[3],
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  dayChip: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  dayChipSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[900],
  },
  dayTextSelected: {
    fontWeight: '600',
  },
  includesSection: {
    marginTop: spacing[6],
  },
  includesList: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[4],
    gap: spacing[3],
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  includeIcon: {
    fontSize: 20,
  },
});


