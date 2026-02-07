Here is the finalized **Product & Technical Specification** for **RedShell**, updated with the Serverless architecture, Open Source strategy, and Delaware LLC structure.

---

# Project: RedShell

**Product & Technical Specification**
**Status:** Draft v1.2 | **Owner:** [Your Name] | **Date:** February 6, 2026
**Target Architecture:** Solo-Developer / Serverless (Cloudflare) / Open Source

---

## 1. Executive Summary: "The Verisign of Agent Commerce"

* **The Problem:** The Virtuals Protocol (ACP) provides the rails for agent commerce, but lacks a trust layer. "Self-Evaluation" incentives fraud ("Rug Pulls" or "Sybil Attacks").
* **The Solution:** **RedShell** is a specialized, autonomous Third-Party Evaluator Agent. It acts as the impartial "Supreme Court" for the OpenClaw economy. When Agent A hires Agent B, they designate **RedShell** (`0xRedShell...`) as the signatory. We verify the work via impartial AI/Sandbox analysis and release the funds.
* **The Business Model:**
* **Transaction Fee:** 1% - 2.5% of the job value (deducted from escrow).
* **Subscription:** "Verified Merchant" badge ($20/mo).



---

## 2. Product Architecture

The system is a **Headless Protocol Service** (API + Smart Contract interaction).

### 2.1 The "Judge" Workflow

1. **The Deal:** Buyer initiates ACP Job. `evaluator_address = 0xRedShell...`
2. **The Trigger:** Blockchain event (`JobSubmitted`) fires.
3. **The Ingestion:** A Webhook provider (Alchemy/Goldsky) detects the event and POSTs the payload to **RedShell (Cloudflare Worker)**.
4. **The Trial:** RedShell fetches the evidence, runs the check (LLM or Sandbox), and determines the verdict.
5. **The Verdict:** RedShell signs a transaction on-chain to `APPROVE` (release funds) or `REJECT` (refund buyer).

### 2.2 Differentiation (The Moat)

* **Open Source Trust:** RedShell is fully Open Source (MIT License). Anyone can audit our `judge.ts` logic to verify we are impartial and not hard-coded to favor specific wallets. Transparency is our primary product.
* **Code Sandboxing:** We don't just read code; we execute it in secure VMs (E2B) to ensure it works.
* **Legal Wrapper:** RedShell operates under a standard **Delaware LLC**. We rely on "Open Source Transparency" and rigorous "Terms of Service" (Clickwrap) to limit liability, rather than complex autonomous entity structures.

---

## 3. Technical Specification (The Cloudflare Stack)

*Optimized for Zero Maintenance, Infinite Scale, and Free Tier leverage.*

### A. Core Infrastructure

* **Network:** Base (Coinbase L2)
* **Compute:** **Cloudflare Workers** (Serverless JavaScript). Spawns a new instance for every job instantly.
* **Database:** **Supabase** (PostgreSQL) - Accessed via HTTP from Workers.
* **Orchestration:** **Cloudflare Queues** (Optional buffer for high traffic).
* **Blockchain Events:** **Alchemy/Goldsky Webhooks** (Pushes events to Cloudflare; no polling).

### B. The "Judge" Logic Modules

**Module 1: The Event Listener (The Webhook)**
*Replaces the "polling loop." This function only runs when a job actually happens.*

```typescript
// worker.ts (Cloudflare Worker)
export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      const event = await request.json();
      
      // 1. Verify Webhook Signature (Security)
      if (!verifySignature(request, env.WEBHOOK_SECRET)) return new Response("Unauthorized", { status: 401 });

      // 2. Filter for RedShell Jobs
      if (event.evaluator === env.REDSHELL_WALLET_ADDRESS) {
        // Trigger the Judge Logic (async via Queue or direct await)
        await evaluateJob(event, env);
      }
      
      return new Response("Event Received", { status: 200 });
    }
    return new Response("Method Not Allowed", { status: 405 });
  }
};

```

**Module 2: The Cognitive Engine (The Brain)**

* **LLM:** Anthropic Claude 3.5 Sonnet (via Direct REST API).
* **Role:** Semantic verification for text/creative jobs.
* **Prompt:** "You are an impartial judge. EVIDENCE: [Agent Output]. TASK: [Criteria]. OUTPUT: JSON { approved: bool, reason: str }"

**Module 3: The Sandbox (The Hands)**

* **Tool:** **E2B (Code Interpreter SDK)**.
* **Integration:** E2B works within Cloudflare Workers (using HTTP/WebSocket polyfills).
* **Workflow:**
1. Extract code from `deliverable`.
2. Request E2B Sandbox via API.
3. Execute code.
4. If `stderr` exists  `REJECT`.



---

## 4. Implementation Roadmap

* **Week 1: The "Rubber Stamp" (MVP)**
* **Goal:** Deploy Cloudflare Worker + Alchemy Webhook.
* **Action:** Auto-approve all jobs sent to `0xRedShell...` on Base Sepolia.
* **Deliverable:** End-to-end pipeline (Blockchain  Webhook  Worker  Blockchain).


* **Week 2: The "Text Judge"**
* **Goal:** Integrate Anthropic inside the Worker.
* **Action:** Verify non-code deliverables.


* **Week 3: The "Code Judge"**
* **Goal:** Integrate E2B.
* **Action:** Enable secure code execution.


* **Week 4: The "Open Source" Launch**
* **Action:** Publish GitHub repo `redshell` (already exists).
* **Action:** Add "Verified by RedShell" badge to the README.
* **Marketing:** "The First Open Source, Trustless Agent Evaluator."



---

## 5. Deployment Context (For Coding Agent)

*Copy this block into your IDE for the coding agent.*

```text
PROJECT CONTEXT: REDSHELL
We are building "RedShell," an Open Source, Serverless Third-Party Evaluator for the Virtuals Protocol (ACP).
The architecture is Event-Driven using Cloudflare Workers and Webhooks.

CORE DEPENDENCIES
Runtime: Cloudflare Workers (Node.js compatibility mode)
Blockchain: Base (Coinbase L2)
Events: Alchemy Webhooks (POST to Worker)
SDK: @virtuals-protocol/acp-node (Modified for Edge if needed)
LLM: Anthropic Claude 3.5 Sonnet (REST API)
Sandbox: @e2b/code-interpreter

ARCHITECTURE
worker.ts: Main entry point. Receives POST requests from Alchemy Webhooks.
router.ts: Directs jobs to specific judges based on job type (TEXT vs CODE).
judges/code.ts: Uses E2B to execute and verify code.
judges/text.ts: Uses Claude to verify semantic content.
utils/blockchain.ts: Uses 'viem' to write the Verdict (Approve/Reject) back to the chain.

CONFIGURATION (wrangler.toml / .env)
REDSHELL_WALLET_PRIVATE_KEY=...
ALCHEMY_WEBHOOK_SECRET=...
ANTHROPIC_API_KEY=...
E2B_API_KEY=...
SUPABASE_URL=...
SUPABASE_KEY=...

MISSION
Build the 'worker.ts' harness that can receive a dummy webhook payload, parse it, and log the intent to "Approve" without crashing.

```


# IMPORTANT NOTES 
1. creating an .env file to store all variables, but ensure that it is in the gitignore, since this is going to be an open source repo.
2. we also need to build a captivating, breathtaking landing page explaining to the user what the agent is and how to use it. the website will be hosted on redshell.ai.
3. for things that require the developer to set something up manually, create a single markdown with instructions on how to obtain each service, key, or item.
