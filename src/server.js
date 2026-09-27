'use strict';

/*
 * iot-motor-api-vulnerable — server.js
 * ------------------------------------
 * Small Express backend that accepts configuration commands for a fleet of
 * TB6612FNG-driven 6V N20 micro gear motors (PWM duty cycle, drive frequency,
 * oscillator clock, direction).
 *
 * ⚠️  THIS APPLICATION IS INTENTIONALLY VULNERABLE.
 * It is a training target for an automated CVE-remediation pipeline. Every
 * weakness here is deliberate and documented in docs/SECURITY-FINDINGS.pdf.
 * Do not deploy it, expose it to a network, or copy its patterns.
 */

const express = require('express');
const motorConfigRouter = require('./api/n20-config');

const app = express();
const PORT = process.env.PORT || 3000;

// FINDING F-05: no security-hardening middleware is installed.
// There is no helmet (so no security response headers), no rate limiting,
// and no request-body size cap beyond Express's default. A single client can
// flood the config endpoint unthrottled.
app.use(express.json());

// Liveness probe — safe, no user input.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'iot-motor-api', uptime: process.uptime() });
});

// Motor configuration routes live under /api/motor (see src/api/n20-config.js).
app.use('/api/motor', motorConfigRouter);

// 404 handler.
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// FINDING F-04: verbose error handler leaks internals.
// The full stack trace and message are returned to the caller, disclosing
// file paths, dependency versions, and internal logic to an attacker.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.log('[ERROR]', err); // FINDING F-06: unstructured logging (see n20-config.js)
  res.status(500).json({
    error: err.message,
    stack: err.stack,
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`iot-motor-api (VULNERABLE) listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
