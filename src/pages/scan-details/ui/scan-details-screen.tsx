import { router } from "expo-router";
import { Image, Share, View } from "react-native";

import { useScanResultStore } from "@entities/scan-result";
import { speakText } from "@features/text-to-speech";
import { PageHeader } from "@shared/ui/app-shell/page-header";
import { PrimaryButton } from "@shared/ui/button/primary-button";
import { AppCard } from "@shared/ui/card/app-card";
import { Screen } from "@shared/ui/screen";
import { AppText } from "@shared/ui/typography/app-text";
import { formatDateTime } from "@shared/lib/format-date";

export function ScanDetailsScreen() {
  const selectedScanId = useScanResultStore((state) => state.selectedScanId);
  const recentScans = useScanResultStore((state) => state.recentScans);
  const favoriteIds = useScanResultStore((state) => state.favoriteIds);
  const toggleFavorite = useScanResultStore((state) => state.toggleFavorite);
  const scan = recentScans.find((item) => item.id === selectedScanId) ?? recentScans[0];
  const isFavorite = scan ? favoriteIds.includes(scan.id) : false;

  return (
    <Screen className="bg-white px-5" scroll>
      <PageHeader title="Scan Details" subtitle="Recognized result" />
      {!scan ? (
        <AppCard className="items-center px-6 py-8">
          <AppText variant="heading">No scan selected</AppText>
          <AppText tone="muted" className="mt-2 text-center">
            Open a scan from History or Favorites to view details.
          </AppText>
        </AppCard>
      ) : (
        <View>
          {scan.imageUri ? (
            <Image source={{ uri: scan.imageUri }} className="h-56 w-full rounded-[24px]" resizeMode="cover" />
          ) : null}
          <AppCard className="mt-4">
            <AppText variant="caption" tone="muted">
              {formatDateTime(scan.createdAt)} - {scan.status}
            </AppText>
            <AppText variant="label" className="mt-4">Summary</AppText>
            <AppText className="mt-2 text-[17px] leading-7">{scan.summary}</AppText>
            {scan.recognizedText ? (
              <>
                <AppText variant="label" className="mt-4">Recognized text</AppText>
                <AppText tone="muted" className="mt-1">{scan.recognizedText}</AppText>
              </>
            ) : null}
            <AppText variant="label" className="mt-4">Detected objects</AppText>
            <AppText tone="muted" className="mt-1">{scan.objects.join(", ") || "No objects detected"}</AppText>
            <AppText variant="label" className="mt-4">Confidence</AppText>
            <AppText tone="muted" className="mt-1">{Math.round(scan.confidence * 100)}%</AppText>
            {scan.warnings.length > 0 ? (
              <>
                <AppText variant="label" className="mt-4">Warnings</AppText>
                <AppText tone="danger" className="mt-1">{scan.warnings.join(", ")}</AppText>
              </>
            ) : null}
            <PrimaryButton title="Play aloud" className="mt-6" onPress={() => speakText(scan.summary)} />
            <PrimaryButton
              title={isFavorite ? "Remove from favorites" : "Save to favorites"}
              variant="secondary"
              className="mt-3"
              onPress={() => toggleFavorite(scan.id)}
            />
            <PrimaryButton
              title="Share"
              variant="secondary"
              className="mt-3"
              onPress={() => Share.share({ message: `${scan.summary}\n${scan.text}` })}
            />
            <PrimaryButton title="Scan again" className="mt-3" onPress={() => router.push("/camera")} />
          </AppCard>
        </View>
      )}
    </Screen>
  );
}
