import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Pin } from "lucide-react-native";

import { colors } from "@/theme/tokens";

export function PinnedBadge() {
  return (
    <View style={styles.container}>
      <Pin size={12} color={colors.accent[400]} />
      <Text style={styles.text}>Pinned</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(250, 204, 21, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  text: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 11,
    color: colors.accent[400],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

