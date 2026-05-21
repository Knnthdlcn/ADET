import { create } from "zustand";

import type { EmergencyContact, IndoorMappingProject, ScanRecord, ScanResult } from "./types";

type CompleteScanPayload = {
  text: string;
  imageUri?: string | null;
  status?: ScanRecord["status"];
  summary?: string;
  recognizedText?: string;
  objects?: string[];
  warnings?: string[];
  confidence?: number;
};

type VoiceMessage = {
  uri: string | null;
  mockResponse: string | null;
  durationMillis: number;
  status: "ready" | "recording" | "recorded" | "playing" | "error";
};

type ServerStatus = {
  connected: boolean;
  latencyMs: number;
  lastChecked: string;
};

type VoiceCommandState = {
  listening: boolean;
  transcript: string;
  status: "idle" | "listening" | "recognized" | "mock" | "error";
  error: string | null;
  engine: "native" | "mock";
};

type ScanResultState = {
  capturedImageUri: string | null;
  resultText: string | null;
  latestResult: ScanResult | null;
  recentScans: ScanRecord[];
  favoriteIds: string[];
  selectedScanId: string | null;
  voiceMessage: VoiceMessage;
  voiceCommand: VoiceCommandState;
  mappingProjects: IndoorMappingProject[];
  emergencyContacts: EmergencyContact[];
  serverStatus: ServerStatus;
  setCapturedImageUri: (uri: string | null) => void;
  setResultText: (text: string | null) => void;
  completeScan: (payload: CompleteScanPayload) => ScanRecord;
  selectScan: (id: string) => void;
  addFavorite: (record?: ScanRecord) => void;
  toggleFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  setVoiceRecordingUri: (uri: string | null, durationMillis?: number) => void;
  setVoiceRecordingStatus: (status: VoiceMessage["status"]) => void;
  setVoiceMockResponse: (response: string | null) => void;
  startVoiceCommand: (engine?: VoiceCommandState["engine"]) => void;
  setVoiceCommandTranscript: (transcript: string, status?: VoiceCommandState["status"]) => void;
  setVoiceCommandError: (error: string) => void;
  stopVoiceCommand: () => void;
  advanceMappingProject: (id: string) => void;
  testServerConnection: () => void;
  resetScan: () => void;
};

const now = Date.now();

const initialScans: ScanRecord[] = [
  {
    id: "scan-1",
    text: "Medication label: Take one tablet after meals.",
    summary: "A medication bottle label was detected and the dosage instruction is readable.",
    recognizedText: "Take one tablet after meals.",
    objects: ["medication bottle", "printed label", "table"],
    warnings: ["Confirm dosage with the prescription if unsure"],
    confidence: 0.94,
    imageUri: null,
    createdAt: new Date(now - 1000 * 60 * 33).toISOString(),
    status: "completed",
  },
  {
    id: "scan-2",
    text: "Door sign: Conference Room B.",
    summary: "A wall sign identifies a nearby doorway as Conference Room B.",
    recognizedText: "Conference Room B",
    objects: ["door", "wall sign", "hallway"],
    warnings: ["Doorway ahead"],
    confidence: 0.91,
    imageUri: null,
    createdAt: new Date(now - 1000 * 60 * 60 * 25).toISOString(),
    status: "completed",
  },
  {
    id: "scan-3",
    text: "Detected: Chair, table, laptop, and doorway ahead.",
    summary: "A desk area is ahead with a laptop, chair, table, and doorway in view.",
    recognizedText: "",
    objects: ["laptop", "chair", "desk", "doorway"],
    warnings: ["Doorway ahead"],
    confidence: 0.92,
    imageUri: null,
    createdAt: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
    status: "mock",
  },
  {
    id: "scan-4",
    text: "Warning: Stairs detected nearby.",
    summary: "A staircase appears close to the walking path.",
    recognizedText: "",
    objects: ["stairs", "handrail", "floor"],
    warnings: ["Stairs detected nearby"],
    confidence: 0.89,
    imageUri: null,
    createdAt: new Date(now - 1000 * 60 * 60 * 73).toISOString(),
    status: "mock",
  },
  {
    id: "scan-5",
    text: "Text found: Exit sign on the left wall.",
    summary: "An exit sign is visible on the left wall.",
    recognizedText: "EXIT",
    objects: ["exit sign", "left wall", "hallway"],
    warnings: [],
    confidence: 0.96,
    imageUri: null,
    createdAt: new Date(now - 1000 * 60 * 60 * 96).toISOString(),
    status: "completed",
  },
];

export const mockAiResult: ScanResult = {
  text: "Detected: Chair, table, laptop, and doorway ahead.",
  summary: "A desk with a laptop, a chair, and a doorway ahead.",
  objects: ["laptop", "chair", "desk", "doorway"],
  warnings: ["Doorway ahead"],
  confidence: 0.92,
};

