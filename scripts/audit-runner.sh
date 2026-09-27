#!/usr/bin/env bash
# audit-runner.sh — produces a zero-token dependency audit report.
# The remediation pipeline can ingest this JSON alongside the PDF findings report.
set -euo pipefail
cd "$(dirname "$0")/.."
echo "Running npm audit (JSON) -> scripts/dummy-audit.json"
npm audit --json > scripts/dummy-audit.json || true
echo "Done. Review scripts/dummy-audit.json"
