import { CameraView } from "expo-camera";
import { Camera, RefreshCcw } from "lucide-react-native";
import { ActivityIndicator, Image, StyleSheet, useWindowDimensions, View } from "react-native";

import { colors } from "@shared/constants/colors";
import { Button } from "@shared/ui/button";
import { Text } from "@shared/ui/typography";
import type { useCameraController } from "../model/use-camera-controller";

type Controller = ReturnType<typeof useCameraController>;

type Props = {
  controller: Controller;
  capturedImageUri: string | null;
  onCapture: () => void;
  onRetake: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
};

export function CameraFrame({
  controller,
  capturedImageUri,
  onCapture,
  onRetake,
  onAnalyze,
  isAnalyzing,
}: Props) {
  const { height, width } = useWindowDimensions();
  const previewHeight = Math.max(360, Math.min(width * 1.18, height * 0.54));

  return (
    <View>
      <View className="overflow-hidden rounded-[28px] border border-line bg-ink">
        <View className="w-full" style={{ height: previewHeight }}>
          {capturedImageUri ? (
            <Image
              source={{ uri: capturedImageUri }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
          ) : (
            <CameraView
              key={controller.cameraKey}
              ref={controller.cameraRef}
              style={StyleSheet.absoluteFillObject}
              active
              facing="back"
              mode="picture"
              onCameraReady={controller.setCameraReady}
              onMountError={(event) => controller.setMountError(event.message)}
              animateShutter={false}
            />
          )}

          {!capturedImageUri && !controller.isCameraReady ? (
            <View className="absolute inset-0 items-center justify-center bg-black/35">
              <ActivityIndicator color="#FFFFFF" size="large" />
              <Text variant="label" tone="inverse" className="mt-3">
                Starting live camera
              </Text>
            </View>
          ) : null}

          <View className="absolute inset-x-5 top-5 rounded-2xl bg-black/35 px-4 py-3">
            <Text variant="label" tone="inverse">
              {capturedImageUri ? "Preview ready" : "Align the image inside the frame"}
            </Text>
          </View>

          {!capturedImageUri ? (
            <View className="absolute inset-x-8 bottom-8 items-center">
              <Button
                accessibilityLabel="Capture image"
                accessibilityHint="Takes a photo from the live camera preview."
                title={controller.isCapturing ? "Capturing" : "Capture"}
                icon={<Camera color="#FFFFFF" size={20} />}
                loading={controller.isCapturing}
                disabled={!controller.isCameraReady}
                onPress={onCapture}
              />
            </View>
          ) : null}
        </View>
      </View>

      {controller.captureError ? (
        <View className="mt-4 rounded-2xl border border-signal-coral/30 bg-white px-4 py-3">
          <Text tone="danger">{controller.captureError}</Text>
          {!capturedImageUri ? (
            <Button
              title="Restart Camera"
              variant="secondary"
              className="mt-3"
              onPress={controller.restartCamera}
            />
          ) : null}
        </View>
      ) : null}

      {capturedImageUri ? (
        <View className="mt-5 flex-row gap-3">
          <Button
            accessibilityLabel="Retake photo"
            title="Retake"
            variant="secondary"
            icon={<RefreshCcw color={colors.ink} size={19} />}
            onPress={onRetake}
            fullWidth={false}
            className="flex-1"
          />
          <Button
            accessibilityLabel="Analyze photo"
            accessibilityHint="Sends this image to the configured backend or uses a mock AI result."
            title="Analyze"
            loading={isAnalyzing}
            onPress={onAnalyze}
            fullWidth={false}
            className="flex-1"
          />
        </View>
      ) : null}
    </View>
  );
}
