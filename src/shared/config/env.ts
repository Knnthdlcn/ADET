import Constants from "expo-constants";
import { Platform } from "react-native";

const fallbackApiBaseUrl = "https://your-api-url.com";
const defaultBackendPort = "3000";
const configuredApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "");

type ApiBaseUrlSource = "env" | "expo-host" | "fallback";

type ConstantsWithLegacyManifest = typeof Constants & {
  manifest?: {
    debuggerHost?: string;
    hostUri?: string;
  } | null;
  linkingUri?: string | null;
};

function isPlaceholderApiUrl(value: string | undefined) {
  if (!value) {
    return true;
  }

  const normalized = value.toLowerCase();

  return (
    normalized === fallbackApiBaseUrl ||
    normalized.includes("your-api-url.com") ||
    normalized.includes("192.168.x.x")
  );
}

function getExpoHostUri() {
  const constants = Constants as ConstantsWithLegacyManifest;

  return (
    Constants.expoConfig?.hostUri ??
    constants.manifest?.hostUri ??
    constants.manifest?.debuggerHost ??
    constants.linkingUri ??
    null
  );
}

function getHostname(value: string | null) {
  if (!value) {
    return null;
  }

  const urlLike = value.includes("://") ? value : `http://${value}`;

  try {
    return new URL(urlLike).hostname;
  } catch {
    return null;
  }
}

function inferApiBaseUrlFromExpoHost() {
  const hostname = getHostname(getExpoHostUri());

  if (hostname && !["localhost", "127.0.0.1", "0.0.0.0"].includes(hostname)) {
    return `http://${hostname}:${defaultBackendPort}`;
  }

  if (!__DEV__) {
    return null;
  }

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${defaultBackendPort}`;
  }

  if (Platform.OS === "ios" || Platform.OS === "web") {
    return `http://localhost:${defaultBackendPort}`;
  }

  return null;
}

const explicitApiBaseUrl = !isPlaceholderApiUrl(configuredApiBaseUrl)
  ? configuredApiBaseUrl
  : null;
const inferredApiBaseUrl = inferApiBaseUrlFromExpoHost();
const apiBaseUrlSource: ApiBaseUrlSource = explicitApiBaseUrl
  ? "env"
  : inferredApiBaseUrl
    ? "expo-host"
    : "fallback";

export const env = {
  apiBaseUrl: explicitApiBaseUrl ?? inferredApiBaseUrl ?? fallbackApiBaseUrl,
  apiBaseUrlSource,
  apiEndpointPort: defaultBackendPort,
} as const;

export const isApiConfigured = env.apiBaseUrlSource !== "fallback";
