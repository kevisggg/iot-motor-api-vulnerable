# iot-motor-api-vulnerable

> ⚠️ **Intentionally vulnerable — do not deploy.**
> This repository is a *vulnerable-by-design* training target, in the same spirit as
> [OWASP Juice Shop](https://owasp.org/www-project-juice-shop/) or
> [DVWA](https://github.com/digininja/DVWA). Every weakness is deliberate and
> documented. It exists so an automated CVE-remediation pipeline (IBM Bob 2.0) has a
> realistic codebase to analyse, patch, and re-test. Never expose it to a network.

A small Node.js / Express backend that accepts configuration commands for a fleet of
TB6612FNG-driven **6V N20 micro gear motors** — PWM duty cycle, drive frequency,
oscillator clock, and direction.

## Role in the Team Othy pipeline

This is the **input** to our doc-driven remediation pipeline:

1. The pipeline clones this repo.
2. It reads [`docs/SECURITY-FINDINGS.pdf`](docs/SECURITY-FINDINGS.pdf) — the report of what is wrong.
3. IBM Bob triages, patches the code, and generates adversarial tests.
4. It returns a hardened `.zip`.

The paired hardening mandate the fix should satisfy is in
[`docs/hardware-sec-memo.md`](docs/hardware-sec-memo.md).

## Run it

```bash
npm install
npm start          # server on http://localhost:3000
npm test           # smoke checks — also demonstrates the vulnerabilities are live
```

Health check:

```bash
curl http://localhost:3000/health
```

Normal use:

```bash
curl -X POST http://localhost:3000/api/motor/config \
  -H 'Content-Type: application/json' \
  -d '{"motorId":"n20-01","pwmDutyMax":55,"direction":"cw"}'
```

## What's wrong with it (summary)

Full detail, severity, CWE/CVE mapping, and remediation are in
**[`docs/SECURITY-FINDINGS.pdf`](docs/SECURITY-FINDINGS.pdf)**.

| ID | Finding | CWE |
|----|---------|-----|
| F-01 | Prototype pollution via `lodash.merge` on `/api/motor/config` | CWE-1321 |
| F-02 | No input validation / no allowlist (unsafe motor values accepted) | CWE-20 |
| F-03 | Outdated dependency with known CVEs (`lodash@4.17.4`) | CWE-1104 |
| F-04 | Stack-trace / internal-detail disclosure in error responses | CWE-209 |
| F-05 | Missing HTTP hardening (no security headers, no rate limiting) | CWE-693 |
| F-06 | Unstructured logging of full request bodies | CWE-532 |

## Layout

```
iot-motor-api-vulnerable/
├── src/
│   ├── server.js          # Express app, JSON parsing, error handler
│   └── api/
│       └── n20-config.js  # the vulnerable motor-config endpoint
├── docs/
│   ├── SECURITY-FINDINGS.pdf   # the findings report (drives remediation)
│   └── hardware-sec-memo.md    # the target hardening mandate
├── scripts/
│   └── audit-runner.sh    # emits scripts/dummy-audit.json (npm audit)
├── tests/
│   └── smoke.test.js      # boots the app; proves each finding is live
└── package.json
```

## License

MIT — for educational and security-training use only.
