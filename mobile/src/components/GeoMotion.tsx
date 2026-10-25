import { useEffect, useState } from "react";
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

export function PulseDot({ color, size = 6 }: { color: string; size?: number }) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration: 1250, useNativeDriver: true }),
        Animated.timing(progress, { toValue: 0, duration: 1250, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [progress]);

  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 2.3] });
  const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  return (
    <View style={{ width: size * 3, height: size * 3, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={[
          styles.halo,
          { width: size * 2, height: size * 2, borderRadius: size, backgroundColor: color, opacity, transform: [{ scale }] },
        ]}
      />
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
    </View>
  );
}

export function OrbitRing({
  color,
  size,
  style,
}: {
  color: string;
  size: number;
  style?: StyleProp<ViewStyle>;
}) {
  const [rotation] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const orbit = Animated.loop(
      Animated.timing(rotation, { toValue: 1, duration: 42000, useNativeDriver: true }),
    );
    orbit.start();
    return () => orbit.stop();
  }, [rotation]);

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const nodeSize = Math.max(5, size * 0.04);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.orbit,
        style,
        { width: size, height: size, borderRadius: size / 2, borderColor: color, transform: [{ rotate }] },
      ]}
    >
      <View style={[styles.node, { width: nodeSize, height: nodeSize, borderRadius: nodeSize / 2, backgroundColor: color }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  halo: { position: "absolute" },
  orbit: { position: "absolute", borderWidth: 1 },
  node: { position: "absolute", top: -3, left: "50%" },
});
