import { CameraView, type CameraCapturedPicture } from "expo-camera";
import { useRef, useState } from "react";

type CaptureState = {
  isCameraReady: boolean;
  isCapturing: boolean;
  captureError: string | null;
  cameraKey: number;
  cameraRef: React.RefObject<CameraView | null>;
  setCameraReady: () => void;
  setMountError: (message?: string) => void;
  resetCameraReady: () => void;
  restartCamera: () => void;
  takePhoto: () => Promise<CameraCapturedPicture | null>;
};

export function useCameraController(): CaptureState {
  const cameraRef = useRef<CameraView>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [cameraKey, setCameraKey] = useState(0);

  async function takePhoto() {
    if (!cameraRef.current || !isCameraReady || isCapturing) {
      return null;
    }

    setIsCapturing(true);
    setCaptureError(null);

    try {
      return await cameraRef.current.takePictureAsync({
        quality: 0.86,
        exif: false,
        skipProcessing: false,
      });
    } catch {
      setCaptureError("We could not capture the photo. Please try again.");
      return null;
    } finally {
      setIsCapturing(false);
    }
  }

  return {
    cameraRef,
    cameraKey,
    isCameraReady,
    isCapturing,
    captureError,
    setCameraReady: () => setIsCameraReady(true),
    resetCameraReady: () => setIsCameraReady(false),
    setMountError: (message) =>
      setCaptureError(message || "The camera preview could not start. Please reopen the screen."),
    restartCamera: () => {
      setCaptureError(null);
      setIsCameraReady(false);
      setCameraKey((key) => key + 1);
    },
    takePhoto,
  };
}
