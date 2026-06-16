export type AssistiveMode = "scene" | "text" | "object" | "guide";
export type DetailLevel = "brief" | "standard" | "detailed";
export type AssistantIntent =
  | "describe_scene"
  | "read_text"
  | "check_path"
  | "find_object"
  | "repeat"
  | "stop"
  | "increase_detail"
  | "decrease_detail"
  | "set_detail"
  | "help"
  | "emergency"
  | "start_continuous"
  | "stop_continuous";

export const assistiveModes: Array<{
  id: AssistiveMode;
  label: string;
  description: string;
}> = [
  {
    id: "scene",
    label: "Scene",
    description: "General environment description",
  },
  {
    id: "text",
    label: "Text",
    description: "Read visible text",
  },
  {
    id: "object",
    label: "Object",
    description: "Identify the object being pointed at",
  },
  {
    id: "guide",
    label: "Guide",
    description: "Navigation and obstacle guidance",
  },
];

export type AssistantCommand =
  | {
      action: "analyze";
      intent: Extract<AssistantIntent, "describe_scene" | "read_text" | "check_path" | "find_object">;
      mode: AssistiveMode;
      transcript: string;
      label: string;
      target?: string;
      direction?: "left" | "right" | "ahead" | "around";
    }
  | { action: "repeat"; intent: "repeat"; transcript: string; label: string }
  | { action: "stopAudio"; intent: "stop"; transcript: string; label: string }
  | { action: "help"; intent: "help"; transcript: string; label: string }
  | { action: "emergency"; intent: "emergency"; transcript: string; label: string }
  | { action: "increaseDetail"; intent: "increase_detail"; transcript: string; label: string }
  | { action: "decreaseDetail"; intent: "decrease_detail"; transcript: string; label: string }
  | { action: "setDetail"; intent: "set_detail"; detailLevel: DetailLevel; transcript: string; label: string }
  | { action: "startContinuous"; intent: "start_continuous"; transcript: string; label: string }
  | { action: "stopContinuous"; intent: "stop_continuous"; transcript: string; label: string }
  | { action: "unknown"; transcript: string };

function normalizeTranscript(transcript: string) {
  return transcript
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(normalized: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(normalized));
}

