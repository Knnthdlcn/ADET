import { type PropsWithChildren } from "react";
import Animated, { FadeInUp } from "react-native-reanimated";

import { useSettingsStore } from "@entities/settings";

type Props = PropsWithChildren<{
  delay?: number;
  className?: string;
}>;

export function FadeInView({ children, delay = 0, className }: Props) {
  const reduceMotion = useSettingsStore((state) => state.reduceMotion);

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInUp.delay(delay).duration(240)}
      className={className}
    >
      {children}
    </Animated.View>
  );
}