export const useScanResultStore = create<ScanResultState>((set, get) => ({
  capturedImageUri: null,
  resultText: null,
  latestResult: null,
  recentScans: initialScans,
  favoriteIds: ["scan-1"],
  selectedScanId: initialScans[0]?.id ?? null,
  voiceMessage: {
    uri: null,
    mockResponse: null,
    durationMillis: 0,
    status: "ready",
  },
  voiceCommand: {
    listening: false,
    transcript: "",
    status: "idle",
    error: null,
    engine: "mock",
  },
  mappingProjects: [
    {
      id: "map-1",
      name: "Home Living Room",
      status: "Training mock model",
      roomsMapped: 3,
      lastUpdated: "Today",
      progress: 62,
    },
    {
      id: "map-2",
      name: "School Hallway",
      status: "Offline model ready",
      roomsMapped: 6,
      lastUpdated: "Yesterday",
      progress: 100,
    },
    {
      id: "map-3",
      name: "Office Entrance",
      status: "Capturing room images",
      roomsMapped: 1,
      lastUpdated: "May 19",
      progress: 24,
    },
  ],
  emergencyContacts: [
    {
      id: "contact-1",
      name: "Maria Santos",
      relationship: "Primary contact",
      phone: "+63 900 123 4567",
    },
    {
      id: "contact-2",
      name: "Kenneth Support",
      relationship: "Care partner",
      phone: "+63 917 555 0199",
    },
  ],
  serverStatus: {
    connected: true,
    latencyMs: 42,
    lastChecked: new Date().toISOString(),
  },
  setCapturedImageUri: (uri) => set({ capturedImageUri: uri, resultText: null, latestResult: null }),
  setResultText: (text) => set({ resultText: text }),
  completeScan: (payload) => {
    const result: ScanResult = {
      text: payload.text,
      summary: payload.summary ?? payload.text,
      objects: payload.objects ?? ["document", "surface"],
      warnings: payload.warnings ?? [],
      confidence: payload.confidence ?? 0.9,
    };
    const record: ScanRecord = {
      id: `scan-${Date.now()}`,
      text: payload.text,
      summary: result.summary ?? payload.text,
      recognizedText: payload.recognizedText ?? payload.text,
      objects: result.objects ?? [],
      warnings: result.warnings ?? [],
      confidence: result.confidence ?? 0.9,
      imageUri: payload.imageUri ?? null,
      createdAt: new Date().toISOString(),
      status: payload.status ?? "completed",
    };

    set((state) => ({
      resultText: payload.text,
      latestResult: result,
      capturedImageUri: record.imageUri,
      selectedScanId: record.id,
      recentScans: [record, ...state.recentScans],
    }));

    return record;
  },
  selectScan: (id) => set({ selectedScanId: id }),
  addFavorite: (record) => {
    const currentRecord =
      record ??
      get().recentScans.find((scan) => scan.id === get().selectedScanId) ??
      null;

    if (!currentRecord) {
      return;
    }

    set((state) =>
      state.favoriteIds.includes(currentRecord.id)
        ? state
        : { favoriteIds: [currentRecord.id, ...state.favoriteIds] },
    );
  },
  toggleFavorite: (id) =>
    set((state) => ({
      favoriteIds: state.favoriteIds.includes(id)
        ? state.favoriteIds.filter((favoriteId) => favoriteId !== id)
        : [id, ...state.favoriteIds],
    })),
  removeFavorite: (id) =>
    set((state) => ({
      favoriteIds: state.favoriteIds.filter((favoriteId) => favoriteId !== id),
    })),
  setVoiceRecordingUri: (uri, durationMillis = 0) =>
    set((state) => ({
      voiceMessage: {
        ...state.voiceMessage,
        uri,
        durationMillis: uri ? durationMillis : 0,
        status: uri ? "recorded" : "ready",
        mockResponse: uri ? state.voiceMessage.mockResponse : null,
      },
    })),
  setVoiceRecordingStatus: (status) =>
    set((state) => ({
      voiceMessage: {
        ...state.voiceMessage,
        status,
      },
    })),
  setVoiceMockResponse: (response) =>
    set((state) => ({
      voiceMessage: {
        ...state.voiceMessage,
        mockResponse: response,
      },
    })),
  startVoiceCommand: (engine = "mock") =>
    set({
      voiceCommand: {
        listening: true,
        transcript: "",
        status: "listening",
        error: null,
        engine,
      },
    }),
  setVoiceCommandTranscript: (transcript, status = "recognized") =>
    set((state) => ({
      voiceCommand: {
        ...state.voiceCommand,
        transcript,
        status,
      },
    })),
  setVoiceCommandError: (error) =>
    set((state) => ({
      voiceCommand: {
        ...state.voiceCommand,
        listening: false,
        status: "error",
        error,
      },
    })),
  stopVoiceCommand: () =>
    set((state) => ({
      voiceCommand: {
        ...state.voiceCommand,
        listening: false,
        status: state.voiceCommand.status === "listening" ? "idle" : state.voiceCommand.status,
      },
    })),
  advanceMappingProject: (id) =>
    set((state) => ({
      mappingProjects: state.mappingProjects.map((project) => {
        if (project.id !== id) {
          return project;
        }

        const nextProgress = Math.min(project.progress + 25, 100);
        const status =
          nextProgress >= 100
            ? "Offline model ready"
            : nextProgress >= 75
              ? "Training indoor model"
              : nextProgress >= 45
                ? "Uploading to AI server"
                : "Capturing room images";

        return {
          ...project,
          progress: nextProgress,
          status,
          lastUpdated: "Just now",
        };
      }),
    })),
  testServerConnection: () =>
    set({
      serverStatus: {
        connected: true,
        latencyMs: 38 + Math.floor(Math.random() * 45),
        lastChecked: new Date().toISOString(),
      },
    }),
  resetScan: () => set({ capturedImageUri: null, resultText: null, latestResult: null }),
}));
