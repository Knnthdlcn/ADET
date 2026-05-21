import { type ReactNode } from "react";
import { Pressable, type PressableProps } from "react-native";

import { cn } from "@shared/lib/cn";

type Props = PressableProps & {
  icon: ReactNode;
  label: string;
  variant?: "light" | "dark";
};

export function IconButton({
  icon,
  label,
  variant = "light",
  className,
  ...props
}: Props) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      className={cn(
        "h-12 w-12 items-center justify-center rounded-full border",
        variant === "light"
          ? "border-line bg-white"
          : "border-white/15 bg-black/35",
        className,
      )}
      {...props}
    >
      {icon}
    </Pressable>
  );
}
