import { createPublicClient, createWalletClient, http, type Abi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import type { Env } from "../types";

const DEFAULT_REASON = "Evaluated by RedShell";

export async function submitVerdict(
  ids: { jobId: string | null; memoId: string | null },
  approved: boolean,
  env: Env
): Promise<void> {
  const targetId = ids.memoId ?? ids.jobId;
  if (!targetId) {
    console.log("[RedShell] No memoId or jobId found. Skipping on-chain verdict.");
    return;
  }

  const rpcUrl = env.BASE_RPC_URL?.trim();
  if (!rpcUrl) {
    console.log("[RedShell] Missing BASE_RPC_URL. Skipping on-chain verdict.");
    return;
  }

  const contractAddress = env.ACP_CONTRACT_ADDRESS?.trim();
  if (!contractAddress) {
    console.log("[RedShell] Missing ACP_CONTRACT_ADDRESS. Skipping on-chain verdict.");
    return;
  }

  const functionName = env.ACP_CONTRACT_FUNCTION?.trim();
  if (!functionName) {
    console.log("[RedShell] Missing ACP_CONTRACT_FUNCTION. Skipping on-chain verdict.");
    return;
  }

  const abi = parseAbi(env.ACP_CONTRACT_ABI);
  if (!abi) {
    console.log("[RedShell] Missing or invalid ACP_CONTRACT_ABI. Skipping on-chain verdict.");
    return;
  }

  const privateKey = env.REDSHELL_WALLET_PRIVATE_KEY?.trim();
  if (!privateKey) {
    console.log("[RedShell] Missing REDSHELL_WALLET_PRIVATE_KEY. Skipping on-chain verdict.");
    return;
  }

  const targetValue = parseUint(targetId);
  if (targetValue === null) {
    console.log("[RedShell] Invalid memoId/jobId. Skipping on-chain verdict.");
    return;
  }

  const reason = env.ACP_CONTRACT_REASON?.trim() || DEFAULT_REASON;
  const memoIdValue = ids.memoId ? parseUint(ids.memoId) : null;
  const jobIdValue = ids.jobId ? parseUint(ids.jobId) : null;
  const args = buildArgs({
    abi,
    functionName,
    jobId: jobIdValue,
    memoId: memoIdValue,
    targetId: targetValue,
    approved,
    reason,
    evaluator: env.REDSHELL_WALLET_ADDRESS?.trim(),
    argsOverride: env.ACP_CONTRACT_ARGS
  });

  if (!args) {
    console.log("[RedShell] Unable to build contract args. Skipping on-chain verdict.");
    return;
  }

  const chain = resolveChain(env.CHAIN_ID);
  const account = privateKeyToAccount(formatPrivateKey(privateKey));
  const transport = http(rpcUrl);

  const walletClient = createWalletClient({ account, chain, transport });
  const publicClient = createPublicClient({ chain, transport });

  try {
    const hash = await walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi,
      functionName,
      args
    });

    console.log(`[RedShell] Submitted verdict tx: ${hash}`);
    await publicClient.waitForTransactionReceipt({ hash });
    console.log("[RedShell] Verdict confirmed on-chain.");
  } catch (error) {
    console.log(`[RedShell] Failed to submit verdict: ${stringifyError(error)}`);
  }
}

function parseAbi(raw: string | undefined): Abi | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as Abi;
    }
    return null;
  } catch {
    return null;
  }
}

function parseUint(value: string): bigint | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    return BigInt(trimmed);
  } catch {
    return null;
  }
}

function buildArgs(options: {
  abi: Abi;
  functionName: string;
  jobId: bigint | null;
  memoId: bigint | null;
  targetId: bigint;
  approved: boolean;
  reason: string;
  evaluator?: string;
  argsOverride?: string;
}): unknown[] | null {
  const override = parseArgsOverride(options.argsOverride, options);
  if (override) return override;

  const target = options.abi.find(
    (item) => item.type === "function" && item.name === options.functionName
  );

  if (!target || !("inputs" in target)) return null;

  const inputs = target.inputs ?? [];
  const args: unknown[] = [];

  for (const input of inputs) {
    const type = input.type;
    const name = input.name ?? "";

    if (isUint(type) && nameMatch(name, ["memo"])) {
      if (!options.memoId) return null;
      args.push(options.memoId);
      continue;
    }

    if (isUint(type) && nameMatch(name, ["job"])) {
      if (!options.jobId) return null;
      args.push(options.jobId);
      continue;
    }

    if (type === "bool" && nameMatch(name, ["approved", "accept"])) {
      args.push(options.approved);
      continue;
    }

    if (type === "string" && nameMatch(name, ["reason", "memo", "message"])) {
      args.push(options.reason);
      continue;
    }

    if (type === "address" && nameMatch(name, ["evaluator", "judge", "signer"])) {
      if (!options.evaluator) return null;
      args.push(options.evaluator);
      continue;
    }

    if (isUint(type) && inputs.length === 1) {
      args.push(options.targetId);
      continue;
    }

    if (type === "bool" && inputs.length === 2 && args.length === 1) {
      args.push(options.approved);
      continue;
    }

    if (type === "string" && inputs.length >= 3 && args.length >= 2) {
      args.push(options.reason);
      continue;
    }

    return null;
  }

  return args;
}

function parseArgsOverride(
  raw: string | undefined,
  context: { jobId: bigint | null; memoId: bigint | null; targetId: bigint; approved: boolean; reason: string; evaluator?: string }
): unknown[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    const resolved = parsed.map((entry) => {
      if (entry === "$memoId") return context.memoId;
      if (entry === "$jobId") return context.jobId;
      if (entry === "$targetId") return context.targetId;
      if (entry === "$approved") return context.approved;
      if (entry === "$reason") return context.reason;
      if (entry === "$evaluator") return context.evaluator ?? null;
      return entry;
    });

    if (resolved.some((entry) => entry === null)) return null;
    return resolved;
  } catch {
    return null;
  }
}

function isUint(type: string | undefined): boolean {
  return Boolean(type && type.startsWith("uint"));
}

function nameMatch(name: string, tokens: string[]): boolean {
  const lowered = name.toLowerCase();
  return tokens.some((token) => lowered.includes(token));
}

function resolveChain(chainIdRaw: string | undefined) {
  const chainId = Number(chainIdRaw ?? "84532");
  if (chainId === base.id) return base;
  if (chainId === baseSepolia.id) return baseSepolia;
  return undefined;
}

function formatPrivateKey(privateKey: string): `0x${string}` {
  if (privateKey.startsWith("0x")) {
    return privateKey as `0x${string}`;
  }
  return `0x${privateKey}`;
}

function stringifyError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
