import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card, Badge, NeonLoader } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';
import { useAccounts } from '@/lib/hooks/use-brokers';

export default function BrokersListScreen() {
  const router = useRouter();
  const { data: brokers = [], isLoading, refetch, isRefetching } = useAccounts();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleBrokerPress = (broker: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (broker.status === 'reconnect_required') {
      router.push({
        pathname: '/(tabs)/account/brokers/reconnect',
        params: { brokerId: broker.id, brokerName: broker.name },
      });
    }
  };

  const handleBrokerLongPress = (broker: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push({
      pathname: '/(tabs)/account/brokers/remove',
      params: { brokerId: broker.id, brokerName: broker.name },
    });
  };

  const handleRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    refetch();
  };

  const handleAddBroker = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/account/brokers/add');
  };

  return (
    <Screen safeArea style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
          />
        }
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
          <NeonText variant="h2" color="white">Connected Brokers</NeonText>
        </MotiView>

        {/* Info Text */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 100, duration: 400 }}
          style={styles.infoSection}
        >
          <NeonText variant="body" color="muted">
            Manage your connected trading accounts. Long press to disconnect.
          </NeonText>
        </MotiView>

        {/* Loading State */}
        {isLoading ? (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 300 }}
            style={styles.loadingState}
          >
            <NeonLoader size="medium" />
            <NeonText variant="body" color="muted" style={styles.loadingText}>
              Loading your accounts...
            </NeonText>
          </MotiView>
        ) : brokers.length > 0 ? (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 150, duration: 400 }}
          >
            <Card variant="default" padding="none">
              {brokers.map((broker, index) => (
                <Pressable
                  key={broker.id}
                  onPress={() => handleBrokerPress(broker)}
                  onLongPress={() => handleBrokerLongPress(broker)}
                  delayLongPress={500}
                  style={({ pressed }) => [
                    styles.brokerRow,
                    index < brokers.length - 1 && styles.brokerRowBorder,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <View style={styles.brokerLeft}>
                    <View style={styles.brokerIcon}>
                      <NeonText variant="body">{broker.icon || '📊'}</NeonText>
                    </View>
                    <View style={styles.brokerInfo}>
                      <NeonText variant="body" color="white">
                        {broker.name} {broker.accountNumber}
                      </NeonText>
                      {broker.balance && (
                        <NeonText variant="caption" color="muted">
                          {broker.currency || '$'}{broker.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </NeonText>
                      )}
                    </View>
                  </View>
                  <Badge 
                    variant={broker.status === 'active' ? 'success' : 'warning'}
                    size="sm"
                  >
                    {broker.status === 'active' ? 'ACTIVE' : 'RECONNECT'}
                  </Badge>
                </Pressable>
              ))}
            </Card>
          </MotiView>
        ) : (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 150, duration: 400 }}
            style={styles.emptyState}
          >
            <NeonText variant="h4" color="muted" style={styles.emptyIcon}>🔗</NeonText>
            <NeonText variant="body" color="muted" style={styles.emptyText}>
              No brokers connected yet
            </NeonText>
          </MotiView>
        )}

        {/* Add Broker Button */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.addButtonSection}
        >
          <NeonButton onPress={handleAddBroker}>
            Add Broker Account
          </NeonButton>
        </MotiView>

        {/* TradeLocker Note */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 300, duration: 400 }}
          style={styles.noteSection}
        >
          <NeonText variant="caption" color="muted" style={styles.noteText}>
            All broker connections are secured via TradeLocker. Your credentials are never stored on our servers.
          </NeonText>
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
  infoSection: {
    marginBottom: spacing[4],
  },
  brokerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
  },
  brokerRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  brokerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brokerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  brokerInfo: {
    flex: 1,
    gap: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[10],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing[3],
  },
  emptyText: {
    textAlign: 'center',
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: spacing[10],
    gap: spacing[3],
  },
  loadingText: {
    textAlign: 'center',
  },
  addButtonSection: {
    marginTop: spacing[6],
  },
  noteSection: {
    marginTop: spacing[6],
    alignItems: 'center',
  },
  noteText: {
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
});

