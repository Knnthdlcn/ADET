import { create } from "zustand";

type ScanSessionState = {
  capturedImageUri: string | null;
  resultText: string | null;
  setCapturedImageUri: (uri: string | null) => void;
  setResultText: (text: string | null) => void;
  resetScan: () => void;
};

export const useScanSessionStore = create<ScanSessionState>((set) => ({
  capturedImageUri: null,
  resultText: null,
  setCapturedImageUri: (uri) =>
    set({
      capturedImageUri: uri,
      resultText: null,
    }),
  setResultText: (text) => set({ resultText: text }),
  resetScan: () =>
    set({
      capturedImageUri: null,
      resultText: null,
    }),
}));
