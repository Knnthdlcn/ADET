import * as Speech from "expo-speech";

import { useSettingsStore } from "@entities/settings";

let preferredVoice: string | null | undefined;

async function resolvePreferredVoice() {
  if (preferredVoice !== undefined) {
    return preferredVoice;
  }

  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const englishVoices = voices.filter((voice) =>
      voice.language.toLowerCase().startsWith("en"),
    );
    const scoredVoices = englishVoices
      .map((voice) => {
        const name = voice.name.toLowerCase();
        const identifier = voice.identifier.toLowerCase();
        let score = voice.quality === Speech.VoiceQuality.Enhanced ? 20 : 0;

        if (name.includes("samantha") || name.includes("ava")) score += 12;
        if (name.includes("siri")) score += 10;
        if (name.includes("karen") || name.includes("moira")) score += 8;
        if (name.includes("female") || identifier.includes("female")) score += 4;
        if (voice.language.toLowerCase() === "en-us") score += 3;

        return { voice, score };
      })
      .sort((a, b) => b.score - a.score);

    preferredVoice = scoredVoices[0]?.voice.identifier ?? null;
  } catch {
    preferredVoice = null;
  }

  return preferredVoice;
}

export function speakText(text: string, options: Speech.SpeechOptions = {}) {
  const normalizedText = text.trim();

  if (!normalizedText || !useSettingsStore.getState().voiceFeedback) {
    return false;
  }

  Speech.stop();
  Speech.speak(normalizedText, {
    language: "en-US",
    pitch: 1.01,
    rate: 0.92,
    useApplicationAudioSession: false,
    voice: preferredVoice ?? undefined,
    ...options,
  });
  void resolvePreferredVoice().then((voice) => {
    if (!voice) {
      return;
    }

    preferredVoice = voice;
  });

  return true;
}

export function stopSpeaking() {
  Speech.stop();
}
