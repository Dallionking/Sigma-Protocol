import { MotiView } from "moti";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Check, X } from "lucide-react-native";

import { getPasswordRequirements } from "../lib/schemas/auth";
import { colors } from "../theme/tokens";

type Props = {
  password: string;
};

export function PasswordStrength({ password }: Props) {
  const requirements = getPasswordRequirements(password);

  const items = [
    { key: "minLength", label: "8+ characters", met: requirements.minLength },
    { key: "hasNumber", label: "1 number", met: requirements.hasNumber },
    { key: "hasLetter", label: "1 letter", met: requirements.hasLetter },
  ];

  // Calculate strength score (0-3)
  const strengthScore = items.filter((item) => item.met).length;

  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    colors.error,
    colors.warning,
    colors.secondary[400],
    colors.success,
  ];

  return (
    <View style={styles.container}>
      {/* Strength bar */}
      <View style={styles.barContainer}>
        <Text style={styles.label}>Strength:</Text>
        <View style={styles.bars}>
          {[0, 1, 2, 3].map((index) => (
            <MotiView
              key={index}
              animate={{
                backgroundColor:
                  index < strengthScore
                    ? strengthColors[strengthScore - 1]
                    : "rgba(255, 255, 255, 0.1)",
              }}
              transition={{ type: "timing", duration: 200 }}
              style={styles.bar}
            />
          ))}
        </View>
        {password.length > 0 && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 200 }}
          >
            <Text
              style={[
                styles.strengthLabel,
                { color: strengthColors[Math.max(0, strengthScore - 1)] },
              ]}
            >
              {strengthLabels[strengthScore]}
            </Text>
          </MotiView>
        )}
      </View>

      {/* Requirements checklist */}
      <View style={styles.requirements}>
        {items.map((item, index) => (
          <MotiView
            key={item.key}
            from={{ opacity: 0, translateX: -10 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: "timing", duration: 200, delay: index * 50 }}
            style={styles.requirement}
          >
            <View
              style={[
                styles.checkIcon,
                item.met ? styles.checkIconMet : styles.checkIconUnmet,
              ]}
            >
              {item.met ? (
                <Check size={12} color={colors.success} strokeWidth={3} />
              ) : (
                <X size={12} color={colors.text.muted} strokeWidth={2} />
              )}
            </View>
            <Text
              style={[
                styles.requirementText,
                item.met && styles.requirementTextMet,
              ]}
            >
              {item.label}
            </Text>
          </MotiView>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginBottom: 8,
  },
  barContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  label: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.secondary,
  },
  bars: {
    flexDirection: "row",
    gap: 4,
    flex: 1,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    marginLeft: 8,
  },
  requirements: {
    gap: 8,
  },
  requirement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  checkIconMet: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  checkIconUnmet: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  requirementText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
  },
  requirementTextMet: {
    color: colors.text.secondary,
  },
});



