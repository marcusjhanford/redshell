import { Sandbox } from "@e2b/code-interpreter";
import type { Env, JudgeVerdict } from "../types";
import { extractCode } from "../utils/extract";

export async function judgeCode(event: unknown, env: Env): Promise<JudgeVerdict> {
  if (!env.E2B_API_KEY) {
    return {
      approved: false,
      reason: "Missing E2B_API_KEY for code judge.",
      judge: "code"
    };
  }

  const { code, language } = extractCode(event);
  if (!code) {
    return {
      approved: false,
      reason: "No executable code found in deliverable.",
      judge: "code"
    };
  }

  ensureE2BEnv(env.E2B_API_KEY);
  const sandbox = await Sandbox.create({ apiKey: env.E2B_API_KEY });

  try {
    const execution = await sandbox.runCode(code);
    const result = normalizeExecution(execution);

    if (result.stderr || result.error) {
      return {
        approved: false,
        reason: `Runtime error${language ? ` (${language})` : ""}: ${result.stderr || result.error}`,
        judge: "code"
      };
    }

    return {
      approved: true,
      reason: result.stdout
        ? `Execution succeeded${language ? ` (${language})` : ""}: ${truncate(result.stdout, 200)}`
        : "Execution succeeded with no output.",
      judge: "code"
    };
  } catch (error) {
    return {
      approved: false,
      reason: `Sandbox error: ${stringifyError(error)}`,
      judge: "code"
    };
  } finally {
    await closeSandbox(sandbox);
  }
}

function ensureE2BEnv(apiKey: string): void {
  const global = globalThis as { process?: { env?: Record<string, string> } };
  if (!global.process) {
    global.process = { env: {} };
  }
  if (!global.process.env) {
    global.process.env = {};
  }
  if (!global.process.env.E2B_API_KEY) {
    global.process.env.E2B_API_KEY = apiKey;
  }
}

function normalizeExecution(execution: unknown): { stdout: string; stderr: string; error: string } {
  if (!execution || typeof execution !== "object") {
    return { stdout: "", stderr: "", error: "Unknown execution response." };
  }

  const payload = execution as Record<string, unknown>;
  const stdout = pickString(payload.stdout) ?? pickString(payload.text) ?? "";
  const stderr = pickString(payload.stderr) ?? "";
  const error = pickString(payload.error) ?? "";
  return { stdout, stderr, error };
}

async function closeSandbox(sandbox: unknown): Promise<void> {
  const candidate = sandbox as { close?: () => Promise<void>; stop?: () => Promise<void> };
  if (candidate.close) {
    await candidate.close();
    return;
  }
  if (candidate.stop) {
    await candidate.stop();
  }
}

function pickString(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return null;
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
}

function stringifyError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
