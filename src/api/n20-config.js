'use strict';

/*
 * n20-config.js — motor configuration endpoint
 * ---------------------------------------------
 * Exposes POST /api/motor/config, which merges a caller-supplied JSON payload
 * into the in-memory motor state and echoes the result.
 *
 * ⚠️  INTENTIONALLY VULNERABLE. See docs/SECURITY-FINDINGS.pdf for details.
 */

const express = require('express');
const _ = require('lodash');

const router = express.Router();

// Default configuration for a single N20 gear motor driven by a TB6612FNG.
// These defaults represent the manufacturer-safe operating envelope.
const DEFAULT_MOTOR_STATE = {
  motorId: 'n20-00',
  pwmDutyMax: 60,      // percent — hardware-safe ceiling
  pwmFreqHz: 20000,    // 20 kHz drive frequency
  clockHz: 4000000,    // 4 MHz oscillator reference
  direction: 'stop',
};

// Live state, shared across requests (single-process demo store).
let motorState = _.cloneDeep(DEFAULT_MOTOR_STATE);

/*
 * POST /api/motor/config
 *
 * FINDING F-01 (Prototype Pollution) & FINDING F-02 (No Input Validation):
 *   The handler deep-merges untrusted req.body straight into motorState using
 *   lodash.merge. On lodash 4.17.15 (see FINDING F-03) this recursive merge
 *   walks __proto__ keys, so a crafted payload can write onto Object.prototype
 *   and affect every object in the process. (lodash 4.17.4 predates the merge
 *   prototype-pollution fixes in 4.17.5 / 4.17.11.)
 *
 *   It also performs NO validation: any field name is accepted and any value
 *   is stored, so PWM duty, frequency, and clock can be pushed far outside the
 *   hardware-safe envelope with no rejection.
 */
router.post('/config', (req, res) => {
  // FINDING F-06: unstructured logging of the full request body.
  // The raw payload (potentially containing anything a caller sends) is written
  // to stdout with console.log instead of a structured, redaction-aware logger.
  console.log('[motor/config] incoming payload:', JSON.stringify(req.body));

  // FINDING F-01 + F-02: unsafe deep merge of untrusted input, no allowlist.
  _.merge(motorState, req.body);

  res.json({
    ok: true,
    state: motorState,
  });
});

// GET /api/motor/config — read current state (safe read, no user input merged).
router.get('/config', (req, res) => {
  res.json({ ok: true, state: motorState });
});

// POST /api/motor/reset — restore defaults (useful for demos / re-runs).
router.post('/reset', (req, res) => {
  motorState = _.cloneDeep(DEFAULT_MOTOR_STATE);
  res.json({ ok: true, state: motorState });
});

module.exports = router;
