import { useEffect } from "react";

import { useSettingsStore } from "@entities/settings";
import { speakText, stopSpeaking } from "../lib/speech";

export function useSpeakOnResult(text: string | null) {
  const autoReadResults = useSettingsStore((state) => state.autoReadResults);

  useEffect(() => {
    if (text && autoReadResults) {
      speakText(text);
    }

    return () => {
      stopSpeaking();
    };
  }, [autoReadResults, text]);
}
