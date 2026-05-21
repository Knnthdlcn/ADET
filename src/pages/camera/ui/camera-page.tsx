import { useCameraPermissions } from "expo-camera";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { ArrowLeft, Camera, RefreshCcw, ShieldAlert } from "lucide-react-native";
import { Linking, Modal, Pressable, View } from "react-native";
import { useState } from "react";

import { CameraFrame } from "@features/camera-capture";
import { isApiConfigured } from "@shared/config/env";
import { colors } from "@shared/constants/colors";
import { Button } from "@shared/ui/button";
import { Card } from "@shared/ui/card";
import { PrimaryButton } from "@shared/ui/button/primary-button";
import { IconButton } from "@shared/ui/icon-button";
import { LoadingOverlay } from "@shared/ui/loading";
import { FadeInView, Screen } from "@shared/ui/screen";
import { Text } from "@shared/ui/typography";
import { useCameraPage } from "../model/use-camera-page";

function PermissionLoading() {
  return (
    <Screen className="items-center justify-center">
      <Camera color={colors.brand.deep} size={34} />
      <Text variant="heading" className="mt-4 text-center">
        Preparing camera
      </Text>
      <Text tone="muted" className="mt-2 text-center">
        Checking your camera permission.
      </Text>
    </Screen>
  );
}

function PermissionDenied({
  canAskAgain,
  onRequestPermission,
}: {
  canAskAgain: boolean;
  onRequestPermission: () => void;
}) {
  return (
    <Screen className="justify-center">
      <FadeInView>
        <Card className="items-center px-6 py-8">
          <View className="h-16 w-16 items-center justify-center rounded-3xl bg-[#FFF3E2]">
            <ShieldAlert color={colors.signal.amber} size={30} />
          </View>
          <Text variant="heading" className="mt-5 text-center">
            Camera access is needed
          </Text>
          <Text tone="muted" className="mt-2 text-center">
            Assistive Vision needs camera permission to capture an image before it can send
            anything for analysis.
          </Text>
          <Button
            title={canAskAgain ? "Allow Camera" : "Open Settings"}
            className="mt-6"
            onPress={canAskAgain ? onRequestPermission : () => Linking.openSettings()}
          />
          <Button
            title="Back Home"
            variant="ghost"
            className="mt-2"
            onPress={() => router.replace("/home")}
          />
        </Card>
      </FadeInView>
    </Screen>
  );
}

export function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraPage = useCameraPage();
  const [fixVisible, setFixVisible] = useState(false);
  const isFocused = useIsFocused();

  if (!permission) {
    return <PermissionLoading />;
  }

  if (!permission.granted) {
    return (
      <PermissionDenied
        canAskAgain={permission.canAskAgain}
        onRequestPermission={requestPermission}
      />
    );
  }

  return (
    <Screen className="pt-2" scroll withBottomNav>
      <Modal visible={fixVisible} transparent animationType="fade" onRequestClose={() => setFixVisible(false)}>
        <View className="flex-1 justify-center bg-black/35 px-6">
          <Card className="rounded-[24px] px-5 py-6">
            <Text variant="heading">How to connect the backend</Text>
            <Text tone="muted" className="mt-3">
              Create a .env file, add EXPO_PUBLIC_API_BASE_URL=https://your-api-url.com,
              then restart Expo with npx expo start -c.
            </Text>
            <PrimaryButton
              title="Got it"
              className="mt-6"
              onPress={() => setFixVisible(false)}
            />
          </Card>
        </View>
      </Modal>
      <View className="mb-4 flex-row items-center justify-between">
        <IconButton
          icon={<ArrowLeft color={colors.ink} size={21} />}
          label="Go back"
          onPress={cameraPage.handleBack}
        />
        <View className="items-end">
          <Text variant="caption" tone="muted">
            Step 1 of 2
          </Text>
          <Text variant="heading">Scan image</Text>
        </View>
      </View>

      {!isApiConfigured ? (
        <FadeInView className="mb-4">
          <View className="rounded-2xl border border-signal-amber/40 bg-[#FFF8EC] px-4 py-3">
            <Text variant="label">Backend URL is still a placeholder</Text>
            <Text variant="caption" tone="muted" className="mt-1">
              Set EXPO_PUBLIC_API_BASE_URL in .env before testing real uploads.
            </Text>
            <Pressable
              accessibilityRole="button"
              className="mt-2 self-start"
              onPress={() => setFixVisible(true)}
            >
              <Text variant="caption" tone="brand" className="font-bold">
                How to fix
              </Text>
            </Pressable>
          </View>
        </FadeInView>
      ) : null}

      {isFocused ? (
        <FadeInView>
          <CameraFrame
            controller={cameraPage.controller}
            capturedImageUri={cameraPage.capturedImageUri}
            onCapture={cameraPage.handleCapture}
            onRetake={cameraPage.handleRetake}
            onAnalyze={cameraPage.handleAnalyze}
            isAnalyzing={cameraPage.isAnalyzing}
          />
        </FadeInView>
      ) : null}

      {cameraPage.uploadErrorMessage ? (
        <FadeInView className="mt-4">
          <View className="rounded-2xl border border-signal-coral/30 bg-white px-4 py-4">
            <Text variant="label" tone="danger">
              Upload failed
            </Text>
            <Text tone="muted" className="mt-1">
              {cameraPage.uploadErrorMessage}
            </Text>
            <Button
              title="Retry Analyze"
              variant="secondary"
              icon={<RefreshCcw color={colors.ink} size={18} />}
              className="mt-4"
              onPress={cameraPage.handleAnalyze}
            />
          </View>
        </FadeInView>
      ) : null}

      <LoadingOverlay
        visible={cameraPage.isAnalyzing}
        message="Uploading and analyzing"
      />
    </Screen>
  );
}
