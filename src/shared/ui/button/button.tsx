import { type ReactNode } from "react";
import { ActivityIndicator, Pressable, type PressableProps, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useSettingsStore } from "@entities/settings";
import { colors } from "@shared/constants/colors";
import { cn } from "@shared/lib/cn";
import { lightImpact } from "@shared/lib/feedback";
import { Text } from "@shared/ui/typography";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "lg";

type Props = PressableProps & {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-700 border-brand-700",
  secondary: "bg-white border-line",
  ghost: "bg-transparent border-transparent",
  danger: "bg-signal-coral border-signal-coral",
};

const textTone: Record<ButtonVariant, "inverse" | "default" | "danger"> = {
  primary: "inverse",
  secondary: "default",
  ghost: "default",
  danger: "inverse",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "min-h-12 px-5",
  lg: "min-h-14 px-6",
};

export function Button({
  title,
  variant = "primary",
  size = "lg",
  icon,
  loading = false,
  disabled,
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
      className={cn(fullWidth && "w-full", className)}
      {...props}
    >
      <Animated.View
        style={animatedStyle}
        className={cn(
          "flex-row items-center justify-center gap-2 rounded-2xl border",
          sizeClasses[size],
          variantClasses[variant],
        )}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === "secondary" || variant === "ghost" ? colors.ink : "#FFFFFF"}
          />
        ) : (
          <>
            {icon ? <View>{icon}</View> : null}
            <Text variant="label" tone={textTone[variant]}>
              {title}
            </Text>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}
