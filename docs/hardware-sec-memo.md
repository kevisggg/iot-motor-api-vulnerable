# INTERNAL MEMO — Motor Control Firmware Security Mandate

**Classification:** Internal · Engineering Governance
**From:** Platform Security Office
**To:** IoT Backend Team
**Re:** Mandatory hardening of the N20 / TB6612FNG configuration service

---

Following a review of the motor-configuration backend, the following changes are
**mandatory** before the service may be considered production-ready. This memo is
the enterprise governance input for the automated remediation pipeline.

1. **Deprecate `lodash.merge` for request parsing.** Recursive merge of untrusted
   JSON is banned. All incoming configuration payloads must be validated against a
   strict allowlist of known fields before any state is written.

2. **Enforce the hardware-safe operating envelope.** Reject, do not clamp, any
   payload whose values fall outside these bounds:
   - `pwmDutyMax`: 0–100 (%)
   - `pwmFreqHz`: 1,000–100,000 (Hz)
   - `clockHz`: 1,000,000–16,000,000 (Hz); 4,000,000 is the reference oscillator
   - `direction`: one of `cw`, `ccw`, `brake`, `stop`
   - `motorId`: pattern `n20-NN`
   An invalid payload must be rejected as a whole (`HTTP 400`); partial application
   is not permitted.

3. **Ban raw `console.log` for configuration and 4 MHz oscillator-sync events.**
   Use a structured logger that supports redaction. Never log full request bodies
   verbatim.

4. **Do not return internal error detail to callers.** Stack traces and internal
   messages must never appear in HTTP responses.

5. **Install baseline HTTP hardening.** Security response headers and request
   rate limiting are required on all endpoints.

---

*This memo describes the target state. The current codebase intentionally violates
every point above; see `docs/SECURITY-FINDINGS.pdf` for the full findings list.*