function cleanTarget(target: string | undefined) {
  if (!target) {
    return undefined;
  }

  const cleaned = target
    .replace(/\b(please|nearby|around me|for me|right now|here)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || undefined;
}

function getDirection(normalized: string) {
  if (/\bleft\b/.test(normalized)) return "left";
  if (/\bright\b/.test(normalized)) return "right";
  if (/\bfront\b|\bahead\b/.test(normalized)) return "ahead";
  if (/\baround\b/.test(normalized)) return "around";

  return undefined;
}

function getFindTarget(normalized: string) {
  const directFind = normalized.match(
    /\b(?:find|locate|look for|where is|where are)\s+(?:my |the |a |an )?(.+?)$/,
  );

  if (directFind?.[1]) {
    return cleanTarget(directFind[1]);
  }

  const nearbyObject = normalized.match(
    /\bis there\s+(?:a |an |any )?(.+?)\s+(?:nearby|near me|around me)?$/,
  );

  return cleanTarget(nearbyObject?.[1]);
}

export function parseAssistantCommand(transcript: string): AssistantCommand {
  const trimmedTranscript = transcript.trim();
  const normalized = normalizeTranscript(transcript);

  if (!normalized) {
    return { action: "unknown", transcript };
  }

  if (hasAny(normalized, [/\bstop continuous\b/, /\bstop guidance\b/, /\bstop listening\b/])) {
    return {
      action: "stopContinuous",
      intent: "stop_continuous",
      transcript: trimmedTranscript,
      label: "stop continuous mode",
    };
  }

  if (hasAny(normalized, [/^stop$/, /\bstop audio\b/, /\bbe quiet\b/, /\bsilence\b/, /\bquiet\b/])) {
    return {
      action: "stopAudio",
      intent: "stop",
      transcript: trimmedTranscript,
      label: "stop",
    };
  }

  if (hasAny(normalized, [/\brepeat\b/, /\bsay that again\b/, /\bagain\b/])) {
    return {
      action: "repeat",
      intent: "repeat",
      transcript: trimmedTranscript,
      label: "repeat",
    };
  }

  if (hasAny(normalized, [/\bincrease detail\b/, /\bmore detail\b/, /\bmore detailed\b/])) {
    return {
      action: "increaseDetail",
      intent: "increase_detail",
      transcript: trimmedTranscript,
      label: "increase detail",
    };
  }

  if (hasAny(normalized, [/\bdecrease detail\b/, /\bless detail\b/, /\bshort answer\b/, /\bbrief answer\b/])) {
    return {
      action: "decreaseDetail",
      intent: "decrease_detail",
      transcript: trimmedTranscript,
      label: "decrease detail",
    };
  }

  if (hasAny(normalized, [/\bstandard detail\b/, /\bnormal detail\b/, /\bstandard answer\b/])) {
    return {
      action: "setDetail",
      intent: "set_detail",
      detailLevel: "standard",
      transcript: trimmedTranscript,
      label: "standard detail",
    };
  }

  if (hasAny(normalized, [/\bdetailed mode\b/, /\bdetailed answer\b/, /\bdetailed description\b/])) {
    return {
      action: "setDetail",
      intent: "set_detail",
      detailLevel: "detailed",
      transcript: trimmedTranscript,
      label: "detailed mode",
    };
  }

  if (hasAny(normalized, [/\bbrief mode\b/, /\bshort mode\b/, /\bshort description\b/])) {
    return {
      action: "setDetail",
      intent: "set_detail",
      detailLevel: "brief",
      transcript: trimmedTranscript,
      label: "short answer",
    };
  }

  if (hasAny(normalized, [/\bwhat can i say\b/, /\bvoice help\b/, /^help$/, /\bcommands\b/])) {
    return {
      action: "help",
      intent: "help",
      transcript: trimmedTranscript,
      label: "help",
    };
  }

  if (hasAny(normalized, [/\bemergency\b/, /\bcall for help\b/, /^help me$/])) {
    return {
      action: "emergency",
      intent: "emergency",
      transcript: trimmedTranscript,
      label: "emergency help",
    };
  }

  if (hasAny(normalized, [/\bstart continuous\b/, /\bcontinuous guidance\b/, /\bcontinuous mode\b/, /\bkeep listening\b/])) {
    return {
      action: "startContinuous",
      intent: "start_continuous",
      transcript: trimmedTranscript,
      label: "start continuous mode",
    };
  }

  if (hasAny(normalized, [/\bread\b/, /\bwhat does this say\b/, /\btext\b/, /\bsign\b/, /\bdocument\b/, /\blabel\b/])) {
    return {
      action: "analyze",
      intent: "read_text",
      mode: "text",
      transcript: trimmedTranscript,
      label: "read this",
    };
  }

  const findTarget = getFindTarget(normalized);

  if (findTarget) {
    return {
      action: "analyze",
      intent: "find_object",
      mode: "object",
      target: findTarget,
      transcript: trimmedTranscript,
      label: `find ${findTarget}`,
    };
  }

  if (
    hasAny(normalized, [
      /\bis the path clear\b/,
      /\bpath\b.*\b(clear|blocked|obstructed|safe)\b/,
      /\bare there obstacles\b/,
      /\bobstacle\b/,
      /\bhazard\b/,
      /\bhelp me walk\b/,
      /\bguide me\b/,
      /\bnavigate\b/,
      /\bwhere should i go\b/,
      /\bstairs\b/,
      /\bdoor\b/,
    ])
  ) {
    return {
      action: "analyze",
      intent: "check_path",
      mode: "guide",
      transcript: trimmedTranscript,
      label: "check the path",
      direction: getDirection(normalized),
    };
  }

  if (hasAny(normalized, [/\bperson nearby\b/, /\bperson near me\b/, /\bobject\b/, /\bpointing at\b/])) {
    return {
      action: "analyze",
      intent: "find_object",
      mode: "object",
      target: normalized.includes("person") ? "person" : "object",
      transcript: trimmedTranscript,
      label: normalized.includes("person") ? "find a person nearby" : "identify the object",
    };
  }

  if (
    hasAny(normalized, [
      /\bwhat is in front of me\b/,
      /\bwhat's in front of me\b/,
      /\bwhat is around me\b/,
      /\bdescribe\b/,
      /\broom\b/,
      /\bwhat do you see\b/,
      /\bwhat is on my left\b/,
      /\bwhat is on my right\b/,
      /\banalyze this\b/,
      /\blook around\b/,
      /\bsee\b/,
    ])
  ) {
    return {
      action: "analyze",
      intent: "describe_scene",
      mode: "scene",
      transcript: trimmedTranscript,
      label: "describe the scene",
      direction: getDirection(normalized),
    };
  }

  return { action: "unknown", transcript };
}
