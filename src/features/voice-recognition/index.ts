export {
  abortListening,
  getVoiceRecognitionAvailability,
  isVoiceRecognitionAvailable,
  onEnd,
  onError,
  onResult,
  onStart,
  startListening,
  stopListening,
  voiceRecognitionService,
} from "./lib/voice-recognition";

export type {
  VoiceRecognitionAvailability,
  VoiceRecognitionErrorEvent,
  VoiceRecognitionResultEvent,
  VoiceRecognitionStartOptions,
  VoiceRecognitionStartResult,
  VoiceRecognitionSubscription,
} from "./lib/voice-recognition";
