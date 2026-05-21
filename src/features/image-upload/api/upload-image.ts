import type { ScanResult } from "@entities/scan-result";
import { apiClient } from "@shared/api/client";
import { endpoints } from "@shared/api/endpoints";
import { createImageFormData } from "../lib/create-image-form-data";

export async function uploadImage(imageUri: string) {
  const formData = createImageFormData(imageUri);

  return apiClient.postForm<ScanResult>(endpoints.analyzeImage, formData);
}
