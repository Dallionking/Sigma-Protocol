import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonLoader, Card, Badge, Icon } from '@/components/primitives';
import { colors, spacing } from '@/lib/theme';
import {
  IncomeEvent,
  DEMO_INCOME_EVENTS,
  INCOME_EVENT_TYPES,
  formatIncomeAmount,
  formatEventDate,
  formatEventTime,
} from '@/lib/constants/income';

export default function IncomeEventDetailScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [event, setEvent] = useState<IncomeEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching event
    const foundEvent = DEMO_INCOME_EVENTS.find(e => e.id === eventId);
    setTimeout(() => {
      setEvent(foundEvent || DEMO_INCOME_EVENTS[0]);
      setIsLoading(false);
    }, 300);
  }, [eventId]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (isLoading || !event) {
    return (
      <Screen safeArea style={styles.container}>
        <View style={styles.loadingContent}>
          <NeonLoader size="large" />
        </View>
      </Screen>
    );
  }

  const eventType = INCOME_EVENT_TYPES[event.type];

  return (
    <Screen safeArea style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <NeonText variant="body" color="muted">‹ Back</NeonText>
        </Pressable>
        <NeonText variant="h4" color="white">Income Event</NeonText>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Amount Hero */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.amountSection}
        >
          <View style={[styles.iconCircle, { backgroundColor: `${eventType.color}20` }]}>
            <Icon name={eventType.icon} size={36} color={eventType.color} />
          </View>
          <NeonText variant="display" color="primary" glow style={styles.amount}>
            {formatIncomeAmount(event.amount)}
          </NeonText>
          <Badge variant="success">{eventType.label}</Badge>
        </MotiView>

        {/* Details Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200 }}
        >
          <Card variant="default" padding="none" style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <NeonText variant="body" color="muted">Date</NeonText>
              <NeonText variant="body" color="white">
                {formatEventDate(event.timestamp)}
              </NeonText>
            </View>
            <View style={[styles.detailRow, styles.detailRowBorder]}>
              <NeonText variant="body" color="muted">Time</NeonText>
              <NeonText variant="body" color="white">
                {formatEventTime(event.timestamp)}
              </NeonText>
            </View>
            {event.pair && (
              <View style={[styles.detailRow, styles.detailRowBorder]}>
                <NeonText variant="body" color="muted">Trading Pair</NeonText>
                <NeonText variant="body" color="white">{event.pair}</NeonText>
              </View>
            )}
            {event.duration && (
              <View style={[styles.detailRow, styles.detailRowBorder]}>
                <NeonText variant="body" color="muted">Duration</NeonText>
                <NeonText variant="body" color="white">{event.duration}</NeonText>
              </View>
            )}
          </Card>
        </MotiView>

        {/* Description */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300 }}
        >
          <Card variant="glassmorphism" padding="md" style={styles.descriptionCard}>
            <NeonText variant="caption" color="muted" style={styles.descriptionLabel}>
              NOTES
            </NeonText>
            <NeonText variant="body" color="white" style={styles.description}>
              {event.description}
            </NeonText>
          </Card>
        </MotiView>

        {/* AI Insight */}
        {event.type === 'ai_cycle' && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 400 }}
          >
            <Card variant="glassmorphism" padding="md" showBorderBeam style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Icon name="ai" size={18} color="primary" />
                  <NeonText variant="body" color="primary">AI Insight</NeonText>
                </View>
              </View>
              <NeonText variant="caption" color="muted" style={styles.insightText}>
                This trade was executed at an optimal exit point detected by our AI. 
                The algorithm identified a reversal signal and closed the position to lock in profits.
              </NeonText>
            </Card>
          </MotiView>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
  },
  loadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  amountSection: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  amount: {
    marginBottom: spacing[3],
  },
  detailsCard: {
    marginBottom: spacing[4],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  detailRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  descriptionCard: {
    marginBottom: spacing[4],
  },
  descriptionLabel: {
    marginBottom: spacing[2],
  },
  description: {
    lineHeight: 22,
  },
  insightCard: {},
  insightHeader: {
    marginBottom: spacing[2],
  },
  insightText: {
    lineHeight: 20,
  },
});

