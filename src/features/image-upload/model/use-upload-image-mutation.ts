import { useMutation } from "@tanstack/react-query";

import { uploadImage } from "../api/upload-image";

export function useUploadImageMutation() {
  return useMutation({
    mutationFn: (imageUri: string) => {
      console.log(`[mutation] uploadImage called with URI: ${imageUri}`);
      return uploadImage(imageUri);
    },
    retry: 1,
    onSuccess: (data) => {
      console.log(`[mutation] uploadImage succeeded:`, JSON.stringify(data).slice(0, 200));
    },
    onError: (err) => {
      console.error(`[mutation] uploadImage failed:`, err);
    },
  });
}
