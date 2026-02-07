import { judgeCode } from "./judges/code";
import { judgeText } from "./judges/text";
import type { Env, JobType, JudgeVerdict } from "./types";
import { extractCode } from "./utils/extract";

export async function routeToJudge(event: unknown, env: Env): Promise<JudgeVerdict> {
  const jobType = detectJobType(event);

  if (jobType === "code") {
    return judgeCode(event, env);
  }

  return judgeText(event, env);
}

function detectJobType(event: unknown): JobType {
  if (!event || typeof event !== "object") return "unknown";
  const payload = event as Record<string, unknown>;
  const candidates = [
    payload.jobType,
    payload.job_type,
    (payload.payload as Record<string, unknown> | undefined)?.jobType,
    (payload.payload as Record<string, unknown> | undefined)?.job_type,
    (payload.data as Record<string, unknown> | undefined)?.jobType,
    (payload.data as Record<string, unknown> | undefined)?.job_type,
    (payload.deliverable as Record<string, unknown> | undefined)?.type
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      const normalized = candidate.toLowerCase();
      if (normalized.includes("code")) return "code";
      if (normalized.includes("text")) return "text";
    }
  }

  const extracted = extractCode(event);
  if (extracted.code) return "code";

  return "unknown";
}
