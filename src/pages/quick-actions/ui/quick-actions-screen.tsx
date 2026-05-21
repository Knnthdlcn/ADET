import { router } from "expo-router";
import { Heart, HelpCircle, History, Map, Mic, Server, ShieldAlert } from "lucide-react-native";
import { View } from "react-native";

import { colors } from "@shared/constants/colors";
import { PageHeader } from "@shared/ui/app-shell/page-header";
import { PressableCard } from "@shared/ui/card/app-card";
import { Screen } from "@shared/ui/screen";
import { AppText } from "@shared/ui/typography/app-text";

const actions = [
  { title: "Recent Scans", body: "View scan history", href: "/history", icon: History },
  { title: "Favorites", body: "Open saved items", href: "/favorites", icon: Heart },
  { title: "Voice Message", body: "Try voice features", href: "/voice-message", icon: Mic },
  { title: "Indoor Mapping", body: "Train mock indoor maps", href: "/mapping", icon: Map },
  { title: "Server Status", body: "Check backend readiness", href: "/server-status", icon: Server },
  { title: "Get Help", body: "Support and accessibility tips", href: "/help", icon: HelpCircle },
  { title: "Emergency SOS", body: "Open demo SOS screen", href: "/emergency-sos", icon: ShieldAlert },
] as const;

export function QuickActionsScreen() {
  return (
    <Screen className="bg-white px-5 pb-0" scroll withBottomNav>
      <PageHeader title="Quick Actions" subtitle="All tools" />
      <View className="gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <PressableCard key={action.href} onPress={() => router.push(action.href)}>
              <View className="flex-row items-center gap-4">
                <Icon color={colors.primary} size={26} />
                <View className="flex-1">
                  <AppText variant="label">{action.title}</AppText>
                  <AppText tone="muted" className="mt-1">
                    {action.body}
                  </AppText>
                </View>
              </View>
            </PressableCard>
          );
        })}
      </View>
    </Screen>
  );
}
