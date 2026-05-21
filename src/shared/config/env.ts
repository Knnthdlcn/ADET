const fallbackApiBaseUrl = "https://your-api-url.com";
const configuredApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "");

export const env = {
  apiBaseUrl: configuredApiBaseUrl || fallbackApiBaseUrl,
} as const;

export const isApiConfigured =
  Boolean(configuredApiBaseUrl) && configuredApiBaseUrl !== fallbackApiBaseUrl;
