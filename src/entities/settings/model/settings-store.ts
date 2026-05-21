import { create } from "zustand";

export type SettingsKey =
  | "voiceFeedback"
  | "autoReadResults"
  | "largeTextMode"
  | "highContrastMode"
  | "hapticFeedback"
  | "offlineMode"
  | "reduceMotion";

type SettingsState = Record<SettingsKey, boolean> & {
  toggleSetting: (key: SettingsKey) => void;
  setSetting: (key: SettingsKey, value: boolean) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  voiceFeedback: true,
  autoReadResults: true,
  largeTextMode: false,
  highContrastMode: false,
  hapticFeedback: true,
  offlineMode: false,
  reduceMotion: false,
  toggleSetting: (key) => set((state) => ({ [key]: !state[key] })),
  setSetting: (key, value) => set({ [key]: value }),
}));
