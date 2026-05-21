import { router } from "expo-router";
import { Heart } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { useScanResultStore } from "@entities/scan-result";
import { colors } from "@shared/constants/colors";
import { PageHeader } from "@shared/ui/app-shell/page-header";
import { PrimaryButton } from "@shared/ui/button/primary-button";
import { AppCard } from "@shared/ui/card/app-card";
import { Screen } from "@shared/ui/screen";
import { AppText } from "@shared/ui/typography/app-text";

export function FavoritesScreen() {
  const recentScans = useScanResultStore((state) => state.recentScans);
  const favoriteIds = useScanResultStore((state) => state.favoriteIds);
  const selectScan = useScanResultStore((state) => state.selectScan);
  const favoriteRecords = recentScans.filter((scan) => favoriteIds.includes(scan.id));

  return (
    <Screen className="bg-white px-5 pb-0" scroll withBottomNav>
      <PageHeader title="Favorites" subtitle="Saved items" />
      {favoriteRecords.length === 0 ? (
        <AppCard className="items-center px-6 py-8">
          <Heart color={colors.primary} size={34} />
          <AppText variant="heading" className="mt-4 text-center">
            No saved items yet
          </AppText>
          <AppText tone="muted" className="mt-2 text-center">
            Save a result after scanning and it will appear here.
          </AppText>
          <PrimaryButton title="Start Scan" className="mt-6" onPress={() => router.push("/camera")} />
        </AppCard>
      ) : (
        <View className="gap-3">
          {favoriteRecords.map((favorite) => (
            <Pressable
              key={favorite.id}
              accessibilityRole="button"
              onPress={() => {
                selectScan(favorite.id);
                router.push("/scan-details");
              }}
            >
              <AppCard>
                <AppText variant="label">{favorite.text}</AppText>
              </AppCard>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}
