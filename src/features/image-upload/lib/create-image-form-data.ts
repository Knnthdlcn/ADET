type ReactNativeFile = {
  uri: string;
  name: string;
  type: string;
};

function getExtension(uri: string) {
  const cleanUri = uri.split("?")[0] ?? uri;
  const extension = cleanUri.split(".").pop()?.toLowerCase();

  return extension === "png" ? "png" : "jpg";
}

export function createImageFormData(imageUri: string) {
  const extension = getExtension(imageUri);
  const formData = new FormData();
  const file: ReactNativeFile = {
    uri: imageUri,
    name: `adet-scan-${Date.now()}.${extension}`,
    type: extension === "png" ? "image/png" : "image/jpeg",
  };

  formData.append("image", file as unknown as Blob);

  return formData;
}
