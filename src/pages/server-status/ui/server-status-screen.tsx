import { Alert, View } from "react-native";
import { CheckCircle2, Wifi } from "lucide-react-native";

import { useScanResultStore } from "@entities/scan-result";
import { env, isApiConfigured } from "@shared/config/env";
import { colors } from "@shared/constants/colors";
import { PageHeader } from "@shared/ui/app-shell/page-header";
import { PrimaryButton } from "@shared/ui/button/primary-button";
import { AppCard } from "@shared/ui/card/app-card";
import { Screen } from "@shared/ui/screen";
import { AppText } from "@shared/ui/typography/app-text";
import { formatDateTime } from "@shared/lib/format-date";

const services = [
  ["Object Detection", "Online"],
  ["OCR", "Online"],
  ["Text-to-Speech", "Local"],
  ["Indoor Mapping", "Mock mode"],
] as const;

export function ServerStatusScreen() {
  const serverStatus = useScanResultStore((state) => state.serverStatus);
  const testServerConnection = useScanResultStore((state) => state.testServerConnection);

  return (
    <Screen className="bg-white px-5" scroll>
      <PageHeader title="Server Status" subtitle="Connection" />
      <AppCard className="px-6 py-7">
        <Wifi color={colors.signal.green} size={42} />
        <AppText variant="heading" className="mt-5">
          Server Connected
        </AppText>
        <AppText tone="muted" className="mt-1">
          {isApiConfigured ? "Camera upload will target the configured backend." : "Set the backend URL before testing image analysis."}
        </AppText>
        <View className="mt-6 rounded-2xl bg-[#F6F6FB] p-4">
          <AppText variant="caption" tone="muted">API Base URL</AppText>
          <AppText variant="label" className="mt-1">{env.apiBaseUrl}</AppText>
          <AppText variant="caption" tone="muted" className="mt-5">URL source</AppText>
          <AppText variant="label" className="mt-1">{env.apiBaseUrlSource}</AppText>
          <AppText variant="caption" tone="muted" className="mt-5">Last checked</AppText>
          <AppText variant="label" className="mt-1">{formatDateTime(serverStatus.lastChecked)}</AppText>
          <AppText variant="caption" tone="muted" className="mt-5">Mock latency</AppText>
          <AppText variant="label" className="mt-1">{serverStatus.latencyMs} ms</AppText>
        </View>
        <View className="mt-5 gap-3">
          {services.map(([name, status]) => (
            <View key={name} className="flex-row items-center justify-between rounded-2xl border border-line px-4 py-3">
              <View className="flex-row items-center gap-3">
                <CheckCircle2 color={colors.signal.green} size={20} />
                <AppText variant="label">{name}</AppText>
              </View>
              <AppText variant="caption" tone="success" className="font-bold">{status}</AppText>
            </View>
          ))}
        </View>
        <PrimaryButton
          title="Test Connection"
          className="mt-7"
          onPress={() => {
            testServerConnection();
            Alert.alert(
              "Connection test",
              isApiConfigured ? "Camera analysis will use the configured API URL." : "Add EXPO_PUBLIC_API_BASE_URL to test a real backend.",
            );
          }}
        />
      </AppCard>
    </Screen>
  );
}
