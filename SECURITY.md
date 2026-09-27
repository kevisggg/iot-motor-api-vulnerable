# Security Policy

## ⚠️ This project is intentionally vulnerable

`iot-motor-api-vulnerable` is a **vulnerable-by-design** training target, in the same
spirit as [OWASP Juice Shop](https://owasp.org/www-project-juice-shop/) and
[DVWA](https://github.com/digininja/DVWA). Every weakness in this repository is
**deliberate** and documented in [`docs/SECURITY-FINDINGS.pdf`](docs/SECURITY-FINDINGS.pdf).

It exists so an automated CVE-remediation pipeline (IBM Bob 2.0, Team Othy) has a
realistic codebase to analyse, patch, and re-test.

## Do not

- **Do not deploy** this application or expose it to any network.
- **Do not** run it on a shared, production, or internet-facing host.
- **Do not** copy its patterns into real software.

Run it only on a local machine you control, for education and testing.

## Reporting

Because the vulnerabilities here are intentional and already catalogued in the findings
report, there is **nothing to report** — this is not production software. If you spot a
flaw that is *not* listed in `docs/SECURITY-FINDINGS.pdf`, feel free to open an issue so
the catalogue can be kept complete.

## Known issues (summary)

| ID | Finding | Severity |
|----|---------|----------|
| F-01 | Prototype pollution via `lodash.merge` | Critical |
| F-02 | Missing input validation | High |
| F-03 | Outdated dependency (`lodash@4.17.4`) | High |
| F-04 | Stack-trace / info disclosure | Medium |
| F-05 | Missing HTTP hardening | Medium |
| F-06 | Unstructured logging | Medium |

See the full report for detail, CWE/CVE mapping, and remediation guidance.
