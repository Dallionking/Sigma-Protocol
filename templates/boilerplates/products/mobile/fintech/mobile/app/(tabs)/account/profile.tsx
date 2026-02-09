import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

// Mock user data
const USER_DATA = {
  name: 'Tyler',
  email: 'tyler@domain.com',
  avatarInitial: 'T',
};

export default function ProfileViewScreen() {
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleEditProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/account/profile-edit');
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
          <NeonText variant="h2" color="white">Profile</NeonText>
        </MotiView>

        {/* Avatar Section */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.avatarSection}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <NeonText variant="display" color="primary" style={styles.avatarText}>
                {USER_DATA.avatarInitial}
              </NeonText>
            </View>
            <View style={styles.avatarGlow} />
          </View>
        </MotiView>

        {/* User Info */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 150, duration: 400 }}
          style={styles.userInfoSection}
        >
          <NeonText variant="h2" color="white" style={styles.userName}>
            {USER_DATA.name}
          </NeonText>
          <NeonText variant="body" color="muted">
            {USER_DATA.email}
          </NeonText>
        </MotiView>

        {/* Profile Details Card */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
        >
          <Card variant="default" padding="lg" style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <NeonText variant="label" color="muted">Display Name</NeonText>
              <NeonText variant="body" color="white">{USER_DATA.name}</NeonText>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <NeonText variant="label" color="muted">Email</NeonText>
              <NeonText variant="body" color="white">{USER_DATA.email}</NeonText>
            </View>
          </Card>
        </MotiView>

        {/* Edit Profile Button */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 250, duration: 400 }}
          style={styles.buttonSection}
        >
          <NeonButton onPress={handleEditProfile}>
            Edit Profile
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
    gap: spacing[2],
  },
  backButton: {
    paddingVertical: spacing[2],
    alignSelf: 'flex-start',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[4],
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary[900],
    borderWidth: 2,
    borderColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  avatarText: {
    fontSize: 48,
  },
  avatarGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 70,
    backgroundColor: colors.glow,
    opacity: 0.3,
    zIndex: 0,
  },
  userInfoSection: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  userName: {
    marginBottom: spacing[1],
  },
  detailsCard: {
    marginBottom: spacing[4],
  },
  detailRow: {
    paddingVertical: spacing[2],
    gap: spacing[1],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing[2],
  },
  buttonSection: {
    marginTop: spacing[2],
  },
});

