import { router } from "expo-router";
import { useState } from "react";
import { Share } from "react-native";

import { useScanResultStore } from "@entities/scan-result";
import { speakText, useSpeakOnResult } from "@features/text-to-speech";

export function useResultPage() {
  const [favoriteSaved, setFavoriteSaved] = useState(false);
  const resultText = useScanResultStore((state) => state.resultText);
  const capturedImageUri = useScanResultStore((state) => state.capturedImageUri);
  const selectedScanId = useScanResultStore((state) => state.selectedScanId);
  const recentScans = useScanResultStore((state) => state.recentScans);
  const resetScan = useScanResultStore((state) => state.resetScan);
  const addFavorite = useScanResultStore((state) => state.addFavorite);
  const latestScan = recentScans.find((scan) => scan.id === selectedScanId) ?? null;

  useSpeakOnResult(latestScan?.summary ?? resultText);

  function handlePlayAgain() {
    if (resultText) {
      speakText(resultText);
    }
  }

  function handleScanAgain() {
    resetScan();
    router.replace("/camera");
  }

  function handleSaveFavorite() {
    addFavorite();
    setFavoriteSaved(true);
  }

  async function handleShare() {
    await Share.share({
      message: resultText || "No scan result yet.",
    });
  }

  return {
    resultText,
    capturedImageUri,
    latestScan,
    favoriteSaved,
    setFavoriteSaved,
    handlePlayAgain,
    handleScanAgain,
    handleSaveFavorite,
    handleShare,
    handleGoHome: () => {
      resetScan();
      router.replace("/home");
    },
  };
}
