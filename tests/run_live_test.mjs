import assert from 'node:assert';
import { HookForgeEngine } from '../src/engine.mjs';

async function runAllTests() {
  console.log('🧪 Starting HookForge MCP Live Test Gauntlet...');
  const engine = new HookForgeEngine();

  // Test 1: Stripe HMAC signature verification
  console.log('\n[Test 1] Verifying Stripe HMAC signature calculation...');
  const stripeSecret = 'whsec_test_secret_stripe_123';
  const stripePayload = { id: 'evt_1001', type: 'payment_intent.succeeded', amount: 5000 };
  const fixedTimestamp = 1730000000;
  const stripeResult = engine.generateSignedWebhook({
    provider: 'stripe',
    payload: stripePayload,
    secret: stripeSecret,
    timestamp: fixedTimestamp
  });

  assert.ok(stripeResult.headers['stripe-signature'], 'Stripe header must be present');
  assert.ok(stripeResult.headers['stripe-signature'].startsWith(`t=${fixedTimestamp},v1=`), 'Signature must start with timestamp and v1=');
  console.log('  ✅ Stripe signature header verified: ' + stripeResult.headers['stripe-signature'].slice(0, 40) + '...');

  // Test 2: GitHub & WhatsApp HMAC signature verification
  console.log('\n[Test 2] Verifying GitHub & WhatsApp SHA256 signatures...');
  const ghResult = engine.generateSignedWebhook({
    provider: 'github',
    payload: { action: 'push', ref: 'refs/heads/main' },
    secret: 'secret_gh_key'
  });
  assert.ok(ghResult.headers['x-hub-signature-256'].startsWith('sha256='), 'GitHub header must start with sha256=');

  const waResult = engine.generateSignedWebhook({
    provider: 'whatsapp',
    payload: { entry: [{ changes: [{ value: { messages: [{ from: '12345' }] } }] }] },
    secret: 'secret_wa_key'
  });
  assert.ok(waResult.headers['x-hub-signature-256'].startsWith('sha256='), 'WhatsApp header must start with sha256=');
  console.log('  ✅ GitHub and WhatsApp SHA-256 headers verified.');

  // Test 3: Race condition injection test
  console.log('\n[Test 3] Verifying Concurrent Race Injection (Twin Webhook Hit)...');
  const raceResult = await engine.injectRaceCondition({
    targetUrl: 'mock://local-api/webhook',
    payload: { id: 'evt_race_01', type: 'charge.completed' },
    concurrency: 2
  });

  assert.strictEqual(raceResult.concurrency, 2, 'Must execute exactly 2 concurrent requests');
  assert.strictEqual(raceResult.analysis.isIdempotent, true, 'Mock receiver must handle idempotency properly');
  assert.strictEqual(raceResult.analysis.risk, 'IDEMPOTENT_VERIFIED', 'Analysis must declare verified');
  console.log('  ✅ Race condition twin burst successfully captured & evaluated.');

  // Test 4: Out-of-order event replay
  console.log('\n[Test 4] Verifying Out-of-Order Event Replay Permutation...');
  const eventStream = [
    { type: 'customer.created', payload: { id: 'cus_1' } },
    { type: 'payment_intent.succeeded', payload: { id: 'pi_1' } },
    { type: 'invoice.paid', payload: { id: 'in_1' } }
  ];

  const replayResult = await engine.replayEventStream({
    events: eventStream,
    outOfOrder: true,
    delayMs: 2
  });

  assert.strictEqual(replayResult.totalEvents, 3);
  assert.strictEqual(replayResult.outOfOrderInjected, true);
  // Verify inversion of event 0 and 1
  assert.strictEqual(replayResult.streamLogs[0].eventType, 'payment_intent.succeeded');
  assert.strictEqual(replayResult.streamLogs[1].eventType, 'customer.created');
  console.log('  ✅ Out-of-order event stream inversion successfully verified.');

  console.log('\n🎉 ALL 4 GAUNTLET TESTS PASSED WITH 100% SUCCESS RATE!');
}

runAllTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
