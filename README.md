# RedShell
<p align="center">
  <img src="redshell_logo-removebg-preview.png" alt="RedShell logo" />
</p>
![Verified by RedShell](assets/verified-by-redshell.svg)

The open source, serverless judge for agent commerce.

## RedShell is the impartial evaluator that signs ACP job verdicts.
RedShell sits in the middle of an ACP job. Buyer and seller set evaluator_address to RedShell.
When JobSubmitted fires, a webhook triggers our Cloudflare Worker. RedShell evaluates the
deliverable and signs APPROVE (release funds) or REJECT (refund buyer) on Base.

## Why RedShell exists
Virtuals Protocol gives agent commerce the rails, but self-evaluation invites fraud and Sybil
attacks. RedShell is the neutral third party: transparent, open source, and accountable.

## How it works
- Buyer creates ACP job and sets evaluator_address to RedShell.
- Alchemy or Goldsky webhook posts JobSubmitted to the Worker.
- RedShell pulls evidence and runs the right judge.
- RedShell signs APPROVE (release funds) or REJECT (refund buyer).

## Judging modes
Text Judge: Claude 3.5 Sonnet performs semantic verification against the criteria. Code Judge:
E2B sandbox executes the deliverable; any stderr rejects.

## Trust model
Open source MIT license. Anyone can audit judge logic to verify impartiality. Deterministic
prompts and no hidden allowlists. Legal wrapper: Delaware LLC with clickwrap terms.

## Pricing
1% - 2.5% transaction fee deducted from escrow. Verified Merchant badge: $20 per month.

## Get started
Set evaluator_address to RedShell in your ACP job. Configure an Alchemy webhook to POST
JobSubmitted to the Worker. Deploy the Worker on Cloudflare and set secrets in .env. Send a job
and receive the on-chain verdict.

```
REDSHELL_WALLET_ADDRESS=0xRedShell...
ALCHEMY_WEBHOOK_SECRET=your_webhook_secret
ANTHROPIC_API_KEY=your_anthropic_key
E2B_API_KEY=your_e2b_key
```

## Roadmap
Week 1: Rubber Stamp MVP (auto-approve). Week 2: Text Judge (Claude). Week 3: Code Judge (E2B
sandbox). Week 4: Open Source launch + Verified badge.

## Development
- Install dependencies: `npm install`
- Copy `.env.example` to `.env` and fill in values
- Run locally: `npm run dev`
- Type check: `npm run typecheck`

## On-chain configuration
- `BASE_RPC_URL`: Base RPC endpoint (Sepolia or mainnet)
- `ACP_CONTRACT_ADDRESS`: ACP contract address
- `ACP_CONTRACT_FUNCTION`: Function to submit verdicts
- `ACP_CONTRACT_ABI`: JSON ABI array containing that function
- Optional `ACP_CONTRACT_ARGS`: JSON array with placeholders `$jobId`, `$approved`, `$reason`, `$evaluator`

## License
MIT

## Repository layout
- `src/worker.ts`: Cloudflare Worker entrypoint
- `src/router.ts`: Job routing to judges
- `src/judges/`: Judge implementations (text and code)
- `src/utils/`: Chain interaction utilities
- `site/`: Static landing page for redshell.ai
