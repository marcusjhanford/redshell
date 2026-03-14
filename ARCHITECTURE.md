# RedShell Architecture

This document provides a detailed overview of RedShell's system architecture, design decisions, and technical implementation.

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Component Details](#component-details)
- [Data Flow](#data-flow)
- [Security Model](#security-model)
- [Judge Logic](#judge-logic)
- [Blockchain Integration](#blockchain-integration)
- [Scalability & Performance](#scalability--performance)
- [Deployment Architecture](#deployment-architecture)

## System Overview

RedShell is a serverless, edge-computed judge for the Agent Commerce Protocol (ACP). It provides impartial evaluation of deliverables in automated transactions between AI agents.

### Key Characteristics

- **Serverless**: Runs on Cloudflare Workers (edge computing)
- **Event-driven**: Triggered by blockchain webhooks
- **Deterministic**: Same inputs always produce same outputs
- **Trustless**: All verdicts signed cryptographically on-chain
- **Auditable**: Open source code, transparent logic

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Buyer   │  │  Seller  │  │   Job    │  │  Web3    │  │  Wallet  │      │
│  │  Agent   │  │  Agent   │  │ Contract │  │  User    │  │   App    │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
└───────┼─────────────┼─────────────┼─────────────┼─────────────┼────────────┘
        │             │             │             │             │
        │             │             │             │             │
        └─────────────┴─────────────┴─────────────┴─────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BLOCKCHAIN LAYER                                  │
│                          (Base Mainnet L2)                                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     ACP Smart Contract                               │   │
│  │  • Job submission                                                   │   │
│  │  • Escrow management                                                │   │
│  │  • Verdict signing (signMemo)                                       │   │
│  │  • Fund release/refund                                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                             │
│                              │ (Events)                                    │
│                              ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Webhook Infrastructure                            │   │
│  │  • Alchemy / Goldsky (event listeners)                               │   │
│  │  • Webhook triggers on JobSubmitted                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              │ POST JobSubmitted
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        REDSHELL WORKER LAYER                                │
│                     (Cloudflare Workers Edge)                               │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Request Handler (worker.ts)                       │   │
│  │  • Webhook verification (signature check)                           │   │
│  │  • Request parsing                                                  │   │
│  │  • Error handling                                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                             │
│                              ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Job Router (router.ts)                            │   │
│  │  • Job type detection (text vs code)                                │   │
│  │  • Judge selection                                                  │   │
│  │  • Memo ID extraction                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                             │
│              ┌───────────────┴───────────────┐                             │
│              ▼                               ▼                             │
│  ┌─────────────────────┐    ┌─────────────────────┐                      │
│  │    Text Judge       │    │    Code Judge         │                      │
│  │    (judges/text.ts) │    │    (judges/code.ts)   │                      │
│  │                     │    │                       │                      │
│  │  • Claude API call  │    │  • E2B sandbox        │                      │
│  │  • Semantic eval    │    │  • Code execution     │                      │
│  │  • JSON parsing     │    │  • Stderr detection   │                      │
│  └─────────────────────┘    └─────────────────────┘                      │
│              │                               │                             │
│              └───────────────┬───────────────┘                             │
│                              ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Verdict Formatter                                  │   │
│  │  • Normalize verdict format                                          │   │
│  │  • Generate reason text                                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              │ Signed Verdict
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     BLOCKCHAIN SUBMISSION LAYER                             │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                  Blockchain Utilities (utils/)                       │   │
│  │                                                                     │   │
│  │  • Private key management (Cloudflare Secrets)                        │   │
│  │  • Transaction signing                                              │   │
│  │  • Gas estimation                                                   │   │
│  │  • Nonce management                                                 │   │
│  │  • Memo reading (utils/memos.ts)                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                             │
│                              ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                  On-Chain Submission                                  │   │
│  │  • Call signMemo() on ACP contract                                   │   │
│  │  • Include verdict (APPROVE/REJECT)                                   │   │
│  │  • Include reason text                                              │   │
│  │  • Wait for confirmation                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RESULT LAYER                                         │
│                                                                             │
│  • Transaction hash stored                                                  │
│  • Verdict recorded on-chain                                              │
│  • Funds released (APPROVE) or refunded (REJECT)                           │
│  • Job marked as completed                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Cloudflare Worker (worker.ts)

**Purpose**: Entry point for all incoming requests

**Responsibilities**:
- Verify webhook signatures (Alchemy/Goldsky)
- Parse incoming job events
- Route to appropriate judge
- Handle errors and retries
- Return HTTP responses

**Key Features**:
- Edge computing (runs in 300+ locations worldwide)
- Zero cold start latency
- Automatic scaling
- Built-in DDoS protection

### 2. Job Router (router.ts)

**Purpose**: Determine which judge to use based on job type

**Decision Logic**:
```typescript
if (event.hasCode || event.language) {
  return 'code';
}
return 'text';
```

**Extensibility**: Easy to add new judge types:
```typescript
// Future: Image Judge
if (event.hasImage) {
  return 'image';
}
```

### 3. Text Judge (judges/text.ts)

**Purpose**: Evaluate text-based deliverables using Claude AI

**Process**:
1. Extract criteria and deliverable from event
2. Build structured prompt for Claude
3. Call Anthropic API (claude-sonnet-4-5-20250929)
4. Parse JSON response (must contain `approved` boolean and `reason` string)
5. Return verdict

**Prompt Design**:
```
system: "You are an impartial judge for ACP deliverables."
user: "Return ONLY strict JSON with keys: approved (boolean), reason (string).
       TASK/CRITERIA: {criteria}
       EVIDENCE: {deliverable}"
```

**Deterministic Features**:
- Fixed model version (no auto-updates)
- Low temperature (0.2) for consistency
- Max tokens limit (400)
- Structured JSON output required

### 4. Code Judge (judges/code.ts)

**Purpose**: Execute and validate code deliverables safely

**Process**:
1. Extract code and language from deliverable
2. Initialize E2B sandbox with API key
3. Execute code in isolated container
4. Check for stderr or runtime errors
5. Return verdict based on execution success

**Security Features**:
- **Container isolation**: Each execution in fresh container
- **Time limits**: Automatic timeout (configurable)
- **Resource limits**: CPU/memory constraints
- **No network access**: Sandboxed from internet
- **Ephemeral**: Containers destroyed after execution

**Verdict Logic**:
```typescript
if (stderr || error) {
  return { approved: false, reason: error_message };
}
return { approved: true, reason: success_message };
```

### 5. Extraction Utilities (utils/extract.ts)

**Purpose**: Flexible data extraction from various event formats

**Design Philosophy**: Accept multiple field names for resilience

**Criteria Extraction** (tries in order):
1. `criteria`
2. `requirements`
3. `spec`
4. `task`
5. `instructions`
6. `prompt`

**Deliverable Extraction** (tries in order):
1. `deliverable`
2. `output`
3. `result`
4. `submission`
5. `artifact`

**Code Extraction**:
- Handles string deliverables
- Handles object deliverables with `code`, `source`, `content`, or `snippet` fields
- Language detection from `language` or `lang` fields

### 6. Blockchain Utilities (utils/blockchain.ts)

**Purpose**: Sign and submit verdicts to the blockchain

**Key Functions**:
- `submitVerdict()`: Main entry point
- `signTransaction()`: Create signed transaction
- `sendTransaction()`: Broadcast to network

**Security**:
- Private keys stored in Cloudflare Secrets (never in code)
- Keys never logged or exposed
- Uses Viem library for type-safe blockchain operations

### 7. Memo Utilities (utils/memos.ts)

**Purpose**: Read existing job data from the blockchain

**Use Cases**:
- Verify job exists before evaluating
- Check if already evaluated
- Retrieve job metadata
- Validate job state

## Data Flow

### 1. Job Submission Flow

```
1. Buyer creates job on ACP contract
   → Sets evaluator_address = RedShell
   → Escrow funds locked
   
2. JobSubmitted event emitted
   → Logged on Base blockchain
   
3. Webhook triggered (Alchemy/Goldsky)
   → POST to RedShell Worker
   → Includes event data + signature
   
4. RedShell verifies webhook
   → Checks signature
   → Parses event data
   
5. Router selects judge
   → Text or Code based on job type
   
6. Judge evaluates
   → AI analysis or code execution
   → Returns APPROVE/REJECT + reason
   
7. Verdict signed on-chain
   → RedShell signs transaction
   → Calls signMemo() on ACP contract
   → Includes verdict and reason
   
8. ACP contract processes verdict
   → If APPROVE: release funds to seller
   → If REJECT: refund funds to buyer
   
9. Job completed
   → On-chain record of verdict
   → Transaction hash stored
```

### 2. Error Handling Flow

```
1. Error detected
   → API failure, timeout, or exception
   
2. Error logged
   → Context preserved
   → No sensitive data leaked
   
3. Graceful degradation
   → Return REJECT verdict with error reason
   → Or retry (if transient error)
   
4. On-chain submission
   → Even errors result in verdict
   → Never leave job hanging
```

## Security Model

### Threat Model

**Trusted**:
- Cloudflare Workers infrastructure
- E2B sandbox isolation
- Base blockchain consensus

**Semi-Trusted**:
- Anthropic Claude API (external service)
- Alchemy/Goldsky webhooks (could be spoofed)

**Untrusted**:
- User-submitted code (must be sandboxed)
- Job deliverables (must be validated)
- Webhook payloads (must be verified)

### Security Measures

#### 1. Webhook Verification

```typescript
// Verify webhook signature
const signature = request.headers.get('X-Alchemy-Signature');
const isValid = verifySignature(payload, signature, secret);
if (!isValid) {
  return new Response('Invalid signature', { status: 401 });
}
```

#### 2. Code Sandboxing

```typescript
// E2B provides isolated execution
const sandbox = await Sandbox.create({ apiKey });
// Each job gets fresh container
// Container destroyed after execution
```

#### 3. Secret Management

```bash
# Cloudflare Secrets (not in code!)
wrangler secret put REDSHELL_WALLET_PRIVATE_KEY
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put E2B_API_KEY
```

#### 4. Input Validation

```typescript
// Never trust external input
const criteria = extractCriteria(event);
if (!criteria || criteria.length > 10000) {
  return { approved: false, reason: 'Invalid criteria' };
}
```

#### 5. Rate Limiting

- Built into Cloudflare Workers
- Configurable limits per IP/endpoint
- Automatic DDoS protection

### Audit Trail

Every action is auditable:
- **On-chain**: All verdicts recorded on Base blockchain
- **Deterministic**: Same inputs always produce same outputs
- **Open source**: Anyone can verify judge logic
- **Logging**: Structured logs (no sensitive data)

## Judge Logic

### Text Judge Deep Dive

**Why Claude Sonnet 4.5?**
- Excellent reasoning capabilities
- Good at following structured instructions
- Fast enough for real-time evaluation
- Cost-effective for this use case

**Prompt Engineering**:
```
Role: You are an impartial judge for ACP deliverables
Task: Evaluate if deliverable meets criteria
Format: Return ONLY valid JSON with keys:
  - approved (boolean)
  - reason (string explaining decision)
Constraints:
  - Be objective and fair
  - Explain your reasoning
  - Consider edge cases
```

**Response Parsing**:
1. Try direct JSON parse
2. If fails, extract JSON from markdown code blocks
3. If still fails, extract first `{...}` block
4. Validate required fields exist
5. Return null if invalid (triggers error verdict)

### Code Judge Deep Dive

**Why E2B?**
- Purpose-built for AI code execution
- Strong security guarantees
- Multi-language support
- Easy API integration

**Execution Flow**:
```typescript
1. Extract code from deliverable
2. Detect language (or use provided)
3. Create E2B sandbox
4. Execute code
5. Capture stdout, stderr, errors
6. Destroy sandbox
7. Return verdict based on stderr presence
```

**Language Support**:
- JavaScript/TypeScript (Node.js)
- Python
- More languages via E2B (extensible)

**Security Boundaries**:
- No filesystem persistence
- No network access (configurable)
- Time limits enforced
- Memory limits enforced

## Blockchain Integration

### Smart Contract Interaction

**Contract**: ACP v2 on Base Mainnet
**Address**: `0xa6C9BA866992cfD7fd6460ba912bfa405adA9df0`
**Function**: `signMemo`

**Transaction Structure**:
```typescript
{
  to: ACP_CONTRACT_ADDRESS,
  data: encodeFunctionData({
    abi: ACP_ABI,
    functionName: 'signMemo',
    args: [
      memoId,        // uint256
      approved,      // bool
      reason         // string
    ]
  }),
  gas: estimatedGas,
  nonce: await getNonce()
}
```

**Gas Strategy**:
- Dynamic gas estimation using Viem
- Base fee + priority fee
- Configurable limits
- Automatic retry on failure

**Nonce Management**:
- Critical for transaction ordering
- Fetch from blockchain
- Increment locally
- Handle race conditions

### Wallet Architecture

**Single-Use Evaluator Wallet**:
- Dedicated wallet for signing verdicts
- Minimal funds (just for gas)
- Keys stored in Cloudflare Secrets
- Can be rotated if compromised

**Security Properties**:
- Keys never in code or logs
- Cloudflare provides secure storage
- Automatic encryption at rest
- Access controlled by Cloudflare permissions

## Scalability & Performance

### Edge Computing Benefits

**Global Distribution**:
- 300+ data centers worldwide
- Request served from nearest location
- <50ms latency in most regions

**Automatic Scaling**:
- No server management
- Scales to millions of requests
- Pay only for actual usage

**Performance Characteristics**:

| Operation | Typical Latency |
|-----------|----------------|
| Webhook handling | 10-50ms |
| Text evaluation | 2-5 seconds (Claude API) |
| Code execution | 3-10 seconds (E2B sandbox) |
| Blockchain submission | 3-15 seconds |
| **Total** | **8-30 seconds** |

### Optimization Strategies

1. **Caching**: Judge responses can be cached for identical inputs
2. **Parallelization**: Multiple jobs processed concurrently
3. **Streaming**: Large deliverables streamed to reduce memory
4. **Retry Logic**: Exponential backoff for transient failures
5. **Circuit Breakers**: Fail fast on external service issues

## Deployment Architecture

### Development → Production Flow

```
Developer
    │
    ▼
Local Testing (wrangler dev)
    │
    ▼
GitHub Repository
    │
    ▼
CI/CD Pipeline (GitHub Actions)
    ├── Lint check
    ├── Type check
    ├── Unit tests
    └── Coverage report
    │
    ▼
Code Review (marcusjhanford)
    │
    ▼
Merge to main
    │
    ▼
Staging Deployment (optional)
    │
    ▼
Production Deployment
    └── wrangler deploy
```

### Environment Strategy

**Development**:
- Local Wrangler dev server
- Test API keys
- Local blockchain fork (optional)

**Staging** (optional):
- Separate Cloudflare Worker
- Testnet deployment
- Integration testing

**Production**:
- Main Cloudflare Worker
- Mainnet deployment
- Real API keys
- Monitoring & alerting

### Secrets Management

Per-environment secrets:

**Development**:
```
ANTHROPIC_API_KEY=dev_key
E2B_API_KEY=dev_key
```

**Production**:
```
ANTHROPIC_API_KEY=prod_key
E2B_API_KEY=prod_key
REDSHELL_WALLET_PRIVATE_KEY=prod_key
```

Managed via Wrangler:
```bash
# Development
wrangler secret put ANTHROPIC_API_KEY --env dev

# Production
wrangler secret put ANTHROPIC_API_KEY
```

## Monitoring & Observability

### Metrics to Track

**Business Metrics**:
- Jobs evaluated per day/hour
- Approval rate (%)
- Average evaluation time
- Revenue (transaction fees)

**Technical Metrics**:
- API response times (Claude, E2B)
- Error rates by type
- Blockchain transaction success rate
- Worker invocation count

**Security Metrics**:
- Failed webhook verifications
- Invalid job submissions
- Rate limit hits

### Logging Strategy

**What to Log**:
- Job ID and memo ID
- Judge type used
- Verdict result
- Execution time
- Errors (sanitized)

**What NOT to Log**:
- Private keys
- API keys
- Full deliverables (may be sensitive)
- Webhook secrets

**Log Format** (structured JSON):
```json
{
  "timestamp": "2026-03-14T10:30:00Z",
  "level": "info",
  "event": "job_evaluated",
  "jobId": "12345",
  "judgeType": "text",
  "verdict": "approved",
  "duration_ms": 3200
}
```

### Alerting

**Critical Alerts**:
- High error rate (>5% failures)
- Blockchain submission failures
- External API downtime (Claude/E2B)
- Unauthorized webhook attempts

**Warning Alerts**:
- Slow response times
- Rate limit approaching
- Deprecation notices

## Future Enhancements

### Planned Features

1. **Multi-judge consensus**: Multiple judges evaluate, majority wins
2. **Human appeal process**: Escalate edge cases to human review
3. **Reputation system**: Track evaluator accuracy over time
4. **Custom judges**: Users can define custom evaluation logic
5. **Batch processing**: Evaluate multiple jobs efficiently
6. **Analytics dashboard**: Visualize evaluation metrics

### Technical Debt

Areas for improvement:
- Add more comprehensive test coverage
- Implement caching layer
- Add circuit breaker patterns
- Improve error messages for users
- Add more detailed logging

## Conclusion

RedShell's architecture prioritizes:

1. **Security**: Sandboxed execution, secret management, auditability
2. **Scalability**: Serverless, edge-computed, auto-scaling
3. **Transparency**: Open source, deterministic, on-chain records
4. **Reliability**: Redundant services, error handling, retries
5. **Simplicity**: Minimal complexity, clear separation of concerns

The modular design makes it easy to:
- Add new judge types
- Update evaluation logic
- Scale to handle more jobs
- Integrate with new blockchains
- Contribute improvements

---

**Questions?** Open a [GitHub Discussion](https://github.com/marcusjhanford/redshell/discussions) or check the [Contributing Guide](CONTRIBUTING.md).
