import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { MapPin } from "lucide-react-native";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { CategoryCard } from "@/components/learn/CategoryCard";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { MOCK_SLANG_REGIONS } from "@/lib/learn/mockContent";
import { hasTierAccess, useLearnStore } from "@/stores/learnStore";
import { colors } from "@/theme/tokens";

export default function LearnSlangRegionsScreen() {
  const router = useRouter();
  const activeTier = useLearnStore((s) => s.activeTier);

  const regions = useMemo(() => {
    return MOCK_SLANG_REGIONS
      .filter((r) => r.is_active)
      .slice()
      .sort((a, b) => a.order_index - b.order_index);
  }, []);

  return (
    <GradientBackground>
      <DevHubButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
      >
        <LearnHeader title="Slang regions" subtitle="Choose your flavor" />

        <View style={styles.content}>
          <Text style={styles.hint}>
            Real language changes by context. Pick a region and learn what people actually say.
          </Text>

          <View style={styles.list}>
            {regions.map((r, idx) => {
              const locked = !hasTierAccess(activeTier, r.tier_required);
              return (
                <CategoryCard
                  key={r.id}
                  icon={MapPin}
                  title={r.name}
                  subtitle={locked ? `Locked — ${r.tier_required.toUpperCase()} required` : r.description ?? undefined}
                  accentColor={locked ? colors.text.muted : colors.secondary[400]}
                  delay={idx * 40}
                  onPress={() => {
                    if (locked) {
                      router.replace("/profile");
                      return;
                    }
                    router.push(`/learn/slang-list?regionId=${encodeURIComponent(r.id)}`);
                  }}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  hint: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
});



