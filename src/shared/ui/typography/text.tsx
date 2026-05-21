import { Text as RNText, type TextProps } from "react-native";

import { useSettingsStore } from "@entities/settings";
import { cn } from "@shared/lib/cn";

type TextVariant = "hero" | "title" | "heading" | "body" | "caption" | "label";
type TextTone = "default" | "muted" | "inverse" | "brand" | "danger";

type Props = TextProps & {
  variant?: TextVariant;
  tone?: TextTone;
};

const variantClasses: Record<TextVariant, string> = {
  hero: "text-[34px] leading-10 font-extrabold",
  title: "text-[28px] leading-9 font-extrabold",
  heading: "text-[22px] leading-7 font-bold",
  body: "text-base leading-6",
  caption: "text-[13px] leading-5 font-medium",
  label: "text-sm leading-5 font-semibold",
};

const toneClasses: Record<TextTone, string> = {
  default: "text-ink",
  muted: "text-muted",
  inverse: "text-white",
  brand: "text-brand-700",
  danger: "text-signal-coral",
};

export function Text({
  className,
  variant = "body",
  tone = "default",
  ...props
}: Props) {
  const largeTextMode = useSettingsStore((state) => state.largeTextMode);
  const highContrastMode = useSettingsStore((state) => state.highContrastMode);

  return (
    <RNText
      className={cn(
        variantClasses[variant],
        toneClasses[tone],
        largeTextMode && "text-[18px] leading-7",
        highContrastMode && tone === "muted" && "text-[#34343A]",
        className,
      )}
      {...props}
    />
  );
}
