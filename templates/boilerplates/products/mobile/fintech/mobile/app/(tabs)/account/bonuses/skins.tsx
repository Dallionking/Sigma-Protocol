import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

const DASHBOARD_SKINS = [
  { id: 'default', name: 'Default', description: 'Classic indigo', isActive: true, isLocked: false, preview: { bg: '#000000', accent: '#6366F1' } },
  { id: 'neon-hud', name: 'Neon HUD', description: 'Cyberpunk vibes', isActive: false, isLocked: false, preview: { bg: '#0A0A1A', accent: '#00FFFF' } },
  { id: 'minimal-glow', name: 'Minimal Glow', description: 'Subtle elegance', isActive: false, isLocked: false, preview: { bg: '#0D0D0D', accent: '#FFFFFF' } },
  { id: 'amber-flux', name: 'Amber Flux', description: 'Warm tones', isActive: false, isLocked: true, preview: { bg: '#0A0500', accent: '#FFB800' } },
  { id: 'crimson-edge', name: 'Crimson Edge', description: 'Bold & aggressive', isActive: false, isLocked: true, preview: { bg: '#0A0000', accent: '#FF3366' } },
  { id: 'arctic-blue', name: 'Arctic Blue', description: 'Cool precision', isActive: false, isLocked: true, preview: { bg: '#000A0F', accent: '#00BFFF' } },
];

export default function SkinsScreen() {
  const router = useRouter();
  const [skins, setSkins] = useState(DASHBOARD_SKINS);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSkinPress = (skin: typeof DASHBOARD_SKINS[0]) => {
    if (skin.isLocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(tabs)/account/bonuses/skin-preview',
      params: { id: skin.id },
    });
  };

  const activeSkin = skins.find(s => s.isActive);

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
          <NeonText variant="h2" color="white">Dashboard Skins</NeonText>
          <View style={styles.titleUnderline} />
        </MotiView>

        {/* Current Skin */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.currentSection}
        >
          <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
            ACTIVE SKIN
          </NeonText>
          <View style={[styles.currentCard, { borderColor: activeSkin?.preview.accent }]}>
            <View style={[styles.currentPreview, { backgroundColor: activeSkin?.preview.bg }]}>
              <View style={[styles.previewAccent, { backgroundColor: activeSkin?.preview.accent }]} />
              <View style={[styles.previewDot, { backgroundColor: activeSkin?.preview.accent }]} />
            </View>
            <View style={styles.currentInfo}>
              <NeonText variant="h4" color="white">{activeSkin?.name}</NeonText>
              <NeonText variant="caption" color="muted">{activeSkin?.description}</NeonText>
            </View>
          </View>
        </MotiView>

        {/* Available Skins */}
        <View style={styles.skinsSection}>
          <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
            ALL SKINS
          </NeonText>

          <View style={styles.skinsGrid}>
            {skins.map((skin, index) => (
              <MotiView
                key={skin.id}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', delay: 150 + index * 40, duration: 400 }}
                style={styles.skinCardWrapper}
              >
                <Pressable
                  style={[
                    styles.skinCard,
                    skin.isActive && styles.skinCardActive,
                    skin.isLocked && styles.skinCardLocked,
                  ]}
                  onPress={() => handleSkinPress(skin)}
                >
                  <View style={[styles.skinPreview, { backgroundColor: skin.preview.bg }]}>
                    <View style={[styles.previewLine, { backgroundColor: skin.preview.accent }]} />
                    <View style={[styles.previewCircle, { borderColor: skin.preview.accent }]} />
                    {skin.isLocked && (
                      <View style={styles.lockedOverlay}>
                        <NeonText style={styles.lockIcon}>🔒</NeonText>
                      </View>
                    )}
                    {skin.isActive && (
                      <View style={styles.activeBadge}>
                        <NeonText variant="caption" color="primary">✓</NeonText>
                      </View>
                    )}
                  </View>
                  <View style={styles.skinInfo}>
                    <NeonText variant="caption" color={skin.isLocked ? 'muted' : 'white'}>
                      {skin.name}
                    </NeonText>
                  </View>
                </Pressable>
              </MotiView>
            ))}
          </View>
        </View>

        {/* Unlock CTA */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 500, duration: 400 }}
          style={styles.unlockSection}
        >
          <View style={styles.unlockCard}>
            <View style={styles.unlockAccent} />
            <NeonText style={styles.unlockEmoji}>🎨</NeonText>
            <View style={styles.unlockContent}>
              <NeonText variant="body" color="white">Unlock All Skins</NeonText>
              <NeonText variant="caption" color="muted">
                Upgrade to Elite for exclusive themes
              </NeonText>
            </View>
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
    width: 80,
    backgroundColor: colors.primary[500],
    borderRadius: 1,
    marginTop: spacing[1],
  },
  currentSection: {
    marginTop: spacing[4],
  },
  sectionLabel: {
    letterSpacing: 1.5,
    fontSize: 11,
    marginBottom: spacing[3],
  },
  currentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 16,
    padding: spacing[3],
    gap: spacing[3],
    borderWidth: 2,
  },
  currentPreview: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  previewAccent: {
    width: 32,
    height: 3,
    borderRadius: 1.5,
    position: 'absolute',
    top: 12,
  },
  previewDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    position: 'absolute',
    bottom: 12,
  },
  currentInfo: {
    flex: 1,
    gap: 2,
  },
  skinsSection: {
    marginTop: spacing[6],
  },
  skinsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  skinCardWrapper: {
    width: '47%',
  },
  skinCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    overflow: 'hidden',
  },
  skinCardActive: {
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  skinCardLocked: {
    opacity: 0.7,
  },
  skinPreview: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  previewLine: {
    width: 40,
    height: 2,
    borderRadius: 1,
    position: 'absolute',
    top: 20,
  },
  previewCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    position: 'absolute',
    bottom: 16,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 20,
  },
  activeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  skinInfo: {
    padding: spacing[3],
    alignItems: 'center',
  },
  unlockSection: {
    marginTop: spacing[6],
  },
  unlockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[4],
    gap: spacing[3],
    position: 'relative',
    overflow: 'hidden',
  },
  unlockAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primary[500],
  },
  unlockEmoji: {
    fontSize: 28,
  },
  unlockContent: {
    flex: 1,
    gap: 2,
  },
});


