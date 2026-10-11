/**
 * AgriNova Node.js Backend Test Suite
 * Uses ephemeral HTTP listener with explicit timeouts (AbortSignal)
 * to verify health, 404 handling, and input validation without hanging.
 */

const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../src/app');

// Helper to run ephemeral server with automatic cleanup
function createTestServer() {
  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      const baseUrl = `http://127.0.0.1:${port}`;
      resolve({
        server,
        baseUrl,
        close: () => new Promise((res) => server.close(res))
      });
    });
  });
}

test('Backend Health Check Endpoint', async () => {
  const { baseUrl, close } = await createTestServer();
  try {
    const res = await fetch(`${baseUrl}/health`, {
      signal: AbortSignal.timeout(3000)
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'online');
    assert.strictEqual(data.service, 'AgriNova Node.js / Express Main Backend');
    assert.ok(data.timestamp);
  } finally {
    await close();
  }
});

test('404 Not Found Handler', async () => {
  const { baseUrl, close } = await createTestServer();
  try {
    const res = await fetch(`${baseUrl}/api/nonexistent-route`, {
      signal: AbortSignal.timeout(3000)
    });
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.error, /Route not found/);
  } finally {
    await close();
  }
});

test('POST /api/ai/farm-recommendation - Validation Check', async () => {
  const { baseUrl, close } = await createTestServer();
  try {
    // Missing field information
    const res = await fetch(`${baseUrl}/api/ai/farm-recommendation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(3000)
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.error, /Field information with a valid Bangladesh district is required/);
  } finally {
    await close();
  }
});

test('POST /api/ai/crop-recommendation - Validation Check', async () => {
  const { baseUrl, close } = await createTestServer();
  try {
    const res = await fetch(`${baseUrl}/api/ai/crop-recommendation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ area: 2.0 }),
      signal: AbortSignal.timeout(3000)
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.error, /District is required/);
  } finally {
    await close();
  }
});

test('POST /api/ai/fertilizer-recommendation - Validation Check', async () => {
  const { baseUrl, close } = await createTestServer();
  try {
    const res = await fetch(`${baseUrl}/api/ai/fertilizer-recommendation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ area: 1.5 }),
      signal: AbortSignal.timeout(3000)
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.error, /Crop name is required/);
  } finally {
    await close();
  }
});
