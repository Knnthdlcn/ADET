import { router } from "expo-router";
import { Mic, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, TextInput, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { useScanResultStore } from "@entities/scan-result";
import { useSettingsStore } from "@entities/settings";
import { speakText } from "@features/text-to-speech";
import { colors } from "@shared/constants/colors";
import { PrimaryButton } from "@shared/ui/button/primary-button";
import { AppCard } from "@shared/ui/card/app-card";
import { AppText } from "@shared/ui/typography/app-text";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const suggestions = [
  "start scan",
  "open camera",
  "open history",
  "open settings",
  "open profile",
  "read latest result",
  "open help",
  "check server",
  "start mapping",
  "go home",
] as const;

// Expo Go cannot load native speech-to-text modules that are not bundled into
// the Expo Go binary. Real voice activation can be added later with a custom
// development build; this modal intentionally stays in mock command mode.
function getCommand(transcript: string) {
  const command = transcript.toLowerCase().trim();

  if (command.includes("start scan") || command.includes("open camera") || command.includes("scan")) {
    return { phrase: "Opening camera.", action: () => router.push("/camera") };
  }
  if (command.includes("history")) {
    return { phrase: "Opening history.", action: () => router.push("/history") };
  }
  if (command.includes("setting")) {
    return { phrase: "Opening settings.", action: () => router.push("/settings") };
  }
  if (command.includes("profile")) {
    return { phrase: "Opening profile.", action: () => router.push("/profile") };
  }
  if (command.includes("help")) {
    return { phrase: "Opening help.", action: () => router.push("/help") };
  }
  if (command.includes("server") || command.includes("connection")) {
    return { phrase: "Checking server.", action: () => router.push("/server-status") };
  }
  if (command.includes("mapping") || command.includes("indoor")) {
    return { phrase: "Starting indoor mapping.", action: () => router.push("/mapping") };
  }
  if (command.includes("home")) {
    return { phrase: "Going home.", action: () => router.push("/home") };
  }

  return null;
}

export function VoiceAssistantModal({ visible, onClose }: Props) {
  const latestScan = useScanResultStore((state) => state.recentScans[0]);
  const voiceCommand = useScanResultStore((state) => state.voiceCommand);
  const startVoiceCommand = useScanResultStore((state) => state.startVoiceCommand);
  const setVoiceCommandTranscript = useScanResultStore((state) => state.setVoiceCommandTranscript);
  const setVoiceCommandError = useScanResultStore((state) => state.setVoiceCommandError);
  const stopVoiceCommand = useScanResultStore((state) => state.stopVoiceCommand);
  const voiceFeedback = useSettingsStore((state) => state.voiceFeedback);
  const reduceMotion = useSettingsStore((state) => state.reduceMotion);
  const pulse = useSharedValue(1);
  const [commandText, setCommandText] = useState("");

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const statusText = useMemo(() => {
    if (voiceCommand.error) {
      return voiceCommand.error;
    }

    return "Real speech recognition requires a development build. Expo Go is using demo command mode.";
  }, [voiceCommand.error]);

  function speakIfEnabled(text: string) {
    if (voiceFeedback) {
      speakText(text);
    }
  }

  function executeTranscript(transcript: string) {
    const normalized = transcript.trim();

    if (!normalized) {
      setVoiceCommandError("Type a command to test voice command mode.");
      return;
    }

    setVoiceCommandTranscript(normalized, "mock");

    if (normalized.toLowerCase().includes("read latest result")) {
      const text = latestScan?.summary || latestScan?.text || "No scan result yet.";
      speakIfEnabled(text);
      onClose();
      return;
    }

    const command = getCommand(normalized);

    if (!command) {
      setVoiceCommandError("Sorry, I did not understand that command.");
      speakIfEnabled("Sorry, I did not understand that command.");
      return;
    }

    speakIfEnabled(command.phrase);
    onClose();
    command.action();
  }

  useEffect(() => {
    if (!visible) {
      return;
    }

    setCommandText("");
    startVoiceCommand("mock");
    if (!reduceMotion) {
      pulse.value = withRepeat(withTiming(1.08, { duration: 800 }), -1, true);
    }

    return () => {
      pulse.value = withTiming(1, { duration: 120 });
      stopVoiceCommand();
    };
  }, [pulse, reduceMotion, startVoiceCommand, stopVoiceCommand, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/35 px-5 pb-8">
        <Pressable className="absolute inset-0" accessibilityLabel="Cancel voice command" onPress={onClose} />
        <AppCard className="items-center rounded-[24px] px-5 py-6">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close voice command mode"
            className="absolute right-4 top-4 h-11 w-11 items-center justify-center rounded-full bg-[#F2F2F7]"
            onPress={onClose}
          >
            <X color={colors.ink} size={22} />
          </Pressable>

          <Animated.View style={pulseStyle} className="h-24 w-24 items-center justify-center rounded-full bg-primary">
            <Mic color="#FFFFFF" size={48} />
          </Animated.View>
          <AppText variant="heading" className="mt-5">Listening mode</AppText>
          <AppText tone="muted" className="mt-2 text-center">{statusText}</AppText>

          <View className="mt-5 w-full rounded-2xl bg-[#F6F6FB] p-4">
            <AppText variant="caption" tone="muted">Recognized command</AppText>
            <AppText variant="label" className="mt-1">
              {voiceCommand.transcript || "Type or tap a demo command below."}
            </AppText>
            <AppText variant="caption" tone="muted" className="mt-3">
              Future note: native speech-to-text cannot run in Expo Go because ExpoSpeechRecognition is not included in the Expo Go binary.
            </AppText>
          </View>

          <TextInput
            accessibilityLabel="Type a voice command"
            accessibilityHint="Type a command such as open camera or read latest result."
            value={commandText}
            onChangeText={setCommandText}
            placeholder="Type command, e.g. open camera"
            placeholderTextColor="#77777F"
            returnKeyType="done"
            onSubmitEditing={() => executeTranscript(commandText)}
            className="mt-4 min-h-14 w-full rounded-2xl border border-line bg-white px-4 text-[16px] text-ink"
          />

          <View className="mt-4 w-full flex-row flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <Pressable
                key={suggestion}
                accessibilityRole="button"
                accessibilityLabel={`Use demo command ${suggestion}`}
                className="min-h-11 rounded-full border border-primary-soft bg-white px-4 py-2"
                onPress={() => {
                  setCommandText(suggestion);
                  executeTranscript(suggestion);
                }}
              >
                <AppText variant="caption" tone="primary" className="font-bold">{suggestion}</AppText>
              </Pressable>
            ))}
          </View>

          <PrimaryButton title="Submit Command" className="mt-5" onPress={() => executeTranscript(commandText)} />
          <PrimaryButton title="Cancel" variant="secondary" className="mt-3" onPress={onClose} />
        </AppCard>
      </View>
    </Modal>
  );
}
