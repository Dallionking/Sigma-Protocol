import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/tokens";

type Props = {
  tagline?: boolean;
};

export function Wordmark({ tagline = true }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>LEARNING PLATFORM</Text>
      {tagline ? (
        <Text style={styles.tagline}>AI-powered • personalized learning</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  title: {
    fontFamily: "Satoshi-Bold",
    fontSize: 24,
    color: colors.text.primary,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  tagline: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
    textAlign: "center",
  },
});
