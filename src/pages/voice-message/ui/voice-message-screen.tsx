import { useEffect, useRef, useState } from "react";
import { Audio, type AVPlaybackStatus, type AVPlaybackStatusSuccess } from "expo-av";
import { Mic, Play, Send, Trash2 } from "lucide-react-native";
import { Alert, Linking, View } from "react-native";
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
import { PageHeader } from "@shared/ui/app-shell/page-header";
import { PrimaryButton } from "@shared/ui/button/primary-button";
import { AppCard } from "@shared/ui/card/app-card";
import { Screen } from "@shared/ui/screen";
import { AppText } from "@shared/ui/typography/app-text";

const mockResponse = "I heard your voice message. This is a frontend demo response.";

function formatSeconds(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function isLoadedStatus(status: AVPlaybackStatus): status is AVPlaybackStatusSuccess {
  return status.isLoaded;
}

export function VoiceMessageScreen() {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingUri = useScanResultStore((state) => state.voiceMessage.uri);
  const recordingDuration = useScanResultStore((state) => state.voiceMessage.durationMillis);
  const recordingStatus = useScanResultStore((state) => state.voiceMessage.status);
  const savedResponse = useScanResultStore((state) => state.voiceMessage.mockResponse);
  const setRecordingUri = useScanResultStore((state) => state.setVoiceRecordingUri);
  const setRecordingStatus = useScanResultStore((state) => state.setVoiceRecordingStatus);
  const setVoiceMockResponse = useScanResultStore((state) => state.setVoiceMockResponse);
  const reduceMotion = useSettingsStore((state) => state.reduceMotion);
  const pulse = useSharedValue(1);
  const [elapsedMs, setElapsedMs] = useState(recordingDuration);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  async function cleanupSound() {
    const sound = soundRef.current;

    if (!sound) {
      return;
    }

    soundRef.current = null;
    try {
      const status = await sound.getStatusAsync();
      if (isLoadedStatus(status)) {
        if (status.isPlaying) {
          await sound.stopAsync();
        }
        await sound.unloadAsync();
      }
    } catch {
      // The native sound may already be unloaded; cleanup should never crash the screen.
    }
  }

  async function cleanupRecording() {
    const recording = recordingRef.current;

    if (!recording) {
      return;
    }

    recordingRef.current = null;
    try {
      await recording.stopAndUnloadAsync();
    } catch {
      // Recording may already be stopped or unloaded.
    }
  }

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => {
    void Audio.requestPermissionsAsync().then((permission) => {
      setPermissionGranted(permission.granted);
    });

    return () => {
      clearTimer();
      void cleanupSound();
      void cleanupRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (recordingStatus === "recording" && !reduceMotion) {
      pulse.value = withRepeat(withTiming(1.08, { duration: 850 }), -1, true);
    } else {
      pulse.value = withTiming(1, { duration: 180 });
    }
  }, [pulse, recordingStatus, reduceMotion]);

  async function startRecording() {
    setErrorMessage(null);
    setBusy(true);

    try {
      await cleanupSound();
      await cleanupRecording();

      const permission = await Audio.requestPermissionsAsync();
      setPermissionGranted(permission.granted);

      if (!permission.granted) {
        Alert.alert("Microphone permission", "Please allow microphone access to record a voice message.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setElapsedMs(0);
      setVoiceMockResponse(null);
      setRecordingStatus("recording");

      clearTimer();
      timerRef.current = setInterval(async () => {
        try {
          const status = await recording.getStatusAsync();
          if (status.isRecording) {
            setElapsedMs(status.durationMillis);
          }
        } catch {
          clearTimer();
        }
      }, 250);
    } catch (error) {
      setRecordingStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Recording could not start.");
      await cleanupRecording();
    } finally {
      setBusy(false);
    }
  }

  async function stopRecording() {
    const recording = recordingRef.current;

    if (!recording) {
      return;
    }

    setBusy(true);
    setErrorMessage(null);
    clearTimer();

    try {
      const status = await recording.getStatusAsync();
      const duration = status.durationMillis ?? elapsedMs;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      setElapsedMs(duration);
      setRecordingUri(uri, duration);
    } catch (error) {
      recordingRef.current = null;
      setRecordingStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Recording could not stop.");
    } finally {
      setBusy(false);
    }
  }

  async function playRecording() {
    if (!recordingUri) {
      return;
    }

    setBusy(true);
    setErrorMessage(null);

    try {
      await cleanupSound();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true, progressUpdateIntervalMillis: 250 },
      );
      soundRef.current = sound;
      setRecordingStatus("playing");
      sound.setOnPlaybackStatusUpdate((status) => {
        if (isLoadedStatus(status) && status.didJustFinish) {
          void cleanupSound();
          setRecordingStatus("recorded");
        }
      });
    } catch (error) {
      setRecordingStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Recording could not be played.");
      await cleanupSound();
    } finally {
      setBusy(false);
    }
  }

  async function deleteRecording() {
    clearTimer();
    await cleanupSound();
    await cleanupRecording();
    setElapsedMs(0);
    setErrorMessage(null);
    setRecordingUri(null, 0);
  }

  function sendToAssistant() {
    if (!recordingUri) {
      return;
    }

    setVoiceMockResponse(mockResponse);
    speakText(mockResponse);
  }

  if (permissionGranted === false) {
    return (
      <Screen className="bg-white px-5" scroll>
        <PageHeader title="Voice Message" subtitle="Assistant" />
        <AppCard className="items-center px-6 py-9">
          <Mic color={colors.primary} size={54} />
          <AppText variant="heading" className="mt-5 text-center">Microphone access needed</AppText>
          <AppText tone="muted" className="mt-2 text-center">
            Allow microphone access to record a voice message for the assistant.
          </AppText>
          <PrimaryButton title="Request again" className="mt-6" onPress={startRecording} />
          <PrimaryButton title="Open settings" variant="secondary" className="mt-3" onPress={() => Linking.openSettings()} />
        </AppCard>
      </Screen>
    );
  }

  const canUseRecording = Boolean(recordingUri) && recordingStatus !== "recording";
  const visibleDuration = recordingStatus === "recording" ? elapsedMs : recordingDuration || elapsedMs;

  return (
    <Screen className="bg-white px-5" scroll>
      <PageHeader title="Voice Message" subtitle="Assistant" />
      <AppCard className="items-center px-6 py-8">
        <Animated.View style={pulseStyle} className="h-28 w-28 items-center justify-center rounded-full bg-primary">
          <Mic color="#FFFFFF" size={56} />
        </Animated.View>
        <AppText variant="title" className="mt-6 text-center">Record your message</AppText>
        <AppText tone="muted" className="mt-2 text-center">
          Ask for help, describe a problem, or leave a command for the AI assistant.
        </AppText>

        <View className="mt-6 w-full rounded-2xl bg-[#F6F6FB] p-4">
          <AppText variant="caption" tone="muted">Status</AppText>
          <AppText variant="heading" className="mt-1">
            {recordingStatus.charAt(0).toUpperCase() + recordingStatus.slice(1)}
          </AppText>
          <AppText tone="muted" className="mt-2">
            Timer: {formatSeconds(visibleDuration)}
          </AppText>
          {errorMessage ? <AppText tone="danger" className="mt-2">{errorMessage}</AppText> : null}
        </View>

        {recordingStatus !== "recording" ? (
          <PrimaryButton
            title="Start Recording"
            accessibilityLabel="Start voice message recording"
            className="mt-6"
            loading={busy}
            disabled={recordingStatus === "playing"}
            onPress={startRecording}
          />
        ) : (
          <PrimaryButton
            title="Stop Recording"
            accessibilityLabel="Stop voice message recording"
            variant="danger"
            className="mt-6"
            loading={busy}
            onPress={stopRecording}
          />
        )}

        <View className="mt-4 w-full gap-3">
          <PrimaryButton
            title="Play Recording"
            accessibilityLabel="Play saved voice recording"
            variant="secondary"
            disabled={!canUseRecording || busy}
            icon={<Play color={colors.primary} size={18} />}
            onPress={playRecording}
          />
          <PrimaryButton
            title="Send to AI Assistant"
            accessibilityLabel="Send voice recording to AI assistant"
            disabled={!canUseRecording || busy}
            icon={<Send color="#FFFFFF" size={18} />}
            onPress={sendToAssistant}
          />
          <PrimaryButton
            title="Delete Recording"
            accessibilityLabel="Delete saved voice recording"
            variant="secondary"
            disabled={!canUseRecording || busy}
            icon={<Trash2 color={colors.primary} size={18} />}
            onPress={deleteRecording}
          />
        </View>

        {savedResponse ? (
          <View className="mt-5 w-full rounded-2xl border border-primary-soft bg-primary-soft p-4">
            <AppText variant="label">AI Assistant response</AppText>
            <AppText className="mt-2">{savedResponse}</AppText>
          </View>
        ) : null}
      </AppCard>
    </Screen>
  );
}
