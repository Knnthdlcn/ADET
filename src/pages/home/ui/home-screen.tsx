import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  Bell,
  Camera,
  GalleryHorizontal,
  HelpCircle,
  History,
  Map,
  Menu,
  Mic,
  Server,
  Star,
  UsersRound,
  Volume2,
  Wifi,
} from "lucide-react-native";
import { Alert, Modal, Pressable, View } from "react-native";
import { useState } from "react";

import { useNotificationStore } from "@entities/notifications";
import { useScanResultStore } from "@entities/scan-result";
import { speakText } from "@features/text-to-speech";
import { env, isApiConfigured } from "@shared/config/env";
import { colors } from "@shared/constants/colors";
import { MenuModal } from "@shared/ui/app-shell/menu-modal";
import { VoiceAssistantModal } from "@shared/ui/app-shell/voice-assistant-modal";
import { PrimaryButton } from "@shared/ui/button/primary-button";
import { AppCard } from "@shared/ui/card/app-card";
import { PressableCard } from "@shared/ui/card/app-card";
import { FadeInView, Screen } from "@shared/ui/screen";
import { AppText } from "@shared/ui/typography/app-text";

function ProfileAvatar({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="h-[70px] w-[70px] overflow-hidden rounded-full bg-[#E9EEF8]"
    >
      <View className="mt-2 items-center">
        <View className="h-8 w-8 rounded-full bg-[#F5D7C5]" />
        <View className="mt-1 h-10 w-12 rounded-t-[22px] bg-[#222A38]" />
      </View>
    </Pressable>
  );
}

function StatusCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="mt-5 min-h-[58px] flex-row items-center rounded-[7px] bg-[#CFE4D2] px-5"
    >
      <Wifi color={colors.signal.green} size={32} strokeWidth={3} />
      <View className="ml-5 flex-1">
        <AppText variant="caption" tone="success" className="font-bold">
          Server Connected
        </AppText>
        <AppText variant="caption" tone="muted">
          All systems operational
        </AppText>
      </View>
      <Volume2 color={colors.signal.green} size={28} strokeWidth={3} />
    </Pressable>
  );
}

function ScanCard({
  onVoiceMessage,
  onGallery,
}: {
  onVoiceMessage: () => void;
  onGallery: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push("/camera")}
      className="mt-4 overflow-hidden rounded-[15px] bg-primary px-6 py-6"
    >
      <View className="flex-row">
        <View className="flex-1">
          <AppText className="text-[22px] font-bold leading-7 text-white">
            Scan Now
          </AppText>
          <AppText className="mt-2 max-w-[190px] text-[15px] leading-5 text-white">
            Capture and recognize text instantly
          </AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/camera")}
          className="h-[88px] w-[88px] items-center justify-center rounded-full bg-[#2A27BE]"
        >
          <View className="h-[70px] w-[70px] items-center justify-center rounded-full bg-[#E9E9EC]">
            <Camera color={colors.primary} size={38} fill={colors.primary} />
          </View>
        </Pressable>
      </View>

      <View className="mt-5 flex-row items-center gap-6">
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center gap-2"
          onPress={(event) => {
            event.stopPropagation();
            onVoiceMessage();
          }}
        >
          <View className="h-8 w-8 items-center justify-center rounded-[9px] bg-white/25">
            <Mic color="#FFFFFF" size={24} />
          </View>
          <AppText variant="caption" className="font-bold text-white">
            Voice Message
          </AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center gap-2"
          onPress={(event) => {
            event.stopPropagation();
            onGallery();
          }}
        >
          <View className="h-8 w-8 items-center justify-center rounded-[9px] bg-white">
            <GalleryHorizontal color={colors.primary} size={23} />
          </View>
          <AppText variant="caption" className="font-bold text-white">
            Gallery
          </AppText>
        </Pressable>
      </View>
    </Pressable>
  );
}

function QuickAction({
  title,
  subtitle,
  icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <PressableCard className="w-[48%]" onPress={onPress}>
      <View className="flex-row items-start gap-3">
        <View className="pt-1">{icon}</View>
        <View className="min-w-0 flex-1">
          <AppText variant="label">{title}</AppText>
          <AppText variant="caption" className="mt-1 text-center text-ink">
            {subtitle}
          </AppText>
        </View>
      </View>
    </PressableCard>
  );
}

