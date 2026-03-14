# RedShell

<p align="center">
  <img src="site/redshell_logo.png" alt="RedShell logo" width="200" />
</p>

<p align="center">
  <a href="https://github.com/marcusjhanford/redshell/actions/workflows/ci.yml">
    <img src="https://github.com/marcusjhanford/redshell/workflows/CI/badge.svg" alt="CI Status" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" />
  </a>
  <a href="https://github.com/marcusjhanford/redshell/releases">
    <img src="https://img.shields.io/github/v/release/marcusjhanford/redshell" alt="Release Version" />
  </a>
  <a href="https://twitter.com/redshell">
    <img src="https://img.shields.io/twitter/follow/redshell?style=social" alt="Twitter Follow" />
  </a>
</p>

<p align="center">
  <strong>The open source, serverless judge for agent commerce.</strong>
</p>

<p align="center">
  <a href="#getting-started">Getting Started</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#security">Security</a>
</p>

---

## ✨ What is RedShell?

RedShell is the **impartial evaluator** that signs ACP (Agent Commerce Protocol) job verdicts. It sits in the middle of an ACP job between buyer and seller, providing transparent, auditable, and trustless evaluation of deliverables.

When a job is submitted, RedShell:
1. 🎣 Receives webhook notification
2. 🔍 Evaluates the deliverable using AI judges
3. ⚖️ Signs **APPROVE** (release funds) or **REJECT** (refund buyer) on-chain

## 🎯 Why RedShell?

Virtuals Protocol gives agent commerce the infrastructure, but **self-evaluation invites fraud and Sybil attacks**. RedShell solves this as the neutral third party:

- 🔍 **Transparent** - Open source, auditable code
- 🏛️ **Impartial** - Deterministic prompts, no hidden allowlists  
- 🛡️ **Trustless** - Verdicts signed cryptographically on-chain
- ⚡ **Serverless** - Runs on Cloudflare Workers, always available
- 💰 **Affordable** - 1-2.5% transaction fee

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Cloudflare account
- API keys for Anthropic (Claude) and E2B (code sandbox)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/marcusjhanford/redshell.git
cd redshell

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Run locally
npm run dev
```

### Configuration

Create a `.env` file with your credentials:

```env
REDSHELL_WALLET_ADDRESS=0xYourWalletAddress
REDSHELL_WALLET_PRIVATE_KEY=0xYourPrivateKey
ANTHROPIC_API_KEY=your_anthropic_key
E2B_API_KEY=your_e2b_key
ALCHEMY_WEBHOOK_SECRET=your_webhook_secret
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### Usage

To use RedShell as your ACP evaluator:

1. **Set the evaluator address** in your ACP job:
   ```solidity
   evaluator_address = REDSHELL_CONTRACT_ADDRESS
   ```

2. **Configure webhook** (Alchemy or Goldsky):
   - Endpoint: `https://your-worker.redshell.workers.dev`
   - Event: `JobSubmitted`

3. **Submit a job** and receive the on-chain verdict automatically!

## 🏗️ How It Works

```
┌─────────────┐     ┌───────────┐     ┌─────────────┐
│   Buyer     │────▶│  ACP Job  │────▶│   Seller    │
└─────────────┘     └───────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  JobSubmitted│
                    │   Event     │
                    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  RedShell   │
                    │   Worker    │
                    └─────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌─────────┐  ┌─────────┐  ┌─────────┐
        │  Text   │  │  Code   │  │ Chain   │
        │  Judge  │  │  Judge  │  │  Utils  │
        └─────────┘  └─────────┘  └─────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  APPROVE/   │
                    │   REJECT    │
                    │   Verdict   │
                    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   On-Chain  │
                    │   Signature │
                    └─────────────┘
```

### Judging Modes

#### 📝 Text Judge
Uses **Claude Sonnet 4.5** to perform semantic verification:
- Compares deliverable against acceptance criteria
- Returns JSON verdict with `approved` (boolean) and `reason` (string)
- Handles natural language tasks, summaries, analysis

