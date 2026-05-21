export type ScanResult = {
  text: string;
  summary?: string;
  objects?: string[];
  warnings?: string[];
  confidence?: number;
};

export type ScanRecord = {
  id: string;
  text: string;
  summary: string;
  recognizedText: string;
  objects: string[];
  warnings: string[];
  confidence: number;
  imageUri: string | null;
  createdAt: string;
  status: "completed" | "mock";
};

export type IndoorMappingProject = {
  id: string;
  name: string;
  status: string;
  roomsMapped: number;
  lastUpdated: string;
  progress: number;
};

export type EmergencyContact = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
};
