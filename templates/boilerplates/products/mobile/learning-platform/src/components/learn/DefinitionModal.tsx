import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { X } from "lucide-react-native";

import { GlassPanel } from "@/components/GlassPanel";
import { colors } from "@/theme/tokens";

type Props = {
  visible: boolean;
  term: string;
  translation: string;
  note?: string;
  onClose: () => void;
};

export function DefinitionModal({ visible, term, translation, note, onClose }: Props) {
  const handleClose = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <View style={styles.sheet} pointerEvents="box-none">
          <GlassPanel style={styles.panel} intensity={40} glow glowColor={colors.secondary[500]}>
            <View style={styles.headerRow}>
              <View style={styles.headerText}>
                <Text style={styles.term}>{term}</Text>
                <Text style={styles.translation}>{translation}</Text>
              </View>

              <Pressable
                onPress={handleClose}
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={styles.closeButton}
              >
                <X size={18} color={colors.text.primary} />
              </Pressable>
            </View>

            {note ? <Text style={styles.note}>{note}</Text> : null}
          </GlassPanel>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  panel: {
    padding: 16,
    borderRadius: 22,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  term: {
    fontFamily: "Satoshi-Bold",
    fontSize: 22,
    color: colors.text.primary,
    letterSpacing: -0.4,
  },
  translation: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  note: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
    marginTop: 12,
  },
});



