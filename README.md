# 🛡️ BuzzShield — Agentic Smart Contract Security on Kite AI

> **The first pay-per-scan smart contract security service built for autonomous AI agents, powered by the x402 protocol on the Kite AI blockchain.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Network: Kite Testnet](https://img.shields.io/badge/Network-Kite%20Testnet-6366f1)](https://docs.gokite.ai)
[![Chain ID: 2368](https://img.shields.io/badge/Chain%20ID-2368-10b981)](https://docs.gokite.ai/kite-chain/1-getting-started/network-information)
[![Protocol: x402](https://img.shields.io/badge/Protocol-x402-f59e0b)](https://x402.org)
[![Facilitator: Pieverse](https://img.shields.io/badge/Facilitator-Pieverse-ec4899)](https://facilitator.pieverse.io)

---

## Table of Contents

- [What is BuzzShield?](#what-is-buzzshield)
- [The Problem We Solve](#the-problem-we-solve)
- [How It Works — The Full Architecture](#how-it-works--the-full-architecture)
- [The x402 Payment Handshake — Step by Step](#the-x402-payment-handshake--step-by-step)
- [Use Cases](#use-cases)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [The Agent in Action](#the-agent-in-action)
- [Technology Stack](#technology-stack)
- [Why This Matters](#why-this-matters)
- [Roadmap](#roadmap)

---

## What is BuzzShield?

BuzzShield is a **Payment Initiation Service Provider (PISP)** and smart contract security scanner built on the Kite AI blockchain. It is the first production-ready demonstration of how AI agents can autonomously purchase security intelligence — paying per-request, in real-time, using stablecoins — with **zero human intervention at transaction time**.

At its core, BuzzShield proves three things simultaneously:

1. **AI agents can be economic actors.** An agent can identify a need, negotiate payment, settle a blockchain transaction, and use the result — all within a single HTTP round-trip.
2. **Agentic infrastructure is real.** The Kite AI ecosystem (Kite Passport + x402 + Pieverse) provides the complete rails for this to happen at scale.
3. **Security is a perfect use case.** Before any agent touches an unknown smart contract, it *should* verify safety. BuzzShield makes that verification instant, cheap ($0.02 per scan), and machine-native.

---

## The Problem We Solve

### For AI Agents

Today's AI agents are increasingly capable of performing complex financial and on-chain operations — swapping tokens, executing trades, managing portfolios. But before any agent interacts with an unfamiliar smart contract, it faces a critical question: **Is this contract safe?**

Without an answer, agents are blind. They may unknowingly interact with:
- **Drainer contracts** — which silently empty connected wallets
- **Rug pulls** — projects designed to collapse after extracting liquidity
- **Honeypots** — contracts that accept deposits but block withdrawals
- **Malicious approvals** — functions that grant unlimited token access to attackers

### For the Payment Infrastructure

Existing security solutions require subscriptions, API keys, and manual billing — none of which AI agents can manage. There was no way for an agent to *buy* security intelligence on-demand, in the moment it was needed, without human setup.

### BuzzShield's Solution

A security API that speaks the language of machines. Using the **x402 protocol**, BuzzShield issues a machine-readable payment challenge for every unauthenticated request. Agents that have a Kite Passport respond by authorizing a micro-payment ($0.02 USDC.e), settling it on-chain, and receiving the security report — all in under 3 seconds.

No API keys. No subscriptions. No monthly invoices. **Pay exactly when you scan, for exactly what you scanned.**

---

## How It Works — The Full Architecture

The following diagram illustrates the complete system architecture — every component, every interaction, and the full lifecycle of a BuzzShield request from the agent's first call to the on-chain settlement receipt.

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                        BUZZSHIELD — SYSTEM ARCHITECTURE                         ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║   ┌─────────────────────────────────────────────────────────────────────────┐   ║
║   │                        USER / AGENT OWNER                               │   ║
║   │   Sets a $5 spending budget in Kite Portal · Signs Session once         │   ║
║   └──────────────────────────────────┬──────────────────────────────────────┘   ║
║                                      │ Delegates spending authority              ║
║                                      ▼                                           ║
║   ┌──────────────────────────────────────────────────────────────────────────┐  ║
║   │                         KITE PASSPORT                                    │  ║
║   │                   (Identity + Wallet + MCP Server)                       │  ║
║   │                                                                          │  ║
║   │   • Holds user's on-chain AA wallet (Account Abstraction)                │  ║
║   │   • Enforces spending rules set by user (Session)                        │  ║
║   │   • Exposes MCP tools: get_payer_addr · approve_payment                  │  ║
║   │   • Signs payment authorizations without exposing private keys           │  ║
║   │                                                                          │  ║
║   └────────────────────────┬─────────────────────────────────────────────────┘ ║
║                             │  MCP tool calls (JSON-RPC over HTTPS)              ║
║                             │                                                    ║
║   ┌─────────────────────────▼──────────────────────────────────────────────┐    ║
║   │                      BUZZSHIELD AGENT                                   │    ║
║   │              (Autonomous Node.js Program — agent/agent.js)              │    ║
║   │                                                                         │    ║
║   │   1. Loads a list of contracts to scan                                  │    ║
║   │   2. Calls BuzzShield /shield endpoint                                  │    ║
║   │   3. Receives HTTP 402 — reads the payment bill                         │    ║
║   │   4. Calls Kite Passport MCP to authorize payment                       │    ║
║   │   5. Retries request with X-Payment header                              │    ║
║   │   6. Receives scan result — makes a security decision                   │    ║
║   │   7. Prints full report — zero human involvement                        │    ║
║   │                                                                         │    ║
║   └──────────────────┬───────────────────────────────────────┬─────────────┘    ║
║                       │  POST /shield                          │  POST /shield   ║
║                       │  (no payment — attempt 1)             │  (with X-Payment ║
║                       │                                        │   header)        ║
║                       ▼                                        ▼                 ║
║   ┌────────────────────────────────────────────────────────────────────────┐    ║
║   │                    BUZZSHIELD API SERVER                                │    ║
║   │                (backend/server.js — Express.js)                        │    ║
║   │                                                                        │    ║
║   │   ┌─────────────────────────────────────────────────────────────────┐  │    ║
║   │   │                  x402 GATEKEEPER MIDDLEWARE                     │  │    ║
║   │   │                  (backend/middleware/x402.js)                   │  │    ║
║   │   │                                                                 │  │    ║
║   │   │  No X-Payment header?  ──▶  Return 402 + payment bill          │  │    ║
║   │   │  X-Payment found?      ──▶  Forward to Pieverse for settlement  │  │    ║
║   │   │  Settlement confirmed? ──▶  Pass request to scanner             │  │    ║
║   │   └──────────────────────────────────┬──────────────────────────────┘  │    ║
║   │                                       │                                 │    ║
║   │   ┌───────────────────────────────────▼──────────────────────────────┐  │   ║
║   │   │                   SCANNER ENGINE                                  │  │   ║
║   │   │               (backend/services/scanner.js)                      │  │   ║
║   │   │                                                                   │  │   ║
║   │   │  • Checks contract against known drainer registry                 │  │   ║
║   │   │  • Analyzes address patterns for suspicious signatures             │  │   ║
║   │   │  • Computes a 0–100 risk score                                    │  │   ║
║   │   │  • Returns verdict: SAFE · SUSPICIOUS · MALICIOUS                 │  │   ║
║   │   └───────────────────────────────────────────────────────────────────┘  │   ║
║   └────────────────────────────────────────────┬───────────────────────────────┘ ║
║                                                 │  POST /v2/settle                ║
║                                                 │  (payment signature)            ║
║                                                 ▼                                 ║
║   ┌─────────────────────────────────────────────────────────────────────────┐    ║
║   │                        PIEVERSE FACILITATOR                              │    ║
║   │                    (https://facilitator.pieverse.io)                     │    ║
║   │                                                                          │    ║
║   │   • Receives the payment signature from BuzzShield                       │    ║
║   │   • Verifies the EIP-712 signature is valid and unspent                  │    ║
║   │   • Calls transferWithAuthorization on the USDC.e contract               │    ║
║   │   • Moves $0.02 from agent's AA wallet → BuzzShield merchant wallet      │    ║
║   │   • Returns on-chain settlement receipt                                   │    ║
║   │                                                                          │    ║
║   └────────────────────────────────────┬─────────────────────────────────────┘   ║
║                                         │  On-chain transaction                   ║
║                                         ▼                                         ║
║   ┌─────────────────────────────────────────────────────────────────────────┐    ║
║   │                        KITE L1 BLOCKCHAIN                                │    ║
║   │              Chain ID: 2368 · RPC: rpc-testnet.gokite.ai                 │    ║
║   │                                                                           │   ║
║   │   Token: USDC.e (0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63)             │   ║
║   │   Explorer: testnet.kitescan.ai                                           │   ║
║   │   Every transaction recorded permanently and transparently                │   ║
║   │                                                                           │   ║
║   └───────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

---

## The x402 Payment Handshake — Step by Step

This is the most important flow to understand. It is the backbone of everything BuzzShield does. The x402 protocol turns a standard HTTP request into a complete commercial transaction in four moves.

```
                    THE x402 PAYMENT HANDSHAKE
   ─────────────────────────────────────────────────────────────────

    AI AGENT                 BUZZSHIELD API              KITE PASSPORT
        │                         │                           │
        │                         │                           │
        │  ① POST /shield         │                           │
        │  (no payment header)    │                           │
        │ ─────────────────────▶  │                           │
        │                         │                           │
        │  ② HTTP 402 Response    │                           │
        │  {                      │                           │
        │    scheme: gokite-aa    │                           │
        │    amount: $0.02        │                           │
        │    payTo: 0xEfD04...    │                           │
        │    network: kite-testnet│                           │
        │  }                      │                           │
        │ ◀─────────────────────  │                           │
        │                         │                           │
        │  ③ MCP: get_payer_addr  │                           │
        │ ─────────────────────────────────────────────────▶  │
        │                         │                           │
        │  { payer_addr: 0x742... }                           │
        │ ◀─────────────────────────────────────────────────  │
        │                         │                           │
        │  ④ MCP: approve_payment │                           │
        │  (amount, payee, token) │                           │
        │ ─────────────────────────────────────────────────▶  │
        │                         │                           │
        │  { x_payment: "eyJ..." }│                           │
        │ ◀─────────────────────────────────────────────────  │
        │                         │                           │
        │  ⑤ POST /shield         │                           │
        │  X-Payment: eyJ...      │                           │
        │ ─────────────────────▶  │                           │
        │                         │                           │
        │                         │  ⑥ POST /v2/settle        │
        │                         │  (to Pieverse)            │
        │                         │ ──────────────────────────▶ PIEVERSE
        │                         │                              │
        │                         │  ⑦ On-chain TX              │
        │                         │  $0.02 moves                │ ──▶ KITE L1
        │                         │                              │
        │                         │  ⑧ { settled: true }        │
        │                         │ ◀──────────────────────────  │
        │                         │                           │
        │  ⑨ 200 OK               │                           │
        │  {                      │                           │
        │    verdict: "SAFE"      │                           │
        │    riskScore: 95        │                           │
        │    flags: []            │                           │
        │    paymentReceipt: {...} │                          │
        │  }                      │                           │
        │ ◀─────────────────────  │                           │
        │                         │                           │

   ─────────────────────────────────────────────────────────────────
   Total time: ~2–3 seconds  |  Cost: $0.02 USDC.e  |  Fully autonomous
```

### What each step means in plain English

| Step | What's Happening |
|------|-----------------|
| ① | The agent asks BuzzShield to scan a contract. No payment attached yet. |
| ② | BuzzShield says "not yet — here's my bill." The bill is machine-readable JSON. |
| ③ | The agent asks Kite Passport: "what's my wallet address?" |
| ④ | The agent asks Kite Passport: "authorize a $0.02 payment to this address." Kite checks the user's pre-approved Session and signs the authorization. |
| ⑤ | The agent re-sends the original request, this time with the signed payment proof in the header. |
| ⑥ | BuzzShield extracts the payment signature and sends it to Pieverse to settle. |
| ⑦ | Pieverse executes the on-chain transfer — $0.02 moves from the agent's wallet to BuzzShield's merchant wallet on Kite L1. |
| ⑧ | Pieverse confirms settlement to BuzzShield. |
| ⑨ | BuzzShield runs the security scan and returns the result with a payment receipt. |

---

## Use Cases

BuzzShield is not just a scanner — it is **agentic security infrastructure**. Any system that interacts with smart contracts is a potential consumer.

### 1. DeFi Trading Agents

An autonomous trading agent identifying arbitrage opportunities or yield farming positions must interact with many smart contracts it has never seen before. Before executing any transaction, the agent calls BuzzShield to verify the contract is not a honeypot, rug pull, or drainer.

```
Trading Agent → finds high-yield pool → calls BuzzShield for scan
             → verdict: SAFE → proceeds with $10,000 deposit
             → verdict: MALICIOUS → aborts, logs threat, moves on
```

**Impact:** Prevents agent from losing user funds to malicious contracts. Each scan costs $0.02 — a negligible insurance premium against potentially catastrophic losses.

---

### 2. NFT Purchase Agents

An agent tasked with buying NFTs on behalf of a user needs to interact with marketplace contracts, collection contracts, and sometimes third-party royalty contracts. BuzzShield provides a pre-flight safety check before every new contract interaction.

```
NFT Agent → identifies desired collection → BuzzShield scans contract
          → riskScore: 88, verdict: SAFE → proceeds with mint
          → riskScore: 12, verdict: MALICIOUS → reports to user, stops
```

**Impact:** Protects users from fake NFT projects and phishing contract addresses that mimic legitimate collections.

---

### 3. Multi-Agent Orchestration Systems

In a multi-agent setup, a coordinator agent dispatches specialist agents to perform specific tasks. BuzzShield becomes part of the coordinator's standard operating procedure — every contract address passed between agents is verified before use.

```
Coordinator Agent
  ├─▶ Research Agent (finds contract addresses)
  ├─▶ BuzzShield Agent (verifies each address)    ← BuzzShield here
  └─▶ Execution Agent (only acts on SAFE verdicts)
```

**Impact:** Creates a security firewall between research and execution layers. Malicious addresses never reach the execution layer.

---

### 4. Wallet & Portfolio Management Tools

Any tool that monitors, manages, or interacts with a user's DeFi portfolio can use BuzzShield to score every contract in the portfolio, flagging any that have been compromised or were malicious from the start.

```
Portfolio Manager runs nightly scan:
  - Contract 0xABC: Score 94 ✅ SAFE
  - Contract 0xDEF: Score 8  🚨 MALICIOUS — new drainer pattern detected
  - Contract 0xGHI: Score 61 ⚠️ SUSPICIOUS — review recommended
```

**Impact:** Provides ongoing contract health monitoring, alerting users to newly-identified threats in their existing positions.

---

### 5. Cross-Chain Bridge Verification

Before an agent bridges assets from one chain to another, it must verify both the source and destination bridge contracts are legitimate. BuzzShield provides rapid, paid verification for both endpoints.

```
Bridge Agent:
  1. Scan source bridge contract → SAFE
  2. Scan destination bridge contract → SAFE
  3. Proceed with bridge transaction
```

**Impact:** Prevents users from bridging assets into fake bridge contracts — one of the most common attack vectors in DeFi.

---

### 6. Developer Security Tooling

Developers building new protocols can integrate BuzzShield into their CI/CD pipelines or deployment scripts to automatically scan smart contract addresses before inclusion in a whitelist or before production deployment.

```
Developer deploys new pool contract
  → BuzzShield scans the deployment address
  → SAFE verdict confirms no unintended backdoors detected
  → Contract is added to the protocol's approved list
```

**Impact:** Adds a lightweight security gate to development workflows, catching issues before they reach end users.

---

### 7. Human Users via the Dashboard

The BuzzShield web dashboard allows non-technical users to manually submit any contract address for scanning. A retail investor unsure about a new project can get an instant risk score and verdict without needing to understand the underlying blockchain mechanics.

**Impact:** Democratizes smart contract security — making institutional-quality risk assessment available to any user for 2 cents.

---

## Project Structure

```
buzzshield/
│
├── backend/                        # BuzzShield API Server
│   ├── middleware/
│   │   └── x402.js                 # x402 payment gatekeeper
│   │                               # - Issues 402 challenges
│   │                               # - Validates X-Payment headers
│   │                               # - Calls Pieverse for settlement
│   │
│   ├── services/
│   │   └── scanner.js              # Smart contract scanner engine
│   │                               # - Risk scoring algorithm
│   │                               # - Drainer registry checks
│   │                               # - Vulnerability pattern analysis
│   │
│   ├── server.js                   # Express server + route definitions
│   │                               # - GET  /health   (free)
│   │                               # - POST /shield   ($0.02 — full scan)
│   │                               # - GET  /score    ($0.01 — quick score)
│   │
│   └── .env                        # Merchant wallet + config (never commit)
│
├── frontend/                       # BuzzShield Dashboard (React + Vite)
│   └── src/
│       ├── App.jsx                 # Main dashboard component
│       │                           # - Manual scan interface
│       │                           # - 402 challenge visualization
│       │                           # - Scan results display
│       │                           # - Activity log
│       └── App.css                 # Dark theme styles
│
└── agent/                          # Autonomous BuzzShield Agent
    ├── mcpClient.js                # Kite Passport MCP interface
    │                               # - get_payer_addr()
    │                               # - approve_payment()
    │
    ├── x402Client.js               # x402 payment cycle handler
    │                               # - fetchWithPayment()
    │                               # - Handles 402 → pay → retry
    │
    ├── agent.js                    # Main agent program
    │                               # - Loads contract list
    │                               # - Runs autonomous scan loop
    │                               # - Prints security report
    │
    └── .env                        # Agent ID + BuzzShield URL
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- A Kite Portal account — [https://x402-portal-eight.vercel.app](https://x402-portal-eight.vercel.app)
- Testnet USDC.e from the faucet — [https://faucet.gokite.ai](https://faucet.gokite.ai)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/buzzshield.git
cd buzzshield
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create your `.env` file:

```env
PORT=8099
MERCHANT_WALLET=0xYourKiteWalletAddressHere
FACILITATOR_URL=https://facilitator.pieverse.io
USDC_CONTRACT=0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63
KITE_CHAIN_ID=2368
MERCHANT_NAME=BuzzShield
```

Start the backend:

```bash
npm run dev
```

Verify it's running:

```bash
curl http://localhost:8099/health
```

Expected response:
```json
{ "status": "BuzzShield is live", "chain": "kite-testnet", "chainId": 2368 }
```

### 3. Test the 402 Challenge

```bash
curl -X POST http://localhost:8099/shield \
  -H "Content-Type: application/json" \
  -d '{"contractAddress": "0x1234567890abcdef1234567890abcdef12345678"}'
```

You should receive an HTTP 402 response containing the payment bill. This confirms your gatekeeper is working correctly.

### 4. Set Up the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Set Up the Agent

```bash
cd ../agent
npm install
```

Create `agent/.env`:

```env
BUZZSHIELD_URL=http://localhost:8099
KITE_MCP_URL=https://neo.dev.gokite.ai/v1/mcp?agentId=YOUR_AGENT_ID
AGENT_ID=YOUR_AGENT_ID_FROM_KITE_PORTAL
```

Run the agent:

```bash
node agent.js
```

The agent will autonomously scan all contracts in its list, pay BuzzShield for each scan using Kite Passport, and print a full security report.

---

## API Reference

### `GET /health`
Free endpoint. Returns service status.

**Response:**
```json
{
  "status": "BuzzShield is live",
  "chain": "kite-testnet",
  "chainId": 2368
}
```

---

### `POST /shield`
**Price:** $0.02 USDC.e  
Full smart contract security scan. Returns detailed verdict, risk score, and identified vulnerability flags.

**Request Body:**
```json
{
  "contractAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

**Response (200 OK after payment):**
```json
{
  "contractAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "verdict": "SAFE",
  "riskScore": 95,
  "flags": [],
  "scannedAt": "2026-04-17T10:00:00.000Z",
  "paymentReceipt": {
    "txHash": "0xabc123...",
    "settled": true
  }
}
```

**Without payment (402):**
```json
{
  "error": "X-PAYMENT header is required",
  "accepts": [{
    "scheme": "gokite-aa",
    "network": "kite-testnet",
    "maxAmountRequired": "20000000000000000",
    "payTo": "0xYourMerchantWallet",
    "asset": "0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63",
    "merchantName": "BuzzShield"
  }],
  "x402Version": 1
}
```

---

### `GET /score`
**Price:** $0.01 USDC.e  
Quick risk score. Returns a simplified grade without full flag analysis.

**Query Parameters:** `address=0x...`

**Response (200 OK after payment):**
```json
{
  "contractAddress": "0x1234...",
  "score": 88,
  "grade": "A",
  "summary": "SAFE"
}
```

---

## The Agent in Action

When you run `node agent.js`, you will see output like this:

```
══════════════════════════════════════════════════════
   🤖 BUZZSHIELD SECURITY AGENT — STARTING UP
══════════════════════════════════════════════════════
  BuzzShield API: http://localhost:8099
  Contracts to scan: 3
  Estimated cost: ~$0.06 USDC.e
  Payment method: Kite Passport (autonomous)
══════════════════════════════════════════════════════

  ✅ BuzzShield is online: BuzzShield is live

  🚀 Starting autonomous scan sequence...

🔎 Scanning: Unknown DeFi Protocol
   Address: 0x1234567890abcdef...
   Reason: User wants to invest — checking safety first
──────────────────────────────────────────────────────
  📡 Calling: http://localhost:8099/shield
  ⚡ 402 Payment Required received
  💸 Amount: $0.0200 USDC.e
  🏦 Pay to: 0xEfD0497f4557b49E84369cfb884B6c7446e11aBA
  🌐 Network: kite-testnet
  🔍 Fetching payer wallet address from Kite Passport...
  👤 Payer address: 0x742d35Cc...
  ✍️  Requesting payment authorization for 20000000000000000 USDC...
  🔐 Payment authorized by Kite Passport
  🔄 Retrying request with X-Payment header...
  ✅ Payment settled & results received!

══════════════════════════════════════════════════════
        🛡️  BUZZSHIELD SECURITY REPORT
══════════════════════════════════════════════════════
  Agent completed: 3 scans
  Total spent:     $0.06 USDC.e
  Network:         Kite Testnet (Chain ID: 2368)
══════════════════════════════════════════════════════

  1. ✅ Unknown DeFi Protocol
     Verdict:    SAFE
     Risk Score: 95/100
     Paid:       $0.02
     Receipt:    ✓ On-chain settlement confirmed

  2. 🚨 Suspicious Airdrop Contract
     Verdict:    MALICIOUS
     Risk Score: 10/100
     Flags:
       • [CRITICAL] Known drainer contract
     Paid:       $0.02
     Receipt:    ✓ On-chain settlement confirmed

  3. ⚠️  New NFT Marketplace
     Verdict:    SUSPICIOUS
     Risk Score: 61/100
     Paid:       $0.02
     Receipt:    ✓ On-chain settlement confirmed

══════════════════════════════════════════════════════

  📋 AGENT DECISIONS:
  ✅ Unknown DeFi Protocol → PROCEED with interaction
  🚨 Suspicious Airdrop Contract → ABORT — do not interact
  ⚠️  New NFT Marketplace → CAUTION — manual review needed

══════════════════════════════════════════════════════

  💡 All payments made autonomously via Kite Passport
  🔗 Transactions recorded on Kite Testnet blockchain
  🤖 Zero human intervention required
══════════════════════════════════════════════════════
```

---

## Technology Stack

| Layer | Technology | Role |
|-------|------------|------|
| **Blockchain** | Kite L1 (Chain ID: 2368) | Settlement layer for all payments |
| **Payment Protocol** | x402 (gokite-aa scheme) | HTTP-native payment handshake |
| **Identity & Wallet** | Kite Passport + MCP | Agent authentication and payment signing |
| **Payment Facilitator** | Pieverse | On-chain transaction execution and verification |
| **Payment Token** | USDC.e | Stablecoin used for all transactions |
| **API Framework** | Express.js (Node.js) | BuzzShield backend server |
| **Frontend** | React + Vite | Human-facing dashboard |
| **Agent Runtime** | Node.js | Autonomous scanning agent |

---

## Why This Matters

BuzzShield is a proof of concept for something much larger than smart contract scanning.

**It demonstrates that the agentic economy is real.** The Kite AI ecosystem provides everything needed for an AI agent to be a first-class economic participant — owning identity, holding a budget, making payments, and receiving services — without any human involvement at transaction time.

**It demonstrates that pay-per-use is the right model for AI.** Traditional API billing assumes a human managing subscriptions and API keys. But AI agents are transient, numerous, and need to pay for exactly what they use. The x402 model — negotiating and settling payment within the HTTP request itself — is the only model that scales to billions of agent-to-service interactions.

**It demonstrates that security is the foundation.** Every AI agent that operates in a DeFi environment needs to be able to trust the contracts it interacts with. BuzzShield provides that trust layer — cheaply, instantly, and without any friction for the agent consuming it.

The scanner is the product. The payment infrastructure is the innovation. Together, they show what the next generation of the internet looks like when machines can buy services the same way humans do — but at machine speed, machine scale, and with machine precision.

---

## Roadmap

- [ ] **Slither Integration** — Replace heuristic scanning with Slither static analysis for real vulnerability detection
- [ ] **On-chain Registry** — Store known drainer/malicious addresses in a Kite L1 smart contract for community-maintained updates
- [ ] **Streaming Payments** — Switch from per-request to streaming micropayments for long-running analysis jobs
- [ ] **Agent SDK** — Publish an npm package (`buzzshield-agent`) so any developer can add security scanning to their agent in 3 lines of code
- [ ] **Batch Scanning** — Single payment covers scanning up to 10 contracts in one request
- [ ] **Mainnet Deployment** — Production deployment on Kite mainnet with real USDC

---

## Network Information

| Parameter | Value |
|-----------|-------|
| Chain Name | KiteAI Testnet |
| Chain ID | 2368 |
| RPC URL | https://rpc-testnet.gokite.ai/ |
| Explorer | https://testnet.kitescan.ai/ |
| Faucet | https://faucet.gokite.ai |
| USDC.e Contract | 0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63 |
| Facilitator | https://facilitator.pieverse.io |

---

## License

MIT © 2026 BuzzShield

---

*Built for the Kite AI Hackathon — April 2026*  
*Powered by Kite AI · x402 Protocol · Pieverse*