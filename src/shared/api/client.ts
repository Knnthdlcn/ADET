import { env } from "@shared/config/env";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | FormData;
};

export const backendUnavailableMessage =
  "Backend analysis is unavailable. Please make sure the backend server is running and the API URL is correct.";

const invalidAnalysisResponseMessage =
  "The backend response did not include a readable analysis result.";
const analysisTimeoutMs = 45_000;
const analysisTextKeys = [
  "description",
  "text",
  "analysis",
  "result",
  "summary",
  "caption",
  "ocr",
  "recognizedText",
  "response",
  "output",
] as const;
const nestedPayloadKeys = ["data", "payload", "result", "analysis", "response", "output"] as const;

export class ApiError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function buildUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${env.apiBaseUrl}${normalizedPath}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}

function findTextValue(value: unknown, depth = 0): string | null {
  if (typeof value === "string") {
    return value.trim() || null;
  }

  if (Array.isArray(value)) {
    const directStrings = value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);

    if (directStrings.length > 0) {
      return directStrings.join(", ");
    }

    if (depth >= 3) {
      return null;
    }

    for (const item of value) {
      const text = findTextValue(item, depth + 1);
      if (text) {
        return text;
      }
    }
  }

  if (!isRecord(value) || depth >= 3) {
    return null;
  }

  for (const key of analysisTextKeys) {
    const text = typeof value[key] === "string" ? String(value[key]).trim() : "";

    if (text) {
      return text;
    }
  }

  for (const key of nestedPayloadKeys) {
    const text = findTextValue(value[key], depth + 1);

    if (text) {
      return text;
    }
  }

  const message = typeof value.message === "string" ? value.message.trim() : "";

  return message || null;
}

function findStringArray(value: unknown, keys: readonly string[], depth = 0): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (!isRecord(value) || depth >= 3) {
    return [];
  }

  for (const key of keys) {
    const direct = findStringArray(value[key], keys, depth + 1);

    if (direct.length > 0) {
      return direct;
    }
  }

  for (const key of nestedPayloadKeys) {
    const nested = findStringArray(value[key], keys, depth + 1);

    if (nested.length > 0) {
      return nested;
    }
  }

  return [];
}

function findNumber(value: unknown, keys: readonly string[], depth = 0): number | undefined {
  if (!isRecord(value) || depth >= 3) {
    return undefined;
  }

  for (const key of keys) {
    const directValue = value[key];

    if (typeof directValue === "number" && Number.isFinite(directValue)) {
      return directValue;
    }
  }

  for (const key of nestedPayloadKeys) {
    const nestedValue = findNumber(value[key], keys, depth + 1);

    if (nestedValue !== undefined) {
      return nestedValue;
    }
  }

  return undefined;
}

function toScanResultPayload(payload: unknown) {
  const text = findTextValue(payload);

  if (!text) {
    throw new ApiError(invalidAnalysisResponseMessage, undefined, payload);
  }

  const summary =
    isRecord(payload) && typeof payload.summary === "string" ? payload.summary.trim() : "";
  const objects = findStringArray(payload, ["objects", "labels", "detections"]);
  const warnings = findStringArray(payload, ["warnings", "warning"]);
  const confidence = findNumber(payload, ["confidence", "score", "probability"]);

  return {
    text,
    summary: summary || text,
    objects,
    warnings,
    confidence: confidence ?? 0.9,
  };
}

function parseStreamingText(rawText: string) {
  let fullText = "";
  let parsedLines = 0;

  for (const rawLine of rawText.split("\n")) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    const payloadLine = line.startsWith("data:") ? line.slice(5).trim() : line;

    if (payloadLine === "[DONE]") {
      continue;
    }

    const chunk = parseJson(payloadLine);

    if (!isRecord(chunk)) {
      continue;
    }

    parsedLines += 1;

    if (chunk.error) {
      throw new ApiError(String(chunk.error), undefined, chunk);
    }

    if (typeof chunk.token === "string") {
      fullText += chunk.token;
      continue;
    }

    const text = findTextValue(chunk);

    if (text && !chunk.done) {
      fullText += text;
    }
  }

  return parsedLines > 0 ? fullText.trim() : null;
}

function parseAnalysisResponse(rawText: string) {
  const trimmed = rawText.trim();

  if (!trimmed) {
    throw new ApiError(invalidAnalysisResponseMessage);
  }

  const jsonPayload = parseJson(trimmed);

  if (jsonPayload !== undefined) {
    return toScanResultPayload(jsonPayload);
  }

  const streamedText = parseStreamingText(trimmed);

  return toScanResultPayload(streamedText ?? trimmed);
}

async function parseResponse(response: Response) {
  const rawBody = await response.text();

  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
}

async function request<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const response = await fetch(buildUrl(path), {
    ...options,
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
  });
  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String(payload.message)
        : "The request could not be completed.";

    throw new ApiError(message, response.status, payload);
  }

  return payload as TResponse;
}

async function postFormStreaming<TResponse>(path: string, formData: FormData): Promise<TResponse> {
  const url = buildUrl(path);
  console.log(`[api] POST ${url}`);

  let response: Response;
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), analysisTimeoutMs);

  try {
    response = await fetch(url, {
      method: "POST",
      body: formData,
      signal: abortController.signal,
    });
  } catch (err) {
    console.error("[api] fetch() failed:", err);
    throw new ApiError(backendUnavailableMessage, undefined, err);
  } finally {
    clearTimeout(timeoutId);
  }

  console.log(`[api] Response status: ${response.status} ${response.statusText}`);
  console.log(`[api] Response content-type: ${response.headers.get("content-type")}`);

  if (!response.ok) {
    const errorText = await response.text();
    const errorPayload = parseJson(errorText) ?? errorText;
    const message =
      isRecord(errorPayload) && errorPayload.error
        ? String(errorPayload.error)
        : isRecord(errorPayload) && errorPayload.message
          ? String(errorPayload.message)
          : "Image analysis failed. Please try again.";

    console.error(`[api] Server error ${response.status}:`, errorPayload);
    throw new ApiError(message, response.status, errorPayload);
  }

  let rawText: string;
  if (response.body) {
    console.log("[api] Reading via streaming reader ...");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const chunks: string[] = [];
    let chunkCount = 0;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      chunkCount += 1;
      chunks.push(decoder.decode(value, { stream: true }));
    }
    rawText = chunks.join("");
    console.log(`[api] Stream complete - ${chunkCount} raw chunks, ${rawText.length} chars`);
  } else {
    console.log("[api] response.body is null - falling back to response.text()");
    rawText = await response.text();
    console.log(`[api] response.text() length: ${rawText.length} chars`);
  }

  const result = parseAnalysisResponse(rawText);
  console.log(`[api] Parsed analysis text length: ${result.text.length} chars`);

  return result as TResponse;
}

export const apiClient = {
  post<TResponse>(path: string, options?: RequestOptions) {
    return request<TResponse>(path, options);
  },
  postForm<TResponse>(path: string, formData: FormData) {
    return postFormStreaming<TResponse>(path, formData);
  },
};
