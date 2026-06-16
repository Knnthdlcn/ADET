import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useScanResultStore } from "@entities/scan-result";
import { useCameraController } from "@features/camera-capture";
import { speakText, stopSpeaking } from "@features/text-to-speech";
import { backendUnavailableMessage } from "@shared/api/client";
import { lightImpact, successImpact, warningImpact } from "@shared/lib/feedback";

import {
  assistiveModes,
  type AssistiveMode,
  type DetailLevel,
  parseAssistantCommand,
} from "./assistant-command";
import { analyzeCameraFrame } from "./vision-analysis-service";
import {
  voiceRecognitionService,
  type VoiceRecognitionSubscription,
} from "../../../features/voice-recognition";

type CameraAssistantStatus =
  | "starting"
  | "ready"
  | "listening"
  | "thinking"
  | "analyzing"
  | "connected"
  | "backend offline"
  | "speaking"
  | "help"
  | "error";

type BackendStatus = "unknown" | "connected" | "offline";

const readyMessage =
  "Assistive Vision ready. Tap once to analyze, double tap to repeat, or say a command.";
const voiceDevelopmentBuildMessage = "Voice recognition requires the development build.";
const voiceHelpMessage =
  "Here are some commands you can say: describe the room, read this, is the path clear, find the door, find my phone, repeat, stop, increase detail, short answer, emergency, or what can I say.";
const emergencyPlaceholderMessage =
  "Emergency help mode is not connected yet. Please use your phone emergency shortcut.";

const commandContext = [
  "what is in front of me",
  "describe what you see",
  "describe the room",
  "what is around me",
  "what is on my left",
  "what is on my right",
  "is the path clear",
  "are there obstacles",
  "read this text",
  "read the sign",
  "read the document",
  "where is the door",
  "find the door",
  "where are the stairs",
  "find my phone",
  "find my keys",
  "is there a person nearby",
  "what object am I pointing at",
  "repeat that",
  "stop",
  "guide me",
  "help",
  "emergency help",
  "increase detail",
  "decrease detail",
  "start continuous mode",
  "stop continuous mode",
];

const hazardPattern =
  /\b(blocked|obstructed|obstacle|hazard|warning|careful|stairs|step|wet|water|fire|vehicle|hole|sharp|unsafe|wall|trip|fall)\b/i;

function nextDetailLevel(current: DetailLevel): DetailLevel {
  if (current === "brief") return "standard";
  if (current === "standard") return "detailed";
  return "detailed";
}

function previousDetailLevel(current: DetailLevel): DetailLevel {
  if (current === "detailed") return "standard";
  if (current === "standard") return "brief";
  return "brief";
}

function detailAnnouncement(level: DetailLevel) {
  if (level === "detailed") return "Detailed description enabled.";
  if (level === "standard") return "Standard description enabled.";
  return "Brief description enabled.";
}

function hasHazardSignal(text: string, warnings: string[] = []) {
  return warnings.length > 0 || hazardPattern.test(text);
}

