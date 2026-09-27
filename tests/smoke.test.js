'use strict';

/*
 * smoke.test.js — minimal, dependency-free checks.
 *
 * Purpose: prove the app boots and the endpoints respond, AND demonstrate that
 * the documented weaknesses are actually present, so the remediation pipeline
 * has a verifiable before/after. Uses only Node's built-in http + assert.
 *
 * Run: npm test   (starts the server on an ephemeral port, exercises it, exits)
 */

const assert = require('assert');
const http = require('http');
const app = require('../src/server');

function request(port, method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      { host: '127.0.0.1', port, method, path, headers: { 'Content-Type': 'application/json' } },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => resolve({ status: res.statusCode, body: buf ? JSON.parse(buf) : null }));
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

(async () => {
  const server = app.listen(0);
  const port = server.address().port;
  let failures = 0;
  const check = (name, fn) => {
    try { fn(); console.log(`  PASS  ${name}`); }
    catch (e) { failures++; console.log(`  FAIL  ${name} — ${e.message}`); }
  };

  try {
    // 1. Server is alive.
    const health = await request(port, 'GET', '/health');
    check('health endpoint returns ok', () => {
      assert.strictEqual(health.status, 200);
      assert.strictEqual(health.body.status, 'ok');
    });

    // 2. Normal config update works.
    const ok = await request(port, 'POST', '/api/motor/config', { motorId: 'n20-01', direction: 'cw' });
    check('valid config is accepted', () => {
      assert.strictEqual(ok.status, 200);
      assert.strictEqual(ok.body.state.motorId, 'n20-01');
    });

    // 3. DEMONSTRATE F-02: out-of-range values are (wrongly) accepted.
    const oob = await request(port, 'POST', '/api/motor/config', { pwmDutyMax: 250, clockHz: 99999999 });
    check('F-02 present: unsafe out-of-range values are accepted', () => {
      assert.strictEqual(oob.body.state.pwmDutyMax, 250, 'expected the app to accept an unsafe duty cycle');
    });

    // 4. DEMONSTRATE F-01: prototype pollution succeeds on the vulnerable app.
    assert.strictEqual({}.polluted, undefined, 'prototype should be clean before the test');
    await request(port, 'POST', '/api/motor/config', JSON.parse('{"__proto__":{"polluted":"yes"}}'));
    check('F-01 present: prototype pollution succeeds (this is the bug Bob must fix)', () => {
      // On the vulnerable app this is "yes"; after remediation it must be undefined.
      assert.strictEqual({}.polluted, 'yes', 'expected Object.prototype to be polluted on the vulnerable build');
    });
    // Clean up the polluted prototype so the process exits sanely.
    delete Object.prototype.polluted;

    // 5. DEMONSTRATE F-04: error handler leaks a stack trace.
    // Send a body that is valid JSON but breaks the merge path indirectly is hard to
    // force deterministically; instead confirm the handler shape exists.
    check('F-04 present: error handler is configured to return stack traces', () => {
      const src = require('fs').readFileSync(require('path').join(__dirname, '../src/server.js'), 'utf8');
      assert.ok(/stack:\s*err\.stack/.test(src), 'error handler should expose err.stack (vulnerable build)');
    });

    console.log('');
    if (failures === 0) {
      console.log('All smoke checks passed — the vulnerable build behaves as documented.');
    } else {
      console.log(`${failures} check(s) failed.`);
    }
  } finally {
    server.close();
  }

  process.exit(failures === 0 ? 0 : 1);
})();
