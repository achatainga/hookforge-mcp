#!/usr/bin/env node
import { HookForgeEngine } from '../src/engine.mjs';

const engine = new HookForgeEngine();
const payload = { event: 'order.created', id: 'ord_123' };
console.log(JSON.stringify(engine.generateSignedWebhook(payload, 'whsec_sample_secret'), null, 2));