export function useCameraPage() {
  const controller = useCameraController();
  const completeScan = useScanResultStore((state) => state.completeScan);
  const setCapturedImageUri = useScanResultStore((state) => state.setCapturedImageUri);
  const startVoiceCommand = useScanResultStore((state) => state.startVoiceCommand);
  const setVoiceCommandTranscript = useScanResultStore(
    (state) => state.setVoiceCommandTranscript,
  );
  const setVoiceCommandError = useScanResultStore((state) => state.setVoiceCommandError);
  const stopVoiceCommand = useScanResultStore((state) => state.stopVoiceCommand);

  const [status, setStatus] = useState<CameraAssistantStatus>("starting");
  const [modeIndex, setModeIndex] = useState(0);
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("standard");
  const [hudMessage, setHudMessage] = useState("Starting live camera");
  const [lastResponse, setLastResponse] = useState(readyMessage);
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("unknown");
  const [speechReady, setSpeechReady] = useState<"checking" | "available" | "unavailable">(
    "checking",
  );

  const lastResponseRef = useRef(readyMessage);
  const continuousModeRef = useRef(false);
  const isAnalyzingRef = useRef(false);
  const processedTranscriptRef = useRef("");
  const readyAnnouncedRef = useRef(false);
  const analyzeCurrentViewRef = useRef<
    (modeOverride?: AssistiveMode, commandLabel?: string) => Promise<void>
  >(async () => {});
  const startListeningRef = useRef<(continuous?: boolean) => Promise<void>>(async () => {});
  const stopContinuousListeningRef = useRef<() => void>(() => {});
  const increaseDetailLevelRef = useRef<() => void>(() => {});
  const decreaseDetailLevelRef = useRef<() => void>(() => {});
  const setDetailLevelRef = useRef<(level: DetailLevel) => void>(() => {});
  const stopAudioRef = useRef<() => void>(() => {});

  const currentMode = assistiveModes[modeIndex] ?? assistiveModes[0];

  const announce = useCallback(
    (message: string, options: { remember?: boolean; nextStatus?: CameraAssistantStatus } = {}) => {
      const normalized = message.trim();

      if (!normalized) {
        return;
      }

      if (options.remember !== false) {
        lastResponseRef.current = normalized;
        setLastResponse(normalized);
      }

      setHudMessage(normalized);
      setStatus("speaking");
      speakText(normalized, {
        onDone: () => setStatus(options.nextStatus ?? "ready"),
        onStopped: () => setStatus(options.nextStatus ?? "ready"),
        onError: () => setStatus("ready"),
      });
    },
    [],
  );

  const handleRecognizedCommand = useCallback(
    async (spokenCommand: string) => {
      const command = parseAssistantCommand(spokenCommand);

      switch (command.action) {
        case "analyze":
          setStatus("thinking");
          setHudMessage(`I heard: ${command.transcript}`);

          const nextIndex = assistiveModes.findIndex((mode) => mode.id === command.mode);
          if (nextIndex >= 0) {
            setModeIndex(nextIndex);
          }

          await analyzeCurrentViewRef.current(command.mode, command.label);
          return;

        case "repeat":
          announce("Repeating last response.", { remember: false });
          setTimeout(() => announce(lastResponseRef.current), 650);
          return;

        case "stopAudio":
          stopAudioRef.current();
          return;

        case "help":
          setStatus("help");
          announce(voiceHelpMessage);
          return;

        case "emergency":
          setStatus("help");
          warningImpact();
          announce(emergencyPlaceholderMessage);
          return;

        case "increaseDetail":
          increaseDetailLevelRef.current();
          return;

        case "decreaseDetail":
          decreaseDetailLevelRef.current();
          return;

        case "setDetail":
          setDetailLevelRef.current(command.detailLevel);
          return;

        case "startContinuous":
          await startListeningRef.current(true);
          return;

        case "stopContinuous":
          stopContinuousListeningRef.current();
          return;

        case "unknown":
          announce(
            "I did not catch that. Try saying describe the room, read this, find the door, repeat, or stop.",
            { remember: false },
          );
      }
    },
    [announce],
  );

  const handleRecognizedCommandRef = useRef(handleRecognizedCommand);

  useEffect(() => {
    handleRecognizedCommandRef.current = handleRecognizedCommand;
  }, [handleRecognizedCommand]);

  useEffect(() => {
    let mounted = true;
    const subscriptions: VoiceRecognitionSubscription[] = [
      voiceRecognitionService.onStart(() => {
        if (!mounted) {
          return;
        }

        setIsListening(true);
        setStatus("listening");
        setHudMessage("Listening");
        startVoiceCommand("native");
      }),
      voiceRecognitionService.onEnd(() => {
        if (!mounted) {
          return;
        }

        const shouldStayListening = continuousModeRef.current;

        setIsListening(false);
        stopVoiceCommand();

        if (!shouldStayListening && !isAnalyzingRef.current) {
          setStatus("ready");
          setHudMessage("Camera ready");
        }
      }),
      voiceRecognitionService.onResult((event) => {
        if (!mounted) {
          return;
        }

        const recognizedText = event.results[0]?.transcript?.trim() ?? "";

        if (!recognizedText) {
          return;
        }

        setTranscript(recognizedText);
        setVoiceCommandTranscript(
          recognizedText,
          event.isFinal ? "recognized" : "listening",
        );

        if (!event.isFinal || processedTranscriptRef.current === recognizedText) {
          return;
        }

        processedTranscriptRef.current = recognizedText;
        setStatus("thinking");
        setHudMessage(`I heard: ${recognizedText}`);
        void handleRecognizedCommandRef.current(recognizedText);
      }),
      voiceRecognitionService.onError((event) => {
        if (!mounted || event.error === "aborted") {
          return;
        }

        setIsListening(false);
        setStatus("error");
        setHudMessage(event.message || "Voice recognition error");
        setVoiceCommandError(event.message || "Voice recognition failed.");
        warningImpact();
        announce("I did not catch that. Please try again.", {
          remember: false,
        });
      }),
    ];

    void voiceRecognitionService.getVoiceRecognitionAvailability().then((availability) => {
      if (!mounted) {
        return;
      }

      setSpeechReady(availability.available ? "available" : "unavailable");
      if (!availability.available && __DEV__) {
        console.info("[voice-recognition] Fallback active:", availability.reason);
      }
    });

    return () => {
      mounted = false;
      subscriptions.forEach((subscription) => subscription.remove());
    };
  }, [
    announce,
    setVoiceCommandError,
    setVoiceCommandTranscript,
    startVoiceCommand,
    stopVoiceCommand,
  ]);

  useEffect(() => {
    continuousModeRef.current = continuousMode;
  }, [continuousMode]);

  useEffect(() => {
    isAnalyzingRef.current = isAnalyzing;
  }, [isAnalyzing]);

  useEffect(() => {
    if (!controller.isCameraReady || readyAnnouncedRef.current) {
      return;
    }

    readyAnnouncedRef.current = true;
    setStatus("ready");
    announce(readyMessage);
  }, [announce, controller.isCameraReady]);

  const analyzeCurrentView = useCallback(
    async (modeOverride?: AssistiveMode, commandLabel?: string) => {
      if (isAnalyzingRef.current) {
        announce("Analysis is already in progress.", { remember: false });
        return;
      }

      if (!controller.isCameraReady) {
        announce("Camera is still starting. Please wait a moment.", { remember: false });
        return;
      }

      lightImpact();
      setIsAnalyzing(true);
      isAnalyzingRef.current = true;
      setStatus("analyzing");
      setHudMessage(commandLabel ? `I heard: ${commandLabel}. Analyzing` : "Analyzing");
      announce(commandLabel ? `I heard: ${commandLabel}. Analyzing.` : "Analyzing.", {
        remember: false,
        nextStatus: "analyzing",
      });

      try {
        const photo = await controller.takePhoto();

        if (!photo?.uri) {
          const message =
            controller.captureError || "I could not capture the camera frame. Please try again.";
          setStatus("error");
          setHudMessage(message);
          announce(message);
          return;
        }

        setCapturedImageUri(photo.uri);

        const selectedMode = modeOverride ?? currentMode.id;
        const analysis = await analyzeCameraFrame({
          imageUri: photo.uri,
          mode: selectedMode,
          detailLevel,
        });

        completeScan({
          text: analysis.text,
          summary: analysis.summary ?? analysis.text,
          recognizedText: analysis.recognizedText,
          objects: analysis.objects,
          warnings: analysis.warnings,
          confidence: analysis.confidence,
          imageUri: photo.uri,
          status: "completed",
        });

        setBackendStatus("connected");
        if (hasHazardSignal(analysis.text, analysis.warnings)) {
          warningImpact();
        } else {
          successImpact();
        }
        setStatus("connected");
        setHudMessage("Analysis complete");
        announce(analysis.text, { nextStatus: "connected" });
      } catch (error) {
        const message =
          error instanceof Error && error.message.trim()
            ? error.message
            : backendUnavailableMessage;
        const nextStatus =
          message === backendUnavailableMessage ? "backend offline" : "error";

        if (nextStatus === "backend offline") {
          setBackendStatus("offline");
        }

        warningImpact();
        setStatus(nextStatus);
        setHudMessage(message);
        announce(message, { nextStatus });
      } finally {
        setIsAnalyzing(false);
        isAnalyzingRef.current = false;
      }
    },
    [
      announce,
      completeScan,
      controller,
      currentMode.id,
      detailLevel,
      setCapturedImageUri,
    ],
  );

  const repeatLastResponse = useCallback(() => {
    lightImpact();
    announce("Repeating last response.", { remember: false });
    setTimeout(() => announce(lastResponseRef.current), 650);
  }, [announce]);

  const startListening = useCallback(
    async (continuous = false) => {
      const availability = await voiceRecognitionService.getVoiceRecognitionAvailability();

      if (!availability.available) {
        setSpeechReady("unavailable");
        announce(availability.reason ?? voiceDevelopmentBuildMessage);
        return;
      }

      setSpeechReady("available");
      setContinuousMode(continuous);
      continuousModeRef.current = continuous;
      processedTranscriptRef.current = "";
      setTranscript("");
      setIsListening(true);
      setStatus("listening");
      setHudMessage(continuous ? "Continuous listening" : "Listening");
      lightImpact();
      announce(continuous ? "Continuous listening mode started." : "Listening.", {
        remember: false,
        nextStatus: "listening",
      });

      setTimeout(() => {
        void voiceRecognitionService
          .startListening({
            continuous,
            contextualStrings: commandContext,
          })
          .then((result) => {
            if (result.started) {
              return;
            }

            setSpeechReady("unavailable");
            setIsListening(false);
            setStatus("ready");
            announce(result.reason ?? voiceDevelopmentBuildMessage);
          });
      }, 850);
    },
    [announce],
  );

  const stopContinuousListening = useCallback(() => {
    setContinuousMode(false);
    continuousModeRef.current = false;
    setIsListening(false);
    stopVoiceCommand();
    voiceRecognitionService.abortListening();
    announce("Continuous listening mode stopped.", { remember: false });
  }, [announce, stopVoiceCommand]);

  const toggleContinuousListening = useCallback(async () => {
    if (continuousModeRef.current) {
      stopContinuousListening();
      return;
    }

    await startListening(true);
  }, [startListening, stopContinuousListening]);

  const restartCurrentMessage = useCallback(() => {
    lightImpact();
    stopSpeaking();
    announce(lastResponseRef.current);
  }, [announce]);

  const activateHelpMode = useCallback(() => {
    lightImpact();
    setStatus("help");
    announce(voiceHelpMessage);
  }, [announce]);

  const switchMode = useCallback(
    (direction: "next" | "previous") => {
      lightImpact();
      setModeIndex((currentIndex) => {
        const nextIndex =
          direction === "next"
            ? (currentIndex + 1) % assistiveModes.length
            : (currentIndex - 1 + assistiveModes.length) % assistiveModes.length;
        const nextMode = assistiveModes[nextIndex] ?? assistiveModes[0];

        announce(`${nextMode.label} mode. ${nextMode.description}.`, { remember: false });
        return nextIndex;
      });
    },
    [announce],
  );

  const stopAudio = useCallback(() => {
    lightImpact();
    voiceRecognitionService.abortListening();
    stopVoiceCommand();
    setContinuousMode(false);
    continuousModeRef.current = false;
    setIsListening(false);
    stopSpeaking();
    setStatus("ready");
    setHudMessage("Stopped");
  }, [stopVoiceCommand]);

  const increaseDetailLevel = useCallback(() => {
    lightImpact();
    setDetailLevel((current) => {
      const next = nextDetailLevel(current);

      announce(detailAnnouncement(next), { remember: false });
      return next;
    });
  }, [announce]);

  const decreaseDetailLevel = useCallback(() => {
    lightImpact();
    setDetailLevel((current) => {
      const next = previousDetailLevel(current);

      announce(detailAnnouncement(next), { remember: false });
      return next;
    });
  }, [announce]);

  const setDetailLevelTo = useCallback(
    (level: DetailLevel) => {
      lightImpact();
      setDetailLevel(level);
      announce(detailAnnouncement(level), { remember: false });
    },
    [announce],
  );

  analyzeCurrentViewRef.current = analyzeCurrentView;
  startListeningRef.current = startListening;
  stopContinuousListeningRef.current = stopContinuousListening;
  increaseDetailLevelRef.current = increaseDetailLevel;
  decreaseDetailLevelRef.current = decreaseDetailLevel;
  setDetailLevelRef.current = setDetailLevelTo;
  stopAudioRef.current = stopAudio;

  const hud = useMemo(
    () => ({
      status,
      message: hudMessage,
      mode: currentMode,
      detailLevel,
      lastResponse,
      transcript,
      speechReady,
      backendStatus,
      isListening,
      isAnalyzing,
      continuousMode,
      cameraReady: controller.isCameraReady,
      captureError: controller.captureError,
    }),
    [
      status,
      hudMessage,
      currentMode,
      detailLevel,
      lastResponse,
      transcript,
      speechReady,
      backendStatus,
      isListening,
      isAnalyzing,
      continuousMode,
      controller.isCameraReady,
      controller.captureError,
    ],
  );

  return {
    controller,
    hud,
    analyzeCurrentView,
    repeatLastResponse,
    startListening,
    toggleContinuousListening,
    restartCurrentMessage,
    activateHelpMode,
    switchMode,
    stopAudio,
    increaseDetailLevel,
  };
}
