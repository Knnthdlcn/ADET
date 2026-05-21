import { router } from "expo-router";
import { type ReactNode } from "react";
import { useState } from "react";
import { Modal, Pressable, View } from "react-native";
import {
  Accessibility,
  BellRing,
  ContactRound,
  Edit3,
  Heart,
  LogOut,
  Map,
  Mic,
  ScanLine,
  Shield,
  UserRound,
  Wifi,
} from "lucide-react-native";

import { useScanResultStore } from "@entities/scan-result";
import { useSettingsStore } from "@entities/settings";
import { useAuthStore } from "@features/auth";
import { speakText } from "@features/text-to-speech";
import { colors } from "@shared/constants/colors";
import { PageHeader } from "@shared/ui/app-shell/page-header";
import { PrimaryButton } from "@shared/ui/button/primary-button";
import { AppCard, PressableCard } from "@shared/ui/card/app-card";
import { Screen } from "@shared/ui/screen";
import { AppText } from "@shared/ui/typography/app-text";

type ModalKind = "edit" | "privacy" | "server" | null;

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <AppCard className="w-[48%] px-4 py-4">
      <View className="flex-row items-center gap-3">
        {icon}
        <View>
          <AppText variant="heading">{value}</AppText>
          <AppText variant="caption" tone="muted">{label}</AppText>
        </View>
      </View>
    </AppCard>
  );
}

