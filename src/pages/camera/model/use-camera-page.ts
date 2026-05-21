import { router } from "expo-router";
import { useMemo, useState } from "react";

import { mockAiResult, useScanResultStore } from "@entities/scan-result";
import { useCameraController } from "@features/camera-capture";
import { useUploadImageMutation } from "@features/image-upload";
import { isApiConfigured } from "@shared/config/env";
import { successImpact } from "@shared/lib/feedback";

const mockAnalyzeDelayMs = 850;

export function useCameraPage() {
  const controller = useCameraController();
  const [mockAnalyzing, setMockAnalyzing] = useState(false);
  const capturedImageUri = useScanResultStore((state) => state.capturedImageUri);
  const setCapturedImageUri = useScanResultStore(
    (state) => state.setCapturedImageUri,
  );
  const completeScan = useScanResultStore((state) => state.completeScan);
  const uploadMutation = useUploadImageMutation();

  const uploadErrorMessage = useMemo(() => {
    if (!uploadMutation.error) {
      return null;
    }

    return uploadMutation.error instanceof Error
      ? uploadMutation.error.message
      : "Image analysis failed. Please try again.";
  }, [uploadMutation.error]);

  async function handleCapture() {
    const photo = await controller.takePhoto();

    if (photo?.uri) {
      setCapturedImageUri(photo.uri);
      uploadMutation.reset();
    }
  }

  function handleRetake() {
    setCapturedImageUri(null);
    controller.resetCameraReady();
    uploadMutation.reset();
  }

  async function handleAnalyze() {
    if (!capturedImageUri) {
      return;
    }

    if (!isApiConfigured) {
      setMockAnalyzing(true);
      await new Promise((resolve) => setTimeout(resolve, mockAnalyzeDelayMs));
      completeScan({
        text: mockAiResult.text,
        summary: mockAiResult.summary,
        recognizedText: "Exit sign on the left wall",
        objects: mockAiResult.objects,
        warnings: mockAiResult.warnings,
        confidence: mockAiResult.confidence,
        imageUri: capturedImageUri,
        status: "mock",
      });
      successImpact();
      setMockAnalyzing(false);
      router.push("/result");
      return;
    }

    uploadMutation.mutate(capturedImageUri, {
      onSuccess: (response) => {
        completeScan({
          text: response.text,
          summary: response.summary ?? response.text,
          recognizedText: response.text,
          objects: response.objects ?? ["uploaded image"],
          warnings: response.warnings ?? [],
          confidence: response.confidence ?? 0.9,
          imageUri: capturedImageUri,
          status: "completed",
        });
        successImpact();
        router.push("/result");
      },
    });
  }

  return {
    controller,
    capturedImageUri,
    isAnalyzing: uploadMutation.isPending || mockAnalyzing,
    uploadErrorMessage,
    handleCapture,
    handleRetake,
    handleAnalyze,
    handleBack: () => (router.canGoBack() ? router.back() : router.replace("/home")),
  };
}
