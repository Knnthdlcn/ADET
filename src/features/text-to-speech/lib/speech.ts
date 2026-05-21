import * as Speech from "expo-speech";

import { useSettingsStore } from "@entities/settings";

export function speakText(text: string) {
  const normalizedText = text.trim();

  if (!normalizedText || !useSettingsStore.getState().voiceFeedback) {
    return;
  }

  Speech.stop();
  Speech.speak(normalizedText, {
    language: "en-US",
    pitch: 1,
    rate: 0.94,
  });
}

export function stopSpeaking() {
  Speech.stop();
}
