import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type BouncePressableProps = Omit<PressableProps, "style"> & {
  style?: StyleProp<ViewStyle>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BouncePressable({ onPressIn, onPressOut, style, ...props }: BouncePressableProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <AnimatedPressable
      {...props}
      style={[style, animatedStyle]}
      onPressIn={(event) => {
        scale.set(withSpring(0.96, { damping: 12, stiffness: 280 }));
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.set(withSpring(1, { damping: 7, stiffness: 240 }));
        onPressOut?.(event);
      }}
    />
  );
}
