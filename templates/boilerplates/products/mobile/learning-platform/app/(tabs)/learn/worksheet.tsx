import * as WebBrowser from "expo-web-browser";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { FileText, Lock } from "lucide-react-native";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { GlassPanel } from "@/components/GlassPanel";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { MOCK_WORKSHEETS } from "@/lib/learn/mockContent";
import { hasTierAccess, useLearnStore } from "@/stores/learnStore";
import { colors } from "@/theme/tokens";

export default function LearnWorksheetScreen() {
  const router = useRouter();
  const activeTier = useLearnStore((s) => s.activeTier);

  const worksheets = useMemo(() => MOCK_WORKSHEETS.slice(), []);

  return (
    <GradientBackground>
      <DevHubButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
      >
        <LearnHeader title="Worksheets" subtitle="PDF (P2)" />

        <View style={styles.content}>
          <Text style={styles.hint}>
            MVP: worksheets open as PDFs. Interactive worksheets are a later phase.
          </Text>

          <View style={{ gap: 12, marginTop: 12 }}>
            {worksheets.map((w) => {
              const locked = !hasTierAccess(activeTier, w.tier_required);
              return (
                <Pressable
                  key={w.id}
                  onPress={async () => {
                    if (locked) {
                      router.replace("/profile");
                      return;
                    }
                    await WebBrowser.openBrowserAsync(w.pdf_url);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={w.title}
                >
                  <GlassPanel style={styles.row}>
                    <View style={styles.rowIcon}>
                      {locked ? (
                        <Lock size={18} color={colors.text.muted} />
                      ) : (
                        <FileText size={18} color={colors.secondary[400]} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.title}>{w.title}</Text>
                      <Text style={styles.subtitle}>
                        {locked ? `Locked — ${w.tier_required.toUpperCase()} required` : w.description ?? "Open PDF"}
                      </Text>
                    </View>
                  </GlassPanel>
                </Pressable>
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
  },
  row: {
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  title: {
    fontFamily: "Satoshi-Bold",
    fontSize: 16,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 6,
  },
});



