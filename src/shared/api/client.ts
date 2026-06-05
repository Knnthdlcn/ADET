import { env } from "@shared/config/env";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | FormData;
};

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

/**
 * POSTs a FormData payload to the VisionAssist server, which responds with a
 * newline-delimited stream of JSON token chunks:
 *   {"token": "In the scene...", "done": false}
 *   {"token": "",               "done": true}
 *
 * We collect every token into a full string, then map it to the ScanResult
 * shape the rest of the app expects.
 */
async function postFormStreaming<TResponse>(path: string, formData: FormData): Promise<TResponse> {
  const url = buildUrl(path);
  console.log(`[api] POST ${url}`);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    console.error(`[api] fetch() threw — likely a network/connection error:`, err);
    throw new ApiError(
      `Cannot reach server at ${url}. Is it running and on the same network?`,
      undefined,
      err,
    );
  }

  console.log(`[api] Response status: ${response.status} ${response.statusText}`);
  console.log(`[api] Response content-type: ${response.headers.get("content-type")}`);

  // Check for HTTP-level errors first (4xx, 5xx)
  if (!response.ok) {
    let errorPayload: unknown = null;
    try { errorPayload = await response.json(); } catch { /* ignore */ }
    const message =
      typeof errorPayload === "object" && errorPayload && "error" in errorPayload
        ? String((errorPayload as Record<string, unknown>).error)
        : "Image analysis failed. Please try again.";
    console.error(`[api] Server error ${response.status}:`, errorPayload);
    throw new ApiError(message, response.status, errorPayload);
  }

  // React Native's fetch may return a null body even on 200 for streaming
  // responses — fall back to response.text() which always works.
  let rawText: string;
  if (response.body) {
    console.log(`[api] Reading via streaming reader ...`);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const chunks: string[] = [];
    let chunkCount = 0;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      chunkCount++;
      chunks.push(decoder.decode(value, { stream: true }));
    }
    rawText = chunks.join("");
    console.log(`[api] Stream complete — ${chunkCount} raw chunks, ${rawText.length} chars`);
  } else {
    console.log(`[api] response.body is null — falling back to response.text()`);
    rawText = await response.text();
    console.log(`[api] response.text() length: ${rawText.length} chars`);
  }

  // Parse the newline-delimited JSON token stream
  let fullText = "";
  const lines = rawText.split("\n");
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const chunk = JSON.parse(line) as { token?: string; done?: boolean; error?: string };
      if (chunk.error) {
        console.error(`[api] Error chunk from server:`, chunk.error);
        throw new ApiError(chunk.error);
      }
      if (chunk.token) fullText += chunk.token;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      console.warn(`[api] Could not parse stream line:`, line);
    }
  }

  console.log(`[api] Parsed ${lines.length} lines, final text length: ${fullText.length} chars`);
  if (!fullText.trim()) console.warn(`[api] Warning: assembled text is empty.`);

  const text = fullText.trim() || "No description available.";

  // Map the plain-text Gemma description to the ScanResult shape
  const result = {
    text,
    summary: text,
    objects: [] as string[],
    warnings: [] as string[],
    confidence: 0.9,
  };

  return result as TResponse;
}

export const apiClient = {
  postForm<TResponse>(path: string, formData: FormData) {
    return postFormStreaming<TResponse>(path, formData);
  },
};
