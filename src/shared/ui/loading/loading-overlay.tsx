import { ActivityIndicator, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";

import { colors } from "@shared/constants/colors";
import { Text } from "@shared/ui/typography";

type Props = {
  visible: boolean;
  message?: string;
};

export function LoadingOverlay({ visible, message = "Analyzing image" }: Props) {
  const pulse = useSharedValue(0.92);

  useEffect(() => {
    if (visible) {
      pulse.value = withRepeat(withTiming(1, { duration: 850 }), -1, true);
    }
  }, [pulse, visible]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (!visible) {
    return null;
  }

  return (
    <View className="absolute inset-0 z-50 items-center justify-center bg-ink/55 px-8">
      <Animated.View
        style={pulseStyle}
        className="items-center rounded-3xl bg-white px-8 py-7"
      >
        <ActivityIndicator color={colors.brand.base} size="large" />
        <Text variant="heading" className="mt-4 text-center">
          {message}
        </Text>
        <Text tone="muted" className="mt-2 text-center">
          Hold tight while Assistive Vision reads the image.
        </Text>
      </Animated.View>
    </View>
  );
}
