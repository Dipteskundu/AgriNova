/**
 * AgriNova Node.js Backend Test Suite
 * Tests health, 404 handling, authentication, and input validation.
 */

const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

const TEST_SECRET = process.env.JWT_SECRET || 'agrinova_test_only_secret_do_not_use_in_production';

// Helper to run an ephemeral server with automatic cleanup.
function createTestServer() {
  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${port}`,
        close: () => new Promise((res, rej) => {
          server.close((err) => err ? rej(err) : res());
        })
      });
    });
  });
}

function authHeaders(body = {}) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${jwt.sign({ id: 'test_farmer_1', role: 'farmer' }, TEST_SECRET)}`,
  };
}

test('Backend Health Check Endpoint', async () => {
  const { baseUrl, close } = await createTestServer();
  try {
    const res = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(3000) });
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
    const res = await fetch(`${baseUrl}/api/nonexistent-route`, { signal: AbortSignal.timeout(3000) });
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.error, /Route not found/);
  } finally {
    await close();
  }
});

for (const endpoint of [
  '/api/ai/farm-recommendation',
  '/api/ai/crop-recommendation',
  '/api/ai/fertilizer-recommendation'
]) {
  test(`${endpoint} rejects missing authentication`, async () => {
    const { baseUrl, close } = await createTestServer();
    try {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
        signal: AbortSignal.timeout(3000)
      });
      assert.strictEqual(res.status, 401);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.match(data.error, /token is required/i);
    } finally {
      await close();
    }
  });

  test(`${endpoint} rejects invalid authentication`, async () => {
    const { baseUrl, close } = await createTestServer();
    try {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer invalid.test.token'
        },
        body: JSON.stringify({}),
        signal: AbortSignal.timeout(3000)
      });
      assert.strictEqual(res.status, 401);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.match(data.error, /invalid or expired/i);
    } finally {
      await close();
    }
  });
}

const validationCases = [
  {
    endpoint: '/api/ai/farm-recommendation',
    body: {},
    expectedError: /Field information with a valid Bangladesh district is required/
  },
  {
    endpoint: '/api/ai/crop-recommendation',
    body: { area: 2.0 },
    expectedError: /District is required/
  },
  {
    endpoint: '/api/ai/fertilizer-recommendation',
    body: { area: 1.5 },
    expectedError: /Crop name is required/
  }
];

for (const { endpoint, body, expectedError } of validationCases) {
  test(`${endpoint} validates required fields for authenticated requests`, async () => {
    const { baseUrl, close } = await createTestServer();
    try {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(3000)
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.match(data.error, expectedError);
    } finally {
      await close();
    }
  });
}
