---
name: hookforge-mcp
description: Deterministic Webhook & Event Replay Sandbox with Zero-Leak HMAC Signing and Race Injection for AI Coding Agents.
version: 1.0.0
tags:
  - webhook
  - stripe
  - whatsapp
  - github
  - hmac
  - event-replay
  - idempotency
---

# HookForge: Deterministic Webhook Sandbox & Replay Engine

HookForge provides local, deterministic webhook and event-stream replay for autonomous coding agents, eliminating reliance on brittle public tunnels (`ngrok`), expired tokens, or hand-rolled cryptographic signatures.

## Why HookForge?

Autonomous coding agents (Claude Code, Cursor, Windsurf, Devin) consistently fail when building or testing webhook consumers:
1. **Broken Signatures**: Agents generate invalid HMAC signatures (e.g. Stripe `t=...v1=...` or GitHub `sha256=...`), causing local servers to reject webhooks with 400 Bad Request or 401 Unauthorized.
2. **Idempotency Blindspots**: Agents rarely test out-of-order event delivery (e.g., `payment_intent.succeeded` before `customer.created`), resulting in uncaught `null` pointer exceptions in production.
3. **Double-Spend Races**: Agents write naive handlers without atomic locks or `SELECT FOR UPDATE`, allowing concurrent duplicate webhook hits to create duplicate orders or credits.

## Core Capabilities

1. **RFC-Compliant HMAC Re-signing**:
   - Generates exact cryptographic headers for Stripe (`stripe-signature`), GitHub (`X-Hub-Signature-256`), Shopify (`X-Shopify-Hmac-Sha256`), and WhatsApp Cloud API.
2. **Out-of-Order Event Replay**:
   - Injects event sequences with configurable permutations and delays to test queue resilience.
3. **Concurrent Burst Injection (Race Test)**:
   - Fires identical webhooks in parallel (0ms delta) to test atomic idempotency guards and CAS locks.
4. **Local Wire Verification**:
   - Directly executes local HTTP handlers without exposing external network ports or leaking staging secrets.

## Available MCP Tools

- `generate_signed_webhook`: Computes cryptographic signature headers given provider, payload, and signing secret.
- `replay_event_stream`: Delivers a sequence of synthetic or recorded events to a local endpoint with customizable order and delay.
- `inject_race_condition`: Fires twin identical webhooks simultaneously to detect duplicate insertions or missing database locks.
- `verify_webhook_handler`: Analyzes endpoint response codes, execution times, and idempotency headers (`Idempotency-Key`).

## Hook Integration

HookForge registers a `PreToolUse` hook inside `hooks/hooks.json` to inspect curl or test executions and automatically inject genuine HMAC signatures for local webhook endpoints.
