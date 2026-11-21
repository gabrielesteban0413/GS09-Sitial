import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { colors } from "../theme";

export function AnalysisProgress() {
  const rotation = useSharedValue(0);
  const progress = useSharedValue(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.get()}deg` }],
  }));
  const progressStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(progress.get(), [0, 1], [-trackWidth * 0.45, trackWidth]),
      },
    ],
  }));

  useEffect(() => {
    rotation.set(withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1, false));
    progress.set(withRepeat(withTiming(1, { duration: 1250, easing: Easing.linear }), -1, false));
    return () => {
      cancelAnimation(rotation);
      cancelAnimation(progress);
    };
  }, [progress, rotation]);

  return (
    <View
      accessibilityLabel="Analizando la ubicación"
      accessibilityRole="progressbar"
      style={styles.container}
    >
      <Animated.View style={spinnerStyle}>
        <Ionicons name="sync-outline" size={17} color={colors.teal} />
      </Animated.View>
      <View style={styles.copy}>
        <Text style={styles.title}>Consultando el entorno</Text>
        <Text style={styles.note}>El análisis puede tardar unos segundos.</Text>
      </View>
      <View
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        style={styles.track}
      >
        <Animated.View style={[styles.indicator, progressStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    minHeight: 50,
    borderRadius: 12,
    marginBottom: 9,
    paddingHorizontal: 11,
    backgroundColor: colors.mint,
  },
  copy: { flex: 1 },
  title: { color: colors.ink, fontSize: 10, fontWeight: "800" },
  note: { color: colors.inkSoft, fontSize: 8, marginTop: 2 },
  track: { width: 52, height: 4, overflow: "hidden", borderRadius: 2, backgroundColor: "#cbdedb" },
  indicator: { width: "45%", height: 4, borderRadius: 2, backgroundColor: colors.teal },
});
