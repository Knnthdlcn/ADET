import { router, usePathname } from "expo-router";
import {
  Bell,
  Heart,
  HelpCircle,
  History,
  Home,
  LogOut,
  Map,
  Mic,
  ScanLine,
  Server,
  Settings,
  ShieldAlert,
  UserRound,
} from "lucide-react-native";
import { Modal, Pressable, View } from "react-native";

import { useAuthStore } from "@features/auth";
import { colors } from "@shared/constants/colors";
import { AppText } from "@shared/ui/typography/app-text";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const items = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Scan", href: "/camera", icon: ScanLine },
  { label: "History", href: "/history", icon: History },
  { label: "Favorites", href: "/favorites", icon: Heart },
  { label: "Voice Message", href: "/voice-message", icon: Mic },
  { label: "Indoor Mapping", href: "/mapping", icon: Map },
  { label: "Server Status", href: "/server-status", icon: Server },
  { label: "Emergency SOS", href: "/emergency-sos", icon: ShieldAlert },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Profile", href: "/profile", icon: UserRound },
  { label: "Help", href: "/help", icon: HelpCircle },
] as const;

export function MenuModal({ visible, onClose }: Props) {
  const pathname = usePathname();
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 flex-row bg-black/35">
        <View className="w-[78%] max-w-[330px] bg-white px-6 pb-8 pt-16">
          <AppText variant="title">Assistive Vision</AppText>
          <AppText tone="muted" className="mt-1">
            Navigation menu
          </AppText>

          <View className="mt-8 gap-2">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Pressable
                  key={item.href}
                  accessibilityRole="button"
                  className={`flex-row items-center rounded-2xl px-4 py-4 ${active ? "bg-primary-soft" : "bg-white"}`}
                  onPress={() => {
                    onClose();
                    if (!active) {
                      router.push(item.href);
                    }
                  }}
                >
                  <Icon color={colors.primary} size={22} />
                  <AppText variant="label" className="ml-3">
                    {item.label}
                  </AppText>
                </Pressable>
              );
            })}

            <Pressable
              accessibilityRole="button"
              className="mt-3 flex-row items-center rounded-2xl bg-[#FFF1F1] px-4 py-4"
              onPress={() => {
                signOut();
                onClose();
                router.replace("/sign-in");
              }}
            >
              <LogOut color="#E02020" size={22} />
              <AppText variant="label" tone="danger" className="ml-3">
                Logout
              </AppText>
            </Pressable>
          </View>
        </View>
        <Pressable className="flex-1" onPress={onClose} />
      </View>
    </Modal>
  );
}
