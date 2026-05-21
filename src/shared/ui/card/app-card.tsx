import { type ReactNode } from "react";
import { Pressable, type PressableProps, View, type ViewProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useSettingsStore } from "@entities/settings";
import { cn } from "@shared/lib/cn";
import { lightImpact } from "@shared/lib/feedback";

export function AppCard({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn(
        "rounded-[18px] border border-[#E5E4EF] bg-white p-5 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

type PressableCardProps = Omit<PressableProps, "children"> & {
  children: ReactNode;
};

export function PressableCard({
  children,
  className,
  onPressIn,
  onPressOut,
  onPress,
  ...props
}: PressableCardProps) {
  const scale = useSharedValue(1);
  const reduceMotion = useSettingsStore((state) => state.reduceMotion);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={(event) => {
        if (!reduceMotion) {
          scale.value = withTiming(0.98, { duration: 90 });
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withTiming(1, { duration: 130 });
        onPressOut?.(event);
      }}
      onPress={(event) => {
        lightImpact();
        onPress?.(event);
      }}
      className={className}
      {...props}
    >
      <Animated.View
        style={animatedStyle}
        className="rounded-[18px] border border-[#D8D6F2] bg-white p-4 shadow-sm"
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
