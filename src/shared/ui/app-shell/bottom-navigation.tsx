import { router, usePathname } from "expo-router";
import { Home, RotateCcw, ScanLine, Settings, UserRound } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { colors } from "@shared/constants/colors";
import { lightImpact } from "@shared/lib/feedback";
import { AppText } from "@shared/ui/typography/app-text";

const tabs = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Scan", href: "/camera", icon: ScanLine },
  { label: "History", href: "/history", icon: RotateCcw },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Profile", href: "/profile", icon: UserRound },
] as const;

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <View className="min-h-[78px] flex-row items-center border-t border-[#DADAE2] bg-white px-3 pb-1 shadow-sm">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = pathname === tab.href;

        return (
          <Pressable
            key={tab.href}
            accessibilityRole="button"
            accessibilityLabel={`Open ${tab.label}`}
            accessibilityState={{ selected: active }}
            onPress={() => {
              lightImpact();
              if (!active) {
                router.replace(tab.href);
              }
            }}
            className="flex-1 items-center justify-center py-2"
          >
            <View className={`items-center rounded-2xl px-3 py-1 ${active ? "bg-primary-soft" : "bg-white"}`}>
              <Icon
                color={active ? colors.primary : colors.muted}
                size={tab.label === "Settings" ? 30 : 28}
                fill={active && (tab.label === "Home" || tab.label === "Settings") ? colors.primary : "none"}
              />
            </View>
            <AppText variant="caption" className={`mt-1 font-bold ${active ? "text-primary" : "text-muted"}`}>
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
