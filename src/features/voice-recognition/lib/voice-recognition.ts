import Constants, { ExecutionEnvironment } from "expo-constants";

type NativeSubscription = {
  remove: () => void;
};

type PermissionResult = {
  granted: boolean;
};

type NativeSpeechRecognitionModule = {
  isRecognitionAvailable: () => boolean;
  requestPermissionsAsync: () => Promise<PermissionResult>;
  start: (options: {
    lang?: string;
    interimResults?: boolean;
    maxAlternatives?: number;
    continuous?: boolean;
    contextualStrings?: string[];
    addsPunctuation?: boolean;
  }) => void;
  stop: () => void;
  abort: () => void;
  addListener: (eventName: string, listener: (event?: unknown) => void) => NativeSubscription;
};

type NativeSpeechRecognitionExports = {
  ExpoSpeechRecognitionModule?: NativeSpeechRecognitionModule;
};

export type VoiceRecognitionResultEvent = {
  isFinal: boolean;
  results: Array<{
    transcript: string;
    confidence?: number;
  }>;
};

export type VoiceRecognitionErrorEvent = {
  error: string;
  message: string;
};

export type VoiceRecognitionStartOptions = {
  continuous?: boolean;
  contextualStrings?: string[];
};

export type VoiceRecognitionStartResult = {
  started: boolean;
  reason?: string;
};

export type VoiceRecognitionAvailability = {
  available: boolean;
  reason?: string;
};

export type VoiceRecognitionSubscription = {
  remove: () => void;
};

const developmentBuildRequired =
  "Voice recognition requires the development build.";

let nativeModule: NativeSpeechRecognitionModule | null | undefined;
let unavailableReason: string | undefined;

declare const require: (moduleName: string) => unknown;

function isRunningInExpoGo() {
  return (
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
    Constants.appOwnership === "expo"
  );
}

function getNativeModule() {
  if (nativeModule !== undefined) {
    return nativeModule;
  }

  if (isRunningInExpoGo()) {
    nativeModule = null;
    unavailableReason = developmentBuildRequired;
    return nativeModule;
  }

  try {
    const speechRecognition = require(
      "expo-speech-recognition",
    ) as NativeSpeechRecognitionExports;
    nativeModule = speechRecognition.ExpoSpeechRecognitionModule ?? null;
    unavailableReason = nativeModule
      ? undefined
      : developmentBuildRequired;
  } catch (error) {
    nativeModule = null;
    unavailableReason = developmentBuildRequired;

    if (__DEV__) {
      console.warn("[voice-recognition] Disabled:", error);
    }
  }

  return nativeModule;
}

function asResultEvent(event: unknown): VoiceRecognitionResultEvent {
  const candidate = event as Partial<VoiceRecognitionResultEvent> | undefined;

  return {
    isFinal: Boolean(candidate?.isFinal),
    results: Array.isArray(candidate?.results) ? candidate.results : [],
  };
}

function asErrorEvent(event: unknown): VoiceRecognitionErrorEvent {
  const candidate = event as Partial<VoiceRecognitionErrorEvent> | undefined;

  return {
    error: candidate?.error ?? "unavailable",
    message: candidate?.message ?? unavailableReason ?? developmentBuildRequired,
  };
}

export async function getVoiceRecognitionAvailability(): Promise<VoiceRecognitionAvailability> {
  const module = getNativeModule();

  if (!module) {
    return {
      available: false,
      reason: unavailableReason ?? developmentBuildRequired,
    };
  }

  try {
    return module.isRecognitionAvailable()
      ? { available: true }
      : {
          available: false,
          reason: "Speech recognition is not available on this device.",
        };
  } catch (error) {
    return {
      available: false,
      reason:
        error instanceof Error
          ? error.message
          : "Speech recognition availability could not be checked.",
    };
  }
}

export async function isVoiceRecognitionAvailable() {
  const availability = await getVoiceRecognitionAvailability();

  return availability.available;
}

export async function startListening({
  continuous = false,
  contextualStrings = [],
}: VoiceRecognitionStartOptions = {}): Promise<VoiceRecognitionStartResult> {
  const availability = await getVoiceRecognitionAvailability();
  const module = getNativeModule();

  if (!availability.available || !module) {
    return {
      started: false,
      reason: availability.reason ?? developmentBuildRequired,
    };
  }

  try {
    const permission = await module.requestPermissionsAsync();

    if (!permission.granted) {
      return {
        started: false,
        reason: "Microphone and speech recognition permission are needed for voice commands.",
      };
    }

    module.start({
      lang: "en-US",
      interimResults: true,
      maxAlternatives: 1,
      continuous,
      contextualStrings,
      addsPunctuation: false,
    });

    return { started: true };
  } catch (error) {
    return {
      started: false,
      reason:
        error instanceof Error
          ? error.message
          : "Voice recognition could not start. Please try again.",
    };
  }
}

export function stopListening() {
  try {
    getNativeModule()?.stop();
  } catch (error) {
    if (__DEV__) {
      console.warn("[voice-recognition] Stop failed:", error);
    }
  }
}

export function abortListening() {
  try {
    getNativeModule()?.abort();
  } catch (error) {
    if (__DEV__) {
      console.warn("[voice-recognition] Abort failed:", error);
    }
  }
}

export function onStart(listener: () => void): VoiceRecognitionSubscription {
  const module = getNativeModule();

  if (!module) {
    return { remove: () => undefined };
  }

  return module.addListener("start", listener);
}

export function onEnd(listener: () => void): VoiceRecognitionSubscription {
  const module = getNativeModule();

  if (!module) {
    return { remove: () => undefined };
  }

  return module.addListener("end", listener);
}

export function onResult(
  listener: (event: VoiceRecognitionResultEvent) => void,
): VoiceRecognitionSubscription {
  const module = getNativeModule();

  if (!module) {
    return { remove: () => undefined };
  }

  return module.addListener("result", (event) => listener(asResultEvent(event)));
}

export function onError(
  listener: (event: VoiceRecognitionErrorEvent) => void,
): VoiceRecognitionSubscription {
  const module = getNativeModule();

  if (!module) {
    return { remove: () => undefined };
  }

  return module.addListener("error", (event) => listener(asErrorEvent(event)));
}

export const voiceRecognitionService = {
  getVoiceRecognitionAvailability,
  isVoiceRecognitionAvailable,
  startListening,
  stopListening,
  abortListening,
  onStart,
  onEnd,
  onResult,
  onError,
};
