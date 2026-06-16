import type { ScanResult } from "@entities/scan-result";
import { uploadImage } from "@features/image-upload/api/upload-image";
import { ApiError, backendUnavailableMessage } from "@shared/api/client";
import { isApiConfigured } from "@shared/config/env";

import type { AssistiveMode, DetailLevel } from "./assistant-command";

export type VisionAnalysis = ScanResult & {
  recognizedText: string;
  status: "completed";
  source: "api";
};

type AnalyzeFrameInput = {
  imageUri: string;
  mode: AssistiveMode;
  detailLevel: DetailLevel;
};

export async function analyzeCameraFrame({
  imageUri,
}: AnalyzeFrameInput): Promise<VisionAnalysis> {
  if (!isApiConfigured) {
    throw new ApiError(backendUnavailableMessage);
  }

  const response = await uploadImage(imageUri);
  const text = response.text?.trim();

  if (!text) {
    throw new ApiError("The backend response did not include a description.");
  }

  return {
    text,
    summary: response.summary ?? text,
    recognizedText: response.summary ?? text,
    objects: response.objects ?? [],
    warnings: response.warnings ?? [],
    confidence: response.confidence ?? 0.9,
    status: "completed",
    source: "api",
  };
}
