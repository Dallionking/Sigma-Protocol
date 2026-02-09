import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';

type ExportFormat = 'csv' | 'pdf';
type ExportRange = '7d' | '30d' | '90d';

export default function IncomeExportScreen() {
  const router = useRouter();
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [range, setRange] = useState<ExportRange>('7d');
  const [isExporting, setIsExporting] = useState(false);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleExport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsExporting(true);
    
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsExporting(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Alert.alert(
      'Export Complete',
      `Your ${range.toUpperCase()} income history has been exported as ${format.toUpperCase()}.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <Screen safeArea style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <NeonText variant="body" color="muted">‹ Back</NeonText>
        </Pressable>
        <NeonText variant="h4" color="white">Export History</NeonText>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Icon */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.iconSection}
        >
          <View style={styles.iconCircle}>
            <NeonText variant="display" style={styles.iconEmoji}>📊</NeonText>
          </View>
        </MotiView>

        {/* Format Selection */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200 }}
        >
          <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
            FORMAT
          </NeonText>
          <Card variant="default" padding="none" style={styles.optionsCard}>
            <Pressable
              style={[styles.optionRow, styles.optionRowBorder]}
              onPress={() => setFormat('csv')}
            >
              <View style={styles.optionLeft}>
                <NeonText variant="body" color="primary">📄</NeonText>
                <View style={styles.optionText}>
                  <NeonText variant="body" color="white">CSV</NeonText>
                  <NeonText variant="caption" color="muted">Spreadsheet format</NeonText>
                </View>
              </View>
              <View style={[styles.radio, format === 'csv' && styles.radioSelected]}>
                {format === 'csv' && <View style={styles.radioInner} />}
              </View>
            </Pressable>
            <Pressable
              style={styles.optionRow}
              onPress={() => setFormat('pdf')}
            >
              <View style={styles.optionLeft}>
                <NeonText variant="body" color="primary">📑</NeonText>
                <View style={styles.optionText}>
                  <NeonText variant="body" color="white">PDF</NeonText>
                  <NeonText variant="caption" color="muted">Document format</NeonText>
                </View>
              </View>
              <View style={[styles.radio, format === 'pdf' && styles.radioSelected]}>
                {format === 'pdf' && <View style={styles.radioInner} />}
              </View>
            </Pressable>
          </Card>
        </MotiView>

        {/* Range Selection */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300 }}
        >
          <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
            TIME RANGE
          </NeonText>
          <View style={styles.rangeSelector}>
            {(['7d', '30d', '90d'] as ExportRange[]).map((r) => (
              <Pressable
                key={r}
                style={[
                  styles.rangeButton,
                  range === r && styles.rangeButtonActive,
                ]}
                onPress={() => setRange(r)}
              >
                <NeonText
                  variant="body"
                  color={range === r ? 'primary' : 'muted'}
                >
                  {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
                </NeonText>
              </Pressable>
            ))}
          </View>
        </MotiView>

        {/* Preview */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 400 }}
        >
          <Card variant="outlined" padding="md" style={styles.previewCard}>
            <NeonText variant="caption" color="muted" align="center">
              Export will include {range === '7d' ? '~8' : range === '30d' ? '~32' : '~85'} income events
            </NeonText>
          </Card>
        </MotiView>
      </View>

      {/* Export Button */}
      <View style={styles.actions}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 500 }}
        >
          <NeonButton onPress={handleExport} disabled={isExporting}>
            {isExporting ? 'Exporting...' : `Export ${format.toUpperCase()}`}
          </NeonButton>
        </MotiView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
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
  iconSection: {
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 36,
  },
  sectionLabel: {
    marginBottom: spacing[2],
    marginTop: spacing[4],
  },
  optionsCard: {
    marginBottom: spacing[2],
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  optionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  optionText: {
    gap: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.neutral[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary.DEFAULT,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary.DEFAULT,
  },
  rangeSelector: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  rangeButton: {
    flex: 1,
    paddingVertical: spacing[3],
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  rangeButtonActive: {
    backgroundColor: colors.primary[900],
    borderColor: colors.primary[800],
  },
  previewCard: {
    marginTop: spacing[4],
  },
  actions: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
});

