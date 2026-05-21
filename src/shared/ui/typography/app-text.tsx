import { Text as RNText, type TextProps } from "react-native";

import { useSettingsStore } from "@entities/settings";
import { cn } from "@shared/lib/cn";

type Variant = "display" | "title" | "heading" | "body" | "caption" | "label";
type Tone = "default" | "muted" | "primary" | "success" | "danger" | "inverse";

const variantClasses: Record<Variant, string> = {
  display: "text-[25px] leading-8 font-extrabold",
  title: "text-[22px] leading-7 font-extrabold",
  heading: "text-[18px] leading-6 font-bold",
  body: "text-[15px] leading-6",
  caption: "text-[12px] leading-4",
  label: "text-[13px] leading-5 font-bold",
};

const toneClasses: Record<Tone, string> = {
  default: "text-ink",
  muted: "text-muted",
  primary: "text-primary",
  success: "text-[#057A45]",
  danger: "text-[#E02020]",
  inverse: "text-white",
};

export function AppText({
  className,
  variant = "body",
  tone = "default",
  ...props
}: TextProps & { variant?: Variant; tone?: Tone }) {
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
