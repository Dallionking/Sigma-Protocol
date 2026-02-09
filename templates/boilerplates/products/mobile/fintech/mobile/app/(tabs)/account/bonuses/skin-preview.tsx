import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

const SKIN_DATA: Record<string, { name: string; description: string; bg: string; accent: string; text: string }> = {
  'default': { name: 'Default', description: 'Classic indigo', bg: '#000000', accent: '#6366F1', text: '#FFFFFF' },
  'neon-hud': { name: 'Neon HUD', description: 'Cyberpunk vibes', bg: '#0A0A1A', accent: '#00FFFF', text: '#E0FFFF' },
  'minimal-glow': { name: 'Minimal Glow', description: 'Subtle elegance', bg: '#0D0D0D', accent: '#FFFFFF', text: '#CCCCCC' },
  'amber-flux': { name: 'Amber Flux', description: 'Warm tones', bg: '#0A0500', accent: '#FFB800', text: '#FFEEDD' },
  'crimson-edge': { name: 'Crimson Edge', description: 'Bold & aggressive', bg: '#0A0000', accent: '#FF3366', text: '#FFCCDD' },
  'arctic-blue': { name: 'Arctic Blue', description: 'Cool precision', bg: '#000A0F', accent: '#00BFFF', text: '#CCE5FF' },
};

export default function SkinPreviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isApplying, setIsApplying] = useState(false);

  const skin = SKIN_DATA[id || 'default'] || SKIN_DATA['default'];

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleApply = async () => {
    setIsApplying(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simulate applying
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
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
          <NeonText variant="h2" color="white">{skin.name}</NeonText>
          <View style={[styles.titleUnderline, { backgroundColor: skin.accent }]} />
          <NeonText variant="body" color="muted">{skin.description}</NeonText>
        </MotiView>

        {/* Preview Mock */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.previewSection}
        >
          <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
            PREVIEW
          </NeonText>
          
          <View style={[styles.previewContainer, { backgroundColor: skin.bg, borderColor: skin.accent }]}>
            {/* Mock Header */}
            <View style={styles.mockHeader}>
              <View style={[styles.mockLogo, { backgroundColor: skin.accent }]} />
              <View style={styles.mockNav}>
                <View style={[styles.mockNavDot, { backgroundColor: skin.accent }]} />
                <View style={[styles.mockNavDot, { backgroundColor: skin.text, opacity: 0.3 }]} />
                <View style={[styles.mockNavDot, { backgroundColor: skin.text, opacity: 0.3 }]} />
              </View>
            </View>

            {/* Mock Balance */}
            <View style={styles.mockBalance}>
              <View style={[styles.mockBalanceLabel, { backgroundColor: skin.text, opacity: 0.3 }]} />
              <View style={[styles.mockBalanceValue, { backgroundColor: skin.accent }]} />
            </View>

            {/* Mock Chart */}
            <View style={styles.mockChart}>
              <View style={[styles.mockChartLine, { backgroundColor: skin.accent }]} />
              <View style={[styles.mockChartArea, { backgroundColor: skin.accent, opacity: 0.1 }]} />
            </View>

            {/* Mock Cards */}
            <View style={styles.mockCards}>
              <View style={[styles.mockCard, { borderColor: skin.accent }]}>
                <View style={[styles.mockCardDot, { backgroundColor: skin.accent }]} />
                <View style={[styles.mockCardLines, { backgroundColor: skin.text, opacity: 0.2 }]} />
              </View>
              <View style={[styles.mockCard, { borderColor: skin.text, opacity: 0.3 }]}>
                <View style={[styles.mockCardDot, { backgroundColor: skin.text, opacity: 0.5 }]} />
                <View style={[styles.mockCardLines, { backgroundColor: skin.text, opacity: 0.2 }]} />
              </View>
            </View>
          </View>
        </MotiView>

        {/* Color Palette */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.paletteSection}
        >
          <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
            COLOR PALETTE
          </NeonText>

          <View style={styles.paletteRow}>
            <View style={styles.paletteItem}>
              <View style={[styles.colorSwatch, { backgroundColor: skin.bg }]} />
              <NeonText variant="caption" color="muted">Background</NeonText>
            </View>
            <View style={styles.paletteItem}>
              <View style={[styles.colorSwatch, { backgroundColor: skin.accent }]} />
              <NeonText variant="caption" color="muted">Accent</NeonText>
            </View>
            <View style={styles.paletteItem}>
              <View style={[styles.colorSwatch, { backgroundColor: skin.text }]} />
              <NeonText variant="caption" color="muted">Text</NeonText>
            </View>
          </View>
        </MotiView>

        {/* Apply Button */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300, duration: 400 }}
          style={styles.applySection}
        >
          <NeonButton onPress={handleApply} disabled={isApplying}>
            {isApplying ? 'Applying...' : 'Apply This Skin'}
          </NeonButton>
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
    width: 60,
    borderRadius: 1,
    marginTop: spacing[1],
    marginBottom: spacing[1],
  },
  previewSection: {
    marginTop: spacing[4],
  },
  sectionLabel: {
    letterSpacing: 1.5,
    fontSize: 11,
    marginBottom: spacing[3],
  },
  previewContainer: {
    borderRadius: 20,
    padding: spacing[4],
    borderWidth: 2,
    minHeight: 300,
  },
  mockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  mockLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  mockNav: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  mockNavDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mockBalance: {
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  mockBalanceLabel: {
    width: 80,
    height: 8,
    borderRadius: 4,
  },
  mockBalanceValue: {
    width: 120,
    height: 24,
    borderRadius: 8,
  },
  mockChart: {
    height: 80,
    marginBottom: spacing[4],
    position: 'relative',
    justifyContent: 'flex-end',
  },
  mockChartLine: {
    height: 2,
    borderRadius: 1,
    marginBottom: 20,
  },
  mockChartArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    borderRadius: 4,
  },
  mockCards: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  mockCard: {
    flex: 1,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing[3],
    gap: spacing[2],
  },
  mockCardDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  mockCardLines: {
    flex: 1,
    borderRadius: 4,
  },
  paletteSection: {
    marginTop: spacing[6],
  },
  paletteRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[4],
  },
  paletteItem: {
    alignItems: 'center',
    gap: spacing[2],
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.neutral[300],
  },
  applySection: {
    marginTop: spacing[6],
  },
});


