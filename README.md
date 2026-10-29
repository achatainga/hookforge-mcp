# HookForge MCP

> Deterministic Webhook & Event Replay Engine with Cryptographic Signatures and Race Injection for AI Coding Agents.

[![MCP 2026-07-28](https://img.shields.io/badge/MCP-2026--07--28-blue.svg)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## The Problem
Autonomous coding agents building webhook endpoints (Stripe, WhatsApp, GitHub, Shopify) face three crippling failure modes:
1. **Cryptographic Signature Mismatch**: Agents guess HMAC headers or produce malformed signatures, receiving `400 Bad Request` or `401 Unauthorized` in continuous test loops.
2. **Missing Concurrency Guards**: Agents write naive database insertions without `SELECT FOR UPDATE` or CAS checks. When twin webhooks arrive simultaneously, duplicate records are created.
3. **Out-of-Order Delivery Crashes**: Real-world webhooks arrive asynchronously (`charge.succeeded` before `customer.created`), crashing agent-written endpoints that expect strictly synchronous flows.

## The Solution
HookForge MCP acts as a local cryptographic bridge and deterministic event simulator:
- **Zero-Guess HMAC Generator**: Generates RFC-compliant signature headers (`stripe-signature`, `X-Hub-Signature-256`, `X-Shopify-Hmac-Sha256`) using actual secrets.
- **Race Condition Injector**: Simultaneously dispatches twin webhook requests (0ms delta) to force test idempotency handling.
- **Event Permutation Streamer**: Injects sequence permutations to verify queue decoupling and missing parent record guards.

## Available Tools

### `generate_signed_webhook`
Computes provider-specific cryptographic headers for raw JSON payloads.

### `inject_race_condition`
Dispatches concurrent identical requests to detect double-spending or missing database locks.

### `replay_event_stream`
Simulates out-of-order event delivery pipelines with customizable micro-delays.

## Live Verification
```bash
node tests/run_live_test.mjs
```

## License
MIT © 2026 HookForge Systems
