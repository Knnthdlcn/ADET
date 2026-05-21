import { View, type ViewProps } from "react-native";

import { cn } from "@shared/lib/cn";

export function Card({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn("rounded-2xl border border-line bg-white p-5 shadow-sm", className)}
      {...props}
    />
  );
}
