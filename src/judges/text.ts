import type { Env, JudgeVerdict } from "../types";
import { extractCriteria, extractDeliverable, formatEvidence } from "../utils/extract";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-3-5-sonnet-20240620";

export async function judgeText(event: unknown, env: Env): Promise<JudgeVerdict> {
  if (!env.ANTHROPIC_API_KEY) {
    return {
      approved: false,
      reason: "Missing ANTHROPIC_API_KEY for text judge.",
      judge: "text"
    };
  }

  const criteria = extractCriteria(event) ?? "No explicit criteria provided.";
  const deliverable = extractDeliverable(event);
  const evidence = formatEvidence(deliverable);

  const { system, user } = buildPrompt(criteria, evidence);
  const response = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 400,
      temperature: 0.2,
      system,
      messages: [{ role: "user", content: user }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      approved: false,
      reason: `Anthropic error: ${response.status} ${errorText.slice(0, 200)}`,
      judge: "text"
    };
  }

  const payload = (await response.json()) as AnthropicResponse;
  const contentText = extractContentText(payload);
  const parsed = parseVerdict(contentText);

  if (!parsed) {
    return {
      approved: false,
      reason: "Anthropic response was not valid JSON.",
      judge: "text"
    };
  }

  return {
    approved: Boolean(parsed.approved),
    reason: parsed.reason || "No reason provided.",
    judge: "text"
  };
}

function buildPrompt(criteria: string, evidence: string): { system: string; user: string } {
  return {
    system: "You are an impartial judge for ACP deliverables.",
    user: [
      "Return ONLY strict JSON with keys: approved (boolean), reason (string).",
      "TASK/CRITERIA:",
      criteria,
      "",
      "EVIDENCE:",
      evidence
    ].join("\n")
  };
}

function extractContentText(payload: AnthropicResponse): string {
  const blocks = payload.content ?? [];
  for (const block of blocks) {
    if (block.type === "text") {
      return block.text ?? "";
    }
  }

  return "";
}

function parseVerdict(text: string): { approved: boolean; reason: string } | null {
  if (!text) return null;
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed) as { approved: boolean; reason: string };
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as { approved: boolean; reason: string };
    } catch {
      return null;
    }
  }
}

type AnthropicResponse = {
  content?: Array<{ type?: string; text?: string }>;
};