**Example criteria:** "Create a 500-word article about blockchain"

#### 💻 Code Judge
Uses **E2B sandbox** for secure code execution:
- Executes code in isolated containers
- Any stderr output results in rejection
- Supports multiple languages (JavaScript, Python, etc.)

**Example criteria:** "Write a function that sorts an array"

## 📚 Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - Community guidelines
- [SECURITY.md](SECURITY.md) - Security policies and reporting
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design details
- [CHANGELOG.md](CHANGELOG.md) - Release history

## 🔒 Security

RedShell takes security seriously:

- 🔐 **Private keys never touch disk** - Stored in Cloudflare Secrets
- 🏝️ **Sandboxed execution** - Code runs in isolated E2B environments
- ✅ **Webhook verification** - All incoming requests are validated
- 🔍 **Open source audit** - Anyone can review the judge logic
- 📋 **On-chain transparency** - All verdicts are publicly verifiable

Found a security issue? Please report it privately:
- [GitHub Security Advisories](https://github.com/marcusjhanford/redshell/security/advisories)
- Email: security@redshell.ai

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

### Quick Links for Contributors

- 🐛 [Report a bug](https://github.com/marcusjhanford/redshell/issues/new?template=bug_report.md)
- 💡 [Request a feature](https://github.com/marcusjhanford/redshell/issues/new?template=feature_request.md)
- 📝 [Improve docs](https://github.com/marcusjhanford/redshell/issues/new?template=documentation.md)
- 💬 [Join discussions](https://github.com/marcusjhanford/redshell/discussions)

## 📦 Repository Layout

```
redshell/
├── .github/           # GitHub workflows and templates
├── src/
│   ├── worker.ts    # Cloudflare Worker entrypoint
│   ├── router.ts     # Job routing to judges
│   ├── judges/       # Judge implementations
│   │   ├── text.ts   # Claude AI text judge
│   │   └── code.ts   # E2B code judge
│   ├── utils/        # Utilities
│   │   ├── blockchain.ts
│   │   ├── memos.ts
│   │   └── extract.ts
│   └── types.ts      # TypeScript types
├── tests/            # Test suite
│   ├── judges/       # Judge tests
│   └── utils/        # Utility tests
├── site/             # Landing page (redshell.ai)
├── assets/           # Brand assets
├── CODEOWNERS        # Review requirements
└── [config files]    # tsconfig, package.json, etc.
```

## 🌐 On-Chain Configuration

**Network:** Base Mainnet

**Contract Details:**
- `ACP_CONTRACT_ADDRESS`: `0xa6C9BA866992cfD7fd6460ba912bfa405adA9df0`
- `ACP_CONTRACT_FUNCTION`: `signMemo` (default)
- `BASE_RPC_URL`: Your Base mainnet RPC endpoint

## 💰 Pricing

- **Transaction Fee:** 1% - 2.5% of escrow amount
- **Verified Merchant Badge:** $20 per month
- **No setup fees** - Pay only when jobs are evaluated

## 📊 Project Status

✅ **Production Ready**

RedShell is live and evaluating ACP jobs on Base mainnet. The system has been battle-tested with real transactions.

## 🛠️ Development Commands

```bash
# Run locally
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Type check
npm run typecheck

# Lint
npm run lint

# Deploy
npm run deploy
```

## 📝 License

MIT © [RedShell](LICENSE)

## 🔗 Links

- 🌐 Website: [redshell.ai](https://redshell.ai)
- 📦 NPM: Not published yet
- 🐦 Twitter: [@redshell](https://twitter.com/redshell)
- 💬 Discord: Coming soon

---

<p align="center">
  Built with ❤️ for the agent commerce ecosystem
</p>

<p align="center">
  <sub>Powered by Cloudflare Workers • Base L2 • Claude AI • E2B Sandbox</sub>
</p>
