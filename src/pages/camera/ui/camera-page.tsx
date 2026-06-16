import { CameraView, useCameraPermissions } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  type GestureUpdateEvent,
  type PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import { useIsFocused } from "@react-navigation/native";
import { AudioLines, Bot, Camera, Cpu, Mic, ShieldAlert, Volume2 } from "lucide-react-native";
import { useEffect, useMemo, useRef } from "react";

import { Text } from "@shared/ui/typography";

import { useCameraPage } from "../model/use-camera-page";

type PermissionGateProps = {
  canAskAgain: boolean;
  onRequestPermission: () => void;
};

const swipeThreshold = 64;

function PermissionGate({ canAskAgain, onRequestPermission }: PermissionGateProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Camera permission is needed. Tap to continue."
      className="flex-1 items-center justify-center bg-black px-8"
      onPress={canAskAgain ? onRequestPermission : () => Linking.openSettings()}
    >
      <ShieldAlert color="#FACC15" size={42} />
      <Text variant="heading" tone="inverse" className="mt-5 text-center">
        Camera access is needed
      </Text>
      <Text tone="inverse" className="mt-3 text-center text-white/80">
        Assistive Vision opens directly to the camera. Tap anywhere to allow access.
      </Text>
    </Pressable>
  );
}

function LoadingCamera() {
  return (
    <View className="flex-1 items-center justify-center bg-black">
      <ActivityIndicator color="#FFFFFF" size="large" />
      <Text tone="inverse" className="mt-4 text-center">
        Preparing assistive camera
      </Text>
    </View>
  );
}

function HudCorner({ position }: { position: "topLeft" | "topRight" | "bottomLeft" | "bottomRight" }) {
  return <View pointerEvents="none" style={[styles.corner, styles[position]]} />;
}

function AssistantHud({ hud }: { hud: ReturnType<typeof useCameraPage>["hud"] }) {
  const statusTone =
    hud.status === "error" || hud.status === "backend offline"
      ? "#FB7185"
      : hud.status === "connected"
        ? "#34D399"
      : hud.isAnalyzing
        ? "#38BDF8"
        : hud.isListening
          ? "#34D399"
          : "#FACC15";
  const voiceStatus =
    hud.speechReady === "available"
      ? "Voice ready"
      : hud.speechReady === "unavailable"
        ? "Voice requires dev build"
        : "Voice setup";
  const backendStatus =
    hud.backendStatus === "connected"
      ? "Backend connected"
      : hud.backendStatus === "offline"
        ? "Backend offline"
        : "Backend ready";

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <View className="absolute inset-x-5 top-12">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 rounded-md border border-white/15 bg-black/35 px-3 py-2">
            <Bot color={statusTone} size={18} />
            <Text variant="caption" tone="inverse" className="font-bold uppercase tracking-normal">
              {hud.status}
            </Text>
          </View>
          <View className="flex-row items-center gap-2 rounded-md border border-white/15 bg-black/35 px-3 py-2">
            <Cpu color="#93C5FD" size={17} />
            <Text variant="caption" tone="inverse" className="font-bold">
              {backendStatus}
            </Text>
          </View>
        </View>
      </View>

      <View className="absolute inset-x-8 top-[22%] items-center">
        <View
          className="h-[190px] w-full max-w-[330px] rounded-md border bg-transparent"
          style={{ borderColor: `${statusTone}99` }}
        >
          <View className="absolute -left-1 -top-1 h-9 w-9 border-l-2 border-t-2" style={{ borderColor: statusTone }} />
          <View className="absolute -right-1 -top-1 h-9 w-9 border-r-2 border-t-2" style={{ borderColor: statusTone }} />
          <View className="absolute -bottom-1 -left-1 h-9 w-9 border-b-2 border-l-2" style={{ borderColor: statusTone }} />
          <View className="absolute -bottom-1 -right-1 h-9 w-9 border-b-2 border-r-2" style={{ borderColor: statusTone }} />
          <View className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1 -translate-y-1 rounded-full" style={{ backgroundColor: statusTone }} />
        </View>
      </View>

      <View className="absolute inset-x-5 bottom-14">
        <View className="rounded-md border border-white/15 bg-black/45 px-4 py-4">
          <View className="flex-row items-center justify-between gap-3">
            <View className="min-w-0 flex-1">
              <Text variant="caption" tone="inverse" className="font-bold uppercase">
                {hud.mode.label} mode
              </Text>
              <Text tone="inverse" className="mt-1 text-white/90">
                {hud.message}
              </Text>
            </View>
            <View className="items-end">
              <View className="flex-row items-center gap-2">
                {hud.isListening ? <Mic color="#34D399" size={18} /> : <Volume2 color="#E5E7EB" size={18} />}
                {hud.isAnalyzing ? <AudioLines color="#38BDF8" size={18} /> : <Camera color="#E5E7EB" size={18} />}
              </View>
              <Text variant="caption" tone="inverse" className="mt-2 uppercase text-white/70">
                {hud.detailLevel}
              </Text>
            </View>
          </View>

          {hud.transcript ? (
            <Text variant="caption" tone="inverse" className="mt-3 text-white/70">
              Heard: {hud.transcript}
            </Text>
          ) : null}

          <Text variant="caption" tone="inverse" className="mt-2 text-white/70">
            {voiceStatus}
          </Text>

          {hud.continuousMode ? (
            <Text variant="caption" tone="inverse" className="mt-2 text-[#34D399]">
              Continuous listening active
            </Text>
          ) : null}

          {hud.captureError ? (
            <Text variant="caption" tone="danger" className="mt-2">
              {hud.captureError}
            </Text>
          ) : null}
        </View>
      </View>

      <HudCorner position="topLeft" />
      <HudCorner position="topRight" />
      <HudCorner position="bottomLeft" />
      <HudCorner position="bottomRight" />
    </View>
  );
}

