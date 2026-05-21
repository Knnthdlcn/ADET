import { router } from "expo-router";
import { CheckCircle2 } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { useScanResultStore } from "@entities/scan-result";
import { colors } from "@shared/constants/colors";
import { formatDateTime } from "@shared/lib/format-date";
import { PageHeader } from "@shared/ui/app-shell/page-header";
import { AppCard } from "@shared/ui/card/app-card";
import { Screen } from "@shared/ui/screen";
import { AppText } from "@shared/ui/typography/app-text";

export function HistoryScreen() {
  const scans = useScanResultStore((state) => state.recentScans);
  const selectScan = useScanResultStore((state) => state.selectScan);

  return (
    <Screen className="bg-white px-5 pb-0" scroll withBottomNav>
      <PageHeader title="History" subtitle="Recent scans" />
      <View className="gap-3">
        {scans.map((scan) => (
          <Pressable
            key={scan.id}
            accessibilityRole="button"
            accessibilityLabel={`Open scan result: ${scan.text}`}
            onPress={() => {
              selectScan(scan.id);
              router.push("/scan-details");
            }}
          >
            <AppCard className="flex-row items-center gap-4">
              <CheckCircle2 color={colors.primary} size={24} />
              <View className="flex-1">
                <AppText variant="label" numberOfLines={1}>{scan.text}</AppText>
                <AppText variant="caption" tone="muted" className="mt-1">
                  {formatDateTime(scan.createdAt)} - {scan.status}
                </AppText>
              </View>
            </AppCard>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
