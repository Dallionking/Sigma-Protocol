import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card, Badge } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';
import { useSessions, useEndSession, useEndAllSessions } from '@/lib/hooks/use-auth';
import { getDeviceIcon } from '@/lib/utils/mock-auth-data';
import { Session } from '@/lib/types/auth';

export default function SessionsScreen() {
  const router = useRouter();
  const { data: sessions = [], isLoading, refetch, isRefetching } = useSessions();
  const { mutate: endSession, isPending: isEndingSession } = useEndSession();
  const { mutate: endAllSessions, isPending: isEndingAll } = useEndAllSessions();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleEndSession = (sessionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    endSession(sessionId, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      onError: (error: any) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        console.error('End session error:', error);
      },
    });
  };

  const handleEndAllSessions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    endAllSessions(undefined, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      onError: (error: any) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        console.error('End all sessions error:', error);
      },
    });
  };

  const otherSessions = sessions.filter(s => !s.isCurrent);

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
          <NeonText variant="h2" color="white">Active Sessions</NeonText>
        </MotiView>

        {/* Info */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 100, duration: 400 }}
          style={styles.infoSection}
        >
          <NeonText variant="body" color="muted">
            These devices are currently logged into your account.
          </NeonText>
        </MotiView>

        {/* Sessions List */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 150, duration: 400 }}
        >
          <Card variant="default" padding="none">
            {MOCK_SESSIONS.map((session, index) => (
              <View 
                key={session.id} 
                style={[
                  styles.sessionRow,
                  index < MOCK_SESSIONS.length - 1 && styles.sessionRowBorder,
                ]}
              >
                <View style={styles.sessionInfo}>
                  <View style={styles.sessionHeader}>
                    <NeonText variant="body" color="white">{session.device}</NeonText>
                    {session.isCurrent && (
                      <Badge variant="success" size="sm">This device</Badge>
                    )}
                  </View>
                  <NeonText variant="caption" color="muted">{session.location}</NeonText>
                  <NeonText variant="caption" color="muted">Last active: {session.lastActive}</NeonText>
                </View>
                {!session.isCurrent && (
                  <Pressable 
                    onPress={() => handleEndSession(session.id)}
                    style={({ pressed }) => [
                      styles.endButton,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                  >
                    <NeonText variant="caption" color="danger">End</NeonText>
                  </Pressable>
                )}
              </View>
            ))}
          </Card>
        </MotiView>

        {/* End All Sessions */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.endAllSection}
        >
          <NeonButton variant="danger" onPress={handleEndAllSessions}>
            End All Other Sessions
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
  subtitle: {
    marginTop: spacing[1],
  },
  infoSection: {
    marginTop: spacing[4],
  },
  infoCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  infoTitle: {
    fontWeight: '600',
  },
  infoText: {
    lineHeight: 20,
  },
  loadingContainer: {
    marginTop: spacing[8],
    alignItems: 'center',
  },
  emptyContainer: {
    marginTop: spacing[8],
    alignItems: 'center',
    gap: spacing[3],
  },
  emptyIcon: {
    fontSize: 48,
    opacity: 0.5,
  },
  sessionsCard: {
    marginTop: spacing[4],
  },
  sessionRow: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  sessionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  sessionIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
  },
  sessionInfo: {
    flex: 1,
    gap: spacing[1],
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  deviceName: {
    fontWeight: '600',
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary[900],
    paddingHorizontal: spacing[2],
    paddingVertical: 4,
    borderRadius: 6,
  },
  currentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary[500],
  },
  currentBadgeText: {
    color: colors.primary[500],
    fontSize: 11,
    fontWeight: '700',
  },
  sessionMeta: {
    fontSize: 13,
  },
  sessionTime: {
    fontSize: 12,
  },
  endButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  endButtonText: {
    color: colors.error,
    fontWeight: '700',
    fontSize: 12,
  },
  endAllSection: {
    marginTop: spacing[6],
  },
});