function getSwipeDirection(event: GestureUpdateEvent<PanGestureHandlerEventPayload>) {
  const absX = Math.abs(event.translationX);
  const absY = Math.abs(event.translationY);

  if (Math.max(absX, absY) < swipeThreshold) {
    return null;
  }

  if (absX > absY) {
    return event.translationX > 0 ? "right" : "left";
  }

  return event.translationY > 0 ? "down" : "up";
}

export function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraPage = useCameraPage();
  const isFocused = useIsFocused();
  const didRequestCameraRef = useRef(false);

  useEffect(() => {
    if (!permission || permission.granted || !permission.canAskAgain || didRequestCameraRef.current) {
      return;
    }

    didRequestCameraRef.current = true;
    void requestPermission();
  }, [permission, requestPermission]);

  const gesture = useMemo(() => {
    const singleTap = Gesture.Tap()
      .numberOfTaps(1)
      .maxDuration(250)
      .runOnJS(true)
      .onEnd((_event, success) => {
        if (success) {
          void cameraPage.analyzeCurrentView();
        }
      });

    const doubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .maxDelay(280)
      .runOnJS(true)
      .onEnd((_event, success) => {
        if (success) {
          cameraPage.repeatLastResponse();
        }
      });

    const listenPress = Gesture.LongPress()
      .numberOfPointers(1)
      .minDuration(700)
      .maxDistance(18)
      .runOnJS(true)
      .onEnd((_event, success) => {
        if (success) {
          void cameraPage.startListening(false);
        }
      });

    const helpPress = Gesture.LongPress()
      .numberOfPointers(1)
      .minDuration(3000)
      .maxDistance(20)
      .runOnJS(true)
      .onEnd((_event, success) => {
        if (success) {
          cameraPage.activateHelpMode();
        }
      });

    const twoFingerHold = Gesture.LongPress()
      .numberOfPointers(2)
      .minDuration(850)
      .maxDistance(24)
      .runOnJS(true)
      .onEnd((_event, success) => {
        if (success) {
          void cameraPage.toggleContinuousListening();
        }
      });

    const threeFingerHold = Gesture.LongPress()
      .numberOfPointers(3)
      .minDuration(850)
      .maxDistance(24)
      .runOnJS(true)
      .onEnd((_event, success) => {
        if (success) {
          cameraPage.restartCurrentMessage();
        }
      });

    const swipe = Gesture.Pan()
      .minDistance(swipeThreshold)
      .runOnJS(true)
      .onEnd((event) => {
        const direction = getSwipeDirection(event);

        if (direction === "left") {
          cameraPage.switchMode("previous");
        } else if (direction === "right") {
          cameraPage.switchMode("next");
        } else if (direction === "down") {
          cameraPage.stopAudio();
        } else if (direction === "up") {
          cameraPage.increaseDetailLevel();
        }
      });

    return Gesture.Simultaneous(
      Gesture.Exclusive(doubleTap, singleTap),
      Gesture.Exclusive(helpPress, threeFingerHold, twoFingerHold, listenPress),
      swipe,
    );
  }, [cameraPage]);

  if (!permission) {
    return <LoadingCamera />;
  }

  if (!permission.granted) {
    return (
      <>
        <StatusBar hidden />
        <PermissionGate
          canAskAgain={permission.canAskAgain}
          onRequestPermission={requestPermission}
        />
      </>
    );
  }

  return (
    <GestureDetector gesture={gesture}>
      <View
        accessibilityRole="summary"
        accessibilityLabel="Assistive Vision camera. Single tap analyzes. Double tap repeats. Long press listens."
        accessibilityActions={[
          { name: "activate", label: "Analyze current view" },
          { name: "longpress", label: "Start voice command" },
          { name: "magicTap", label: "Repeat last response" },
          { name: "escape", label: "Stop listening or speech" },
          { name: "voiceHelp", label: "Voice command help" },
        ]}
        onAccessibilityAction={(event) => {
          const actionName = event.nativeEvent.actionName;

          if (actionName === "activate") {
            void cameraPage.analyzeCurrentView();
          } else if (actionName === "longpress") {
            void cameraPage.startListening(false);
          } else if (actionName === "magicTap") {
            cameraPage.repeatLastResponse();
          } else if (actionName === "escape") {
            cameraPage.stopAudio();
          } else if (actionName === "voiceHelp") {
            cameraPage.activateHelpMode();
          }
        }}
        className="flex-1 bg-black"
      >
        <StatusBar hidden />
        {isFocused ? (
          <CameraView
            key={cameraPage.controller.cameraKey}
            ref={cameraPage.controller.cameraRef}
            style={StyleSheet.absoluteFillObject}
            active
            animateShutter={false}
            facing="back"
            mode="picture"
            onCameraReady={cameraPage.controller.setCameraReady}
            onMountError={(event) => cameraPage.controller.setMountError(event.message)}
          />
        ) : null}

        {!cameraPage.hud.cameraReady ? (
          <View className="absolute inset-0 items-center justify-center bg-black/55">
            <ActivityIndicator color="#FFFFFF" size="large" />
            <Text tone="inverse" className="mt-3">
              Starting live camera
            </Text>
          </View>
        ) : null}

        <AssistantHud hud={cameraPage.hud} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  corner: {
    position: "absolute",
    height: 44,
    width: 44,
    borderColor: "rgba(250, 204, 21, 0.72)",
  },
  topLeft: {
    top: 30,
    left: 18,
    borderLeftWidth: 2,
    borderTopWidth: 2,
  },
  topRight: {
    top: 30,
    right: 18,
    borderRightWidth: 2,
    borderTopWidth: 2,
  },
  bottomLeft: {
    bottom: 30,
    left: 18,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bottomRight: {
    bottom: 30,
    right: 18,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
});