export function HomeScreen() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [statusVisible, setStatusVisible] = useState(false);
  const [voiceVisible, setVoiceVisible] = useState(false);
  const [sosVisible, setSosVisible] = useState(false);
  const unread = useNotificationStore((state) => state.unread);
  const markRead = useNotificationStore((state) => state.markRead);
  const completeScan = useScanResultStore((state) => state.completeScan);

  async function handleGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Gallery permission", "Please allow photo library access to choose an image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      quality: 0.9,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    const text = "Text found: Exit sign on the left wall.";
    completeScan({
      text,
      summary: "An exit sign is visible on the left wall of the hallway.",
      recognizedText: "EXIT",
      objects: ["exit sign", "left wall", "hallway"],
      warnings: [],
      confidence: 0.93,
      imageUri: result.assets[0].uri,
      status: "mock",
    });
    speakText(text);
    router.push("/result");
  }

  return (
    <Screen
      className="bg-white px-6 pb-0 pt-5"
      scroll
      withBottomNav
      floatingAction={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open voice assistant"
          className="absolute bottom-[92px] right-7 h-[58px] w-[58px] items-center justify-center rounded-full bg-primary shadow-lg"
          onPress={() => setVoiceVisible(true)}
        >
          <Mic color="#FFFFFF" size={35} strokeWidth={2.5} />
        </Pressable>
      }
    >
      <MenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} />
      <VoiceAssistantModal visible={voiceVisible} onClose={() => setVoiceVisible(false)} />
      <Modal visible={statusVisible} transparent animationType="fade" onRequestClose={() => setStatusVisible(false)}>
        <View className="flex-1 justify-end bg-black/35 px-5 pb-8">
          <Pressable className="absolute inset-0" onPress={() => setStatusVisible(false)} />
          <AppCard className="rounded-[24px] px-5 py-6">
            <AppText variant="heading">Server Connected</AppText>
            <AppText tone="muted" className="mt-2">
              All systems operational
            </AppText>
            <View className="mt-5 rounded-2xl bg-[#F5F5FA] p-4">
              <AppText variant="caption" tone="muted">
                API Base URL
              </AppText>
              <AppText variant="label" className="mt-1">
                {env.apiBaseUrl}
              </AppText>
              <AppText variant="caption" tone="muted" className="mt-4">
                URL source
              </AppText>
              <AppText variant="label" className="mt-1">
                {env.apiBaseUrlSource}
              </AppText>
              <AppText variant="caption" tone="muted" className="mt-4">
                Last checked
              </AppText>
              <AppText variant="label" className="mt-1">
                {new Date().toLocaleString()}
              </AppText>
            </View>
            <PrimaryButton
              title="Test Connection"
              className="mt-5"
              onPress={() =>
                Alert.alert(
                  "Connection test",
                  isApiConfigured
                    ? "Camera analysis will use the configured API URL."
                    : "Add EXPO_PUBLIC_API_BASE_URL to test a real backend.",
                )
              }
            />
            <PrimaryButton title="Close" variant="secondary" className="mt-3" onPress={() => setStatusVisible(false)} />
          </AppCard>
        </View>
      </Modal>
      <Modal visible={sosVisible} transparent animationType="fade" onRequestClose={() => setSosVisible(false)}>
        <View className="flex-1 justify-center bg-black/35 px-6">
          <AppCard className="rounded-[24px] px-5 py-6">
            <AppText variant="heading">Do you want to trigger Emergency SOS?</AppText>
            <AppText tone="muted" className="mt-2">
              Frontend demo only. No real emergency call will be made.
            </AppText>
            <View className="mt-6 flex-row gap-3">
              <PrimaryButton
                title="Cancel"
                variant="secondary"
                fullWidth={false}
                className="flex-1"
                onPress={() => setSosVisible(false)}
              />
              <PrimaryButton
                title="Continue"
                fullWidth={false}
                className="flex-1"
                onPress={() => {
                  setSosVisible(false);
                  router.push("/emergency-sos");
                }}
              />
            </View>
          </AppCard>
        </View>
      </Modal>

      <FadeInView>
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center"
            onPress={() => setMenuVisible(true)}
          >
            <Menu color={colors.ink} size={30} strokeWidth={3} />
          </Pressable>
          <View className="flex-row items-center gap-4">
            <Pressable
              accessibilityRole="button"
              className="h-11 w-11 items-center justify-center"
              onPress={() => {
                markRead();
                router.push("/notifications");
              }}
            >
              <Bell color={colors.ink} size={29} strokeWidth={2.5} />
              {unread ? (
                <View className="absolute right-2 top-2 h-[10px] w-[10px] rounded-full bg-[#E02020]" />
              ) : null}
            </Pressable>
          </View>
        </View>

        <View className="mt-4 flex-row items-start justify-between">
          <View>
            <AppText className="text-[18px] leading-6">Good Morning</AppText>
            <AppText className="text-[26px] font-extrabold leading-8">
              Welcome Back!
            </AppText>
          </View>
          <ProfileAvatar onPress={() => router.push("/profile")} />
        </View>

        <StatusCard onPress={() => setStatusVisible(true)} />
        <ScanCard onVoiceMessage={() => router.push("/voice-message")} onGallery={handleGallery} />

        <View className="mt-5 flex-row items-center justify-between">
          <AppText variant="heading">Quick Actions</AppText>
          <Pressable accessibilityRole="button" onPress={() => router.push("/quick-actions")}>
            <AppText variant="label" tone="primary">
              View All
            </AppText>
          </Pressable>
        </View>

        <View className="mt-4 flex-row flex-wrap justify-between gap-y-4">
          <QuickAction
            title="Recent Scans"
            subtitle="View History"
            icon={<History color={colors.primary} size={24} />}
            onPress={() => router.push("/history")}
          />
          <QuickAction
            title="Favorites"
            subtitle="Saved Items"
            icon={<Star color={colors.primary} size={24} />}
            onPress={() => router.push("/favorites")}
          />
          <QuickAction
            title="Get Help"
            subtitle={"Support &\nAssistance"}
            icon={<UsersRound color={colors.primary} size={24} />}
            onPress={() => router.push("/help")}
          />
          <QuickAction
            title="Emergency SOS"
            subtitle="Quick help"
            icon={<HelpCircle color={colors.primary} size={24} />}
            onPress={() => setSosVisible(true)}
          />
          <QuickAction
            title="AI Mapping"
            subtitle="Indoor maps"
            icon={<Map color={colors.primary} size={24} />}
            onPress={() => router.push("/mapping")}
          />
          <QuickAction
            title="Server"
            subtitle="API status"
            icon={<Server color={colors.primary} size={24} />}
            onPress={() => router.push("/server-status")}
          />
        </View>
      </FadeInView>
    </Screen>
  );
}
