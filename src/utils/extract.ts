export function extractCriteria(event: unknown): string | null {
  const payload = getPayload(event);
  const candidates = [
    payload.criteria,
    payload.requirements,
    payload.spec,
    payload.task,
    payload.instructions,
    payload.prompt
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return null;
}

export function extractDeliverable(event: unknown): unknown {
  const payload = getPayload(event);
  const candidates = [
    payload.deliverable,
    payload.output,
    payload.result,
    payload.submission,
    payload.artifact
  ];

  for (const candidate of candidates) {
    if (candidate !== undefined && candidate !== null) {
      return candidate;
    }
  }

  return null;
}

export function extractCode(event: unknown): { code: string | null; language: string | null } {
  const deliverable = extractDeliverable(event);

  if (typeof deliverable === "string") {
    return { code: deliverable.trim(), language: null };
  }

  if (deliverable && typeof deliverable === "object") {
    const payload = deliverable as Record<string, unknown>;
    const codeCandidate =
      pickString(payload.code) ??
      pickString(payload.source) ??
      pickString(payload.content) ??
      pickString(payload.snippet);
    const language = pickString(payload.language) ?? pickString(payload.lang);

    if (codeCandidate) {
      return { code: codeCandidate, language };
    }
  }

  return { code: null, language: null };
}

export function formatEvidence(deliverable: unknown, maxLength = 4000): string {
  if (deliverable === null || deliverable === undefined) {
    return "<no deliverable provided>";
  }

  if (typeof deliverable === "string") {
    return truncate(deliverable, maxLength);
  }

  return truncate(safeStringify(deliverable), maxLength);
}

function getPayload(event: unknown): Record<string, unknown> {
  if (!event || typeof event !== "object") return {};
  const payload = event as Record<string, unknown>;
  const nested =
    (payload.payload as Record<string, unknown> | undefined) ??
    (payload.data as Record<string, unknown> | undefined) ??
    {};

  return { ...payload, ...nested };
}

function pickString(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return null;
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}\n...<truncated>`;
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
