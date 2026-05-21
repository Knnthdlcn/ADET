import { Pressable, Switch, View } from "react-native";

import { useSettingsStore, type SettingsKey } from "@entities/settings";
import { colors } from "@shared/constants/colors";
import { PageHeader } from "@shared/ui/app-shell/page-header";
import { AppCard } from "@shared/ui/card/app-card";
import { Screen } from "@shared/ui/screen";
import { AppText } from "@shared/ui/typography/app-text";

const settings: Array<{ key: SettingsKey; title: string; body: string }> = [
  { key: "voiceFeedback", title: "Enable voice feedback", body: "Speak helpful interface feedback." },
  { key: "autoReadResults", title: "Auto-read scan results", body: "Read recognized text after analysis." },
  { key: "largeTextMode", title: "Large text mode", body: "Use larger type in future layouts." },
  { key: "highContrastMode", title: "High contrast mode", body: "Increase contrast for key surfaces." },
  { key: "hapticFeedback", title: "Haptic feedback", body: "Use light vibration for important taps." },
  { key: "offlineMode", title: "Offline mode mock", body: "Pretend to use local AI models when backend is unavailable." },
  { key: "reduceMotion", title: "Reduce motion", body: "Use simpler fades and disable movement-heavy animations." },
];

export function SettingsScreen() {
  const values = useSettingsStore();

  return (
    <Screen className="bg-white px-5 pb-0" scroll withBottomNav>
      <PageHeader title="Settings" subtitle="Preferences" />
      <View className="gap-3">
        {settings.map((item) => (
          <Pressable
            key={item.key}
            accessibilityRole="switch"
            accessibilityState={{ checked: values[item.key] }}
            onPress={() => values.toggleSetting(item.key)}
          >
            <AppCard className="flex-row items-center justify-between gap-4">
              <View className="flex-1">
                <AppText variant="label">{item.title}</AppText>
                <AppText tone="muted" className="mt-1">
                  {item.body}
                </AppText>
              </View>
              <Switch
                value={values[item.key]}
                onValueChange={() => values.toggleSetting(item.key)}
                trackColor={{ true: colors.primary, false: "#D9D9E5" }}
                thumbColor="#FFFFFF"
              />
            </AppCard>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
