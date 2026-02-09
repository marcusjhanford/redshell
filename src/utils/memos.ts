import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import type { Env } from "../types";

const MEMO_READ_ABI = [
  {
    type: "function",
    name: "getAllMemos",
    stateMutability: "view",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "offset", type: "uint256" },
      { name: "limit", type: "uint256" }
    ],
    outputs: [
      {
        name: "memos",
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "jobId", type: "uint256" },
          { name: "sender", type: "address" },
          { name: "content", type: "string" },
          { name: "memoType", type: "uint8" },
          { name: "createdAt", type: "uint256" },
          { name: "isApproved", type: "bool" },
          { name: "approvedBy", type: "address" },
          { name: "approvedAt", type: "uint256" },
          { name: "requiresApproval", type: "bool" },
          { name: "metadata", type: "string" },
          { name: "isSecured", type: "bool" },
          { name: "nextPhase", type: "uint8" },
          { name: "expiredAt", type: "uint256" }
        ]
      },
      { name: "total", type: "uint256" }
    ]
  }
] as const;

export async function fetchPendingMemoId(jobId: string, env: Env): Promise<string | null> {
  const rpcUrl = env.BASE_RPC_URL?.trim();
  const contractAddress = env.ACP_CONTRACT_ADDRESS?.trim();

  if (!rpcUrl || !contractAddress) return null;

  const jobValue = parseUint(jobId);
  if (jobValue === null) return null;

  const chain = resolveChain(env.CHAIN_ID);
  const client = createPublicClient({ chain, transport: http(rpcUrl) });

  try {
    const [memos] = (await client.readContract({
      address: contractAddress as `0x${string}`,
      abi: MEMO_READ_ABI,
      functionName: "getAllMemos",
      args: [jobValue, 0n, 50n]
    })) as [Array<Record<string, unknown>>, bigint];

    if (!Array.isArray(memos)) return null;

    const pending = memos
      .map((memo) => normalizeMemo(memo))
      .filter((memo) => memo && memo.requiresApproval && !memo.isApproved) as MemoInfo[];

    if (pending.length === 0) return null;

    const latest = pending.reduce((max, current) =>
      current.id > max.id ? current : max
    );

    return latest.id.toString();
  } catch {
    return null;
  }
}

type MemoInfo = {
  id: bigint;
  isApproved: boolean;
  requiresApproval: boolean;
};

function normalizeMemo(memo: Record<string, unknown>): MemoInfo | null {
  const id = memo.id as bigint | undefined;
  const isApproved = memo.isApproved as boolean | undefined;
  const requiresApproval = memo.requiresApproval as boolean | undefined;

  if (typeof id !== "bigint") return null;
  if (typeof isApproved !== "boolean") return null;
  if (typeof requiresApproval !== "boolean") return null;

  return { id, isApproved, requiresApproval };
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

function resolveChain(chainIdRaw: string | undefined) {
  const chainId = Number(chainIdRaw ?? "84532");
  if (chainId === base.id) return base;
  if (chainId === baseSepolia.id) return baseSepolia;
  return undefined;
}
