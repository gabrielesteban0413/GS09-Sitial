import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { colors } from "../theme";

const MAX_DRAG = 100;
const ACTION_THRESHOLD = 68;

export function MapActionGesture({
  enabled,
  onAnalyze,
  onSave,
}: {
  enabled: boolean;
  onAnalyze: () => void;
  onSave: () => void;
}) {
  const dragX = useSharedValue(0);
  const triggerAnalyze = useCallback(() => onAnalyze(), [onAnalyze]);
  const triggerSave = useCallback(() => onSave(), [onSave]);
  const gesture = Gesture.Pan()
    .enabled(enabled)
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      dragX.set(Math.max(-MAX_DRAG, Math.min(MAX_DRAG, event.translationX)));
    })
    .onEnd(() => {
      if (dragX.get() <= -ACTION_THRESHOLD) runOnJS(triggerSave)();
      if (dragX.get() >= ACTION_THRESHOLD) runOnJS(triggerAnalyze)();
      dragX.set(withSpring(0, { damping: 14, stiffness: 170 }));
    });
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: dragX.get() },
      { rotate: `${interpolate(dragX.get(), [-MAX_DRAG, MAX_DRAG], [-9, 9])}deg` },
    ],
  }));

  return (
    <View style={[styles.track, !enabled && styles.disabled]}>
      <View style={styles.direction}>
        <Ionicons name="bookmark-outline" size={13} color={colors.tealDeep} />
        <Text style={styles.directionText}>Guardar</Text>
      </View>
      <GestureDetector gesture={gesture}>
        <Animated.View
          accessibilityLabel="Desliza a la izquierda para guardar o a la derecha para analizar"
          accessibilityHint="También puedes usar los botones de abajo."
          style={[styles.handle, animatedStyle]}
        >
          <Ionicons name="move-outline" size={15} color={colors.tealDeep} />
          <Text style={styles.handleText}>Desliza para una acción</Text>
        </Animated.View>
      </GestureDetector>
      <View style={styles.direction}>
        <Text style={styles.directionText}>Analizar</Text>
        <Ionicons name="analytics-outline" size={13} color={colors.plum} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 43,
    marginBottom: 8,
    paddingHorizontal: 7,
    borderRadius: 12,
    backgroundColor: "#f4f8f7",
  },
  disabled: { opacity: 0.55 },
  direction: { flexDirection: "row", alignItems: "center", gap: 3 },
  directionText: { color: colors.inkSoft, fontSize: 8, fontWeight: "700" },
  handle: {
    position: "absolute",
    zIndex: 1,
    left: "24%",
    right: "24%",
    height: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.white,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 4,
    elevation: 2,
  },
  handleText: { color: colors.ink, fontSize: 8, fontWeight: "800" },
});
