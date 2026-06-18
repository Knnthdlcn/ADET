import type { ScanResult } from "@entities/scan-result";
import { apiClient } from "@shared/api/client";
import { endpoints } from "@shared/api/endpoints";
import { createImageFormData } from "../lib/create-image-form-data";

import type { AssistiveMode, DetailLevel } from "@pages/camera/model/assistant-command";

type UploadOptions = {
  mode?: AssistiveMode;
  detailLevel?: DetailLevel;
};

export async function uploadImage(imageUri: string, options: UploadOptions = {}) {
  const formData = createImageFormData(imageUri);

  if (options.mode) formData.append("mode", options.mode);
  if (options.detailLevel) formData.append("detailLevel", options.detailLevel);

  return apiClient.postForm<ScanResult>(endpoints.analyzeImage, formData);
}
