import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen,
  Users,
  Bug,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { SettingsRow, SettingsDivider } from "@/components/profile";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { MOCK_FAQ_ITEMS, FAQItem } from "@/lib/profile/mockData";
import { colors } from "@/theme/tokens";

export default function HelpSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFAQs = MOCK_FAQ_ITEMS.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleToggleExpand = useCallback((id: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  const handleQuickLink = useCallback((action: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Would navigate or open external link
  }, []);

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
          style={styles.searchSection}
        >
          <GlassPanel style={styles.searchCard}>
            <Search size={18} color={colors.text.muted} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for help..."
              placeholderTextColor={colors.text.muted}
            />
          </GlassPanel>
        </MotiView>

        {/* Quick Links */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 50 })}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>Quick Links</Text>
          <GlassPanel style={styles.card}>
            <SettingsRow
              icon={BookOpen}
              label="Tutorial"
              subtitle="Learn the basics"
              onPress={() => handleQuickLink("tutorial")}
            />
            <SettingsDivider />
            <SettingsRow
              icon={Users}
              label="Community"
              subtitle="Join our Discord"
              onPress={() => handleQuickLink("community")}
            />
            <SettingsDivider />
            <SettingsRow
              icon={Bug}
              label="Report a Bug"
              subtitle="Help us improve"
              onPress={() => router.push("/profile/settings-contact")}
            />
          </GlassPanel>
        </MotiView>

        {/* FAQ */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ delay: 100 })}
          style={styles.section}
        >
          <Text style={styles.sectionLabel}>
            Frequently Asked Questions ({filteredFAQs.length})
          </Text>
          <GlassPanel style={styles.card}>
            {filteredFAQs.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No results found</Text>
              </View>
            ) : (
              filteredFAQs.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index > 0 && <SettingsDivider />}
                  <FAQAccordion
                    item={item}
                    isExpanded={expandedId === item.id}
                    onToggle={() => handleToggleExpand(item.id)}
                  />
                </React.Fragment>
              ))
            )}
          </GlassPanel>
        </MotiView>
      </ScrollView>
    </GradientBackground>
  );
}

function FAQAccordion({
  item,
  isExpanded,
  onToggle,
}: {
  item: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View>
      <Pressable onPress={onToggle} style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        {isExpanded ? (
          <ChevronUp size={20} color={colors.text.muted} />
        ) : (
          <ChevronDown size={20} color={colors.text.muted} />
        )}
      </Pressable>
      {isExpanded && (
        <MotiView
          from={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          style={styles.faqBody}
        >
          <Text style={styles.faqAnswer}>{item.answer}</Text>
        </MotiView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 18,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  searchSection: {
    marginBottom: 24,
  },
  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
  },
  searchInput: {
    flex: 1,
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 21,
  },
  faqBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswer: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 21,
  },
});

