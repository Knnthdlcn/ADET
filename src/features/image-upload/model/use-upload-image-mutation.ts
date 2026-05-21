import { useMutation } from "@tanstack/react-query";

import { uploadImage } from "../api/upload-image";

export function useUploadImageMutation() {
  return useMutation({
    mutationFn: uploadImage,
    retry: 1,
  });
}
