export type JobType = "text" | "code" | "unknown";

export interface Env {
  REDSHELL_WALLET_ADDRESS?: string;
  REDSHELL_WALLET_PRIVATE_KEY?: string;
  ALCHEMY_WEBHOOK_SECRET?: string;
  ANTHROPIC_API_KEY?: string;
  E2B_API_KEY?: string;
  BASE_RPC_URL?: string;
  CHAIN_ID?: string;
  ACP_CONTRACT_ADDRESS?: string;
  ACP_CONTRACT_ABI?: string;
  ACP_CONTRACT_FUNCTION?: string;
  ACP_CONTRACT_ARGS?: string;
  ACP_CONTRACT_REASON?: string;
  SUPABASE_URL?: string;
  SUPABASE_KEY?: string;
}

export interface JudgeVerdict {
  approved: boolean;
  reason: string;
  judge: JobType;
}