export function ProfileScreen() {
  const [modal, setModal] = useState<ModalKind>(null);
  const signOut = useAuthStore((state) => state.signOut);
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const scans = useScanResultStore((state) => state.recentScans);
  const favoriteIds = useScanResultStore((state) => state.favoriteIds);
  const recordingUri = useScanResultStore((state) => state.voiceMessage.uri);
  const projects = useScanResultStore((state) => state.mappingProjects);
  const contacts = useScanResultStore((state) => state.emergencyContacts);
  const serverStatus = useScanResultStore((state) => state.serverStatus);
  const settings = useSettingsStore();

  const preferenceSummary = [
    settings.voiceFeedback ? "Voice feedback on" : "Voice feedback off",
    settings.autoReadResults ? "Auto-read on" : "Auto-read off",
    settings.largeTextMode ? "Large text" : "Standard text",
    settings.highContrastMode ? "High contrast" : "Standard contrast",
    settings.reduceMotion ? "Reduced motion" : "Subtle motion",
  ].join(", ");

  return (
    <Screen className="bg-white px-5 pb-0" scroll withBottomNav>
      <Modal visible={modal !== null} transparent animationType="fade" onRequestClose={() => setModal(null)}>
        <View className="flex-1 justify-center bg-black/35 px-6">
          <Pressable className="absolute inset-0" onPress={() => setModal(null)} />
          <AppCard className="rounded-[24px] px-5 py-6">
            {modal === "edit" ? (
              <>
                <AppText variant="heading">Edit Profile</AppText>
                <AppText tone="muted" className="mt-2">
                  Frontend demo: this updates the displayed mock user name.
                </AppText>
                <PrimaryButton
                  title="Use Demo Name"
                  className="mt-5"
                  onPress={() => {
                    updateUser({ name: "Assistive Vision User" });
                    setModal(null);
                    speakText("Profile updated.");
                  }}
                />
              </>
            ) : null}

            {modal === "privacy" ? (
              <>
                <AppText variant="heading">Privacy & Data</AppText>
                <AppText tone="muted" className="mt-2">
                  Scans, voice messages, favorites, and mapping projects are mock local frontend state in this prototype. Production should add consent, deletion, export, retention, and secure backend policies.
                </AppText>
                <PrimaryButton title="Speak privacy summary" className="mt-5" onPress={() => speakText("This prototype stores mock data locally. Production should support data deletion, export, consent, and secure backend policies.")} />
              </>
            ) : null}

            {modal === "server" ? (
              <>
                <AppText variant="heading">Connected Server</AppText>
                <AppText tone="muted" className="mt-2">
                  Connected with mock latency of {serverStatus.latencyMs} milliseconds. Last checked from the Server Status screen.
                </AppText>
                <PrimaryButton title="Open Server Status" className="mt-5" onPress={() => {
                  setModal(null);
                  router.push("/server-status");
                }} />
              </>
            ) : null}

            <PrimaryButton title="Close" variant="secondary" className="mt-3" onPress={() => setModal(null)} />
          </AppCard>
        </View>
      </Modal>

      <PageHeader title="Profile" subtitle="Account" />

      <AppCard className="items-center px-6 py-8">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-primary-soft">
          <UserRound color={colors.primary} size={50} />
        </View>
        <AppText variant="heading" className="mt-4">{user.name}</AppText>
        <AppText tone="muted">{user.email}</AppText>
        <View className="mt-4 rounded-full bg-[#E8F7EF] px-4 py-2">
          <AppText variant="caption" tone="success" className="font-bold">{user.membershipStatus}</AppText>
        </View>
      </AppCard>

      <View className="mt-4 flex-row flex-wrap justify-between gap-y-3">
        <StatCard label="total scans" value={scans.length} icon={<ScanLine color={colors.primary} size={24} />} />
        <StatCard label="favorites" value={favoriteIds.length} icon={<Heart color={colors.primary} size={24} />} />
        <StatCard label="voice messages" value={recordingUri ? 1 : 0} icon={<Mic color={colors.primary} size={24} />} />
        <StatCard label="indoor maps" value={projects.length} icon={<Map color={colors.primary} size={24} />} />
      </View>

      <AppCard className="mt-4">
        <View className="flex-row items-start gap-3">
          <Accessibility color={colors.primary} size={24} />
          <View className="flex-1">
            <AppText variant="label">Accessibility preferences</AppText>
            <AppText tone="muted" className="mt-2">{preferenceSummary}</AppText>
          </View>
        </View>
      </AppCard>

      <AppCard className="mt-4">
        <View className="flex-row items-start gap-3">
          <ContactRound color={colors.primary} size={24} />
          <View className="flex-1">
            <AppText variant="label">Emergency contacts</AppText>
            <AppText tone="muted" className="mt-2">
              {contacts.map((contact) => `${contact.name} (${contact.relationship})`).join(", ")}
            </AppText>
          </View>
        </View>
      </AppCard>

      <PressableCard className="mt-4" accessibilityLabel="Open connected server status" onPress={() => setModal("server")}>
        <View className="flex-row items-center gap-3">
          <Wifi color={colors.signal.green} size={24} />
          <View className="flex-1">
            <AppText variant="label">Connected server status</AppText>
            <AppText tone="muted" className="mt-1">
              Connected - {serverStatus.latencyMs} ms mock latency
            </AppText>
          </View>
        </View>
      </PressableCard>

      <View className="mt-5 gap-3">
        <PrimaryButton title="Edit Profile" accessibilityLabel="Edit profile" icon={<Edit3 color="#FFFFFF" size={18} />} onPress={() => setModal("edit")} />
        <PrimaryButton title="Accessibility Preferences" accessibilityLabel="Open accessibility preferences" variant="secondary" icon={<Accessibility color={colors.primary} size={18} />} onPress={() => router.push("/settings")} />
        <PrimaryButton title="Emergency Contacts" accessibilityLabel="Open emergency contacts" variant="secondary" icon={<BellRing color={colors.primary} size={18} />} onPress={() => router.push("/emergency-sos")} />
        <PrimaryButton title="Privacy & Data" accessibilityLabel="Open privacy and data information" variant="secondary" icon={<Shield color={colors.primary} size={18} />} onPress={() => setModal("privacy")} />
        <PrimaryButton
          title="Logout"
          accessibilityLabel="Log out"
          variant="danger"
          icon={<LogOut color="#FFFFFF" size={18} />}
          onPress={() => {
            signOut();
            router.replace("/sign-in");
          }}
        />
      </View>
    </Screen>
  );
}
