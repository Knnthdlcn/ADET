import { type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useSettingsStore } from "@entities/settings";
import { cn } from "@shared/lib/cn";
import { lightImpact } from "@shared/lib/feedback";
import { AppText } from "@shared/ui/typography/app-text";

type Props = PressableProps & {
  title: string;
  icon?: ReactNode;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  fullWidth?: boolean;
};

const variantClasses = {
  primary: "bg-primary border-primary",
  secondary: "bg-white border-line",
  ghost: "bg-transparent border-transparent",
  danger: "bg-[#E02020] border-[#E02020]",
} as const;

export function PrimaryButton({
  title,
  icon,
  loading = false,
  disabled,
  variant = "primary",
  fullWidth = true,
  className,
  onPressIn,
  onPressOut,
  onPress,
  ...props
}: Props) {
  const scale = useSharedValue(1);
  const reduceMotion = useSettingsStore((state) => state.reduceMotion);
  const isDisabled = disabled || loading;
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: isDisabled ? 0.6 : 1,
  }));

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={cn(fullWidth && "w-full", className)}
      onPressIn={(event) => {
        if (!reduceMotion) {
          scale.value = withTiming(0.98, { duration: 90 });
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withTiming(1, { duration: 120 });
        onPressOut?.(event);
      }}
      onPress={(event) => {
        lightImpact();
        onPress?.(event);
      }}
      {...props}
    >
      <Animated.View
        style={animatedStyle}
        className={cn(
          "min-h-14 flex-row items-center justify-center gap-2 rounded-[10px] border px-5",
          variantClasses[variant],
        )}
      >
        {loading ? (
          <ActivityIndicator color={variant === "primary" ? "#FFFFFF" : "#332FDB"} />
        ) : (
          <>
            {icon ? <View>{icon}</View> : null}
            <AppText
              variant="label"
              tone={variant === "primary" || variant === "danger" ? "inverse" : "primary"}
            >
              {title}
            </AppText>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}
