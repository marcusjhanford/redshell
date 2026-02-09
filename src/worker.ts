import { routeToJudge } from "./router";
import type { Env, JudgeVerdict } from "./types";
import { submitVerdict } from "./utils/blockchain";
import { fetchPendingMemoId } from "./utils/memos";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "GET" || request.method === "HEAD") {
      return new Response("RedShell Worker is running", { status: 200 });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const bodyText = await request.text();
      let event: unknown;

      try {
        event = JSON.parse(bodyText);
      } catch {
        return new Response("Invalid JSON", { status: 400 });
      }

      if (!verifySignature(request, env, bodyText)) {
        return new Response("Unauthorized", { status: 401 });
      }

      const evaluator = getEvaluatorAddress(event);
      const expected = env.REDSHELL_WALLET_ADDRESS;

      if (!evaluator || !expected) {
        console.log("[RedShell] Missing evaluator or REDSHELL_WALLET_ADDRESS.");
        return new Response("Ignored", { status: 202 });
      }

      if (!addressesEqual(evaluator, expected)) {
        return new Response("Ignored", { status: 202 });
      }

    const jobId = getJobId(event);
    let memoId = getMemoId(event);

    if (!memoId && jobId) {
      memoId = await fetchPendingMemoId(jobId, env);
    }

    const verdict = await evaluateJob(event, env, { jobId, memoId });

      console.log(
        `[RedShell] job ${jobId ?? "unknown"} -> ${verdict.approved ? "APPROVE" : "REJECT"} (${verdict.judge})`
      );

      return jsonResponse({ ok: true, jobId, verdict });
    } catch (error) {
      console.log(`[RedShell] Unhandled error: ${stringifyError(error)}`);
      return new Response("Internal Server Error", { status: 500 });
    }
  }
};

async function evaluateJob(
  event: unknown,
  env: Env,
  ids: { jobId: string | null; memoId: string | null }
): Promise<JudgeVerdict> {
  const verdict = await routeToJudge(event, env);
  console.log(`[RedShell] intent to ${verdict.approved ? "APPROVE" : "REJECT"}: ${verdict.reason}`);
  await submitVerdict(ids, verdict.approved, env);
  return verdict;
}

function verifySignature(request: Request, env: Env, bodyText: string): boolean {
  const secret = env.ALCHEMY_WEBHOOK_SECRET?.trim();

  if (!secret) {
    console.log("[RedShell] No ALCHEMY_WEBHOOK_SECRET set. Skipping signature check.");
    return true;
  }

  const signature =
    request.headers.get("x-alchemy-signature") ??
    request.headers.get("x-webhook-signature") ??
    request.headers.get("x-signature");

  if (!signature) {
    console.log("[RedShell] Missing webhook signature header.");
    return false;
  }

  if (signature !== secret) {
    console.log("[RedShell] Invalid webhook signature.");
    return false;
  }

  void bodyText;
  return true;
}

function getEvaluatorAddress(event: unknown): string | null {
  if (!event || typeof event !== "object") return null;
  const payload = event as Record<string, unknown>;
  const candidates = [
    payload.evaluator,
    payload.evaluator_address,
    (payload.payload as Record<string, unknown> | undefined)?.evaluator,
    (payload.payload as Record<string, unknown> | undefined)?.evaluator_address,
    (payload.data as Record<string, unknown> | undefined)?.evaluator,
    (payload.data as Record<string, unknown> | undefined)?.evaluator_address
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return null;
}

function getJobId(event: unknown): string | null {
  if (!event || typeof event !== "object") return null;
  const payload = event as Record<string, unknown>;
  const candidates = [
    payload.jobId,
    payload.job_id,
    (payload.payload as Record<string, unknown> | undefined)?.jobId,
    (payload.payload as Record<string, unknown> | undefined)?.job_id,
    (payload.data as Record<string, unknown> | undefined)?.jobId,
    (payload.data as Record<string, unknown> | undefined)?.job_id
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return null;
}

function getMemoId(event: unknown): string | null {
  if (!event || typeof event !== "object") return null;
  const payload = event as Record<string, unknown>;
  const candidates = [
    payload.memoId,
    payload.memo_id,
    (payload.payload as Record<string, unknown> | undefined)?.memoId,
    (payload.payload as Record<string, unknown> | undefined)?.memo_id,
    (payload.data as Record<string, unknown> | undefined)?.memoId,
    (payload.data as Record<string, unknown> | undefined)?.memo_id
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return null;
}

function addressesEqual(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase();
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" }
  });
}

function stringifyError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
