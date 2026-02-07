# RedShell Setup Guide

This document explains where the code currently is and what you need to provide to bring RedShell online end-to-end.

## Current state
- Cloudflare Worker entrypoint exists and accepts webhook POSTs.
- Text Judge calls the Anthropic Messages API and expects strict JSON verdicts.
- Code Judge runs deliverables in an E2B sandbox and rejects on stderr/error.
- On-chain verdict submission is wired via `viem` and is configurable by env.
- Static landing page lives in `site/` and mirrors README copy.

## What you need to provide
### 1) Cloudflare + Webhook
- Cloudflare account + a Worker deployment target.
- Alchemy (or Goldsky) webhook configured to POST ACP `JobSubmitted` events to the Worker URL.
- `ALCHEMY_WEBHOOK_SECRET` to secure inbound requests.

How to obtain
- Create a Cloudflare account, then create a new Worker project in the dashboard or via `wrangler`.
- Deploy the Worker to get a public URL.
- In Alchemy or Goldsky, create a webhook for the ACP contract event `JobSubmitted` and point it to the Worker URL.
- Set a shared secret in the webhook provider and use the same value for `ALCHEMY_WEBHOOK_SECRET`.

### 2) Wallet + Chain
- `REDSHELL_WALLET_ADDRESS` and `REDSHELL_WALLET_PRIVATE_KEY` for signing verdicts.
- `BASE_RPC_URL` for Base Sepolia or Base mainnet.
- `CHAIN_ID` (84532 for Base Sepolia, 8453 for Base mainnet).

How to obtain
- Create a dedicated evaluator wallet (e.g., Coinbase Wallet, Rabby, or a hardware wallet + exported key for server use).
- Export the private key into `.env` only; never commit it.
- Create a Base RPC endpoint (Alchemy, Infura, QuickNode, or Cloudflare Web3) and copy the HTTPS URL.
- Choose Base Sepolia for test jobs or Base mainnet for production and set the matching `CHAIN_ID`.

### 3) ACP Contract Details
- `ACP_CONTRACT_ADDRESS`
- `ACP_CONTRACT_FUNCTION` (the method that submits the verdict)
- `ACP_CONTRACT_ABI` (JSON array containing the function signature)
- Optional `ACP_CONTRACT_ARGS` override if the function signature is non-standard.
  - Use placeholders: `$jobId`, `$approved`, `$reason`, `$evaluator`.
- Optional `ACP_CONTRACT_REASON` default reason string.

How to obtain
- From the ACP SDK docs or contract repository, identify the evaluation contract address for Base Sepolia or Base mainnet.
- Copy the ABI JSON for the evaluation function (minimal ABI array is fine).
- Confirm the exact function name and parameter order.
- If the parameter order differs from the default mapping, set `ACP_CONTRACT_ARGS` to a JSON array with placeholders.

### 4) Model + Sandbox Keys
- `ANTHROPIC_API_KEY` for the Text Judge.
- `E2B_API_KEY` for the Code Judge.

How to obtain
- Create an Anthropic account, create an API key in the console, and place it in `.env`.
- Create an E2B account, generate an API key, and place it in `.env`.

### 5) (Optional) Supabase
- `SUPABASE_URL` and `SUPABASE_KEY` if you want persistence or audit logs.

How to obtain
- Create a Supabase project, copy the project URL and service key from the API settings.

## How to run locally (after you provide the above)
1. Copy `.env.example` to `.env` and fill in values.
2. `npm install`
3. `npm run dev`
4. POST a sample webhook payload to the local Worker URL.

## Deployment checklist
- Deploy the Worker with Wrangler and set secrets in Cloudflare.
- Point the webhook to the Worker URL.
- Ensure `evaluator_address` on ACP jobs is set to `REDSHELL_WALLET_ADDRESS`.
- Confirm the contract function and ABI match the ACP contract you want to write to.

## Security note
The API key included in the original spec should be treated as compromised. Rotate it and keep all secrets out of git. Use `.env` only.
