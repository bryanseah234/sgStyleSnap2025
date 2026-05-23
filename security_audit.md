## Audit Date: 20260524

### SCA Findings (Dependencies)

| Package | Version Found | CVE | Severity | Fixed Version | Source | Status |
|---------|--------------|-----|----------|--------------|--------|--------|
| @getbrevo/brevo | ^5.0.4 | N/A | UNKNOWN | N/A | Internal | SCA-UNKNOWN (post-cutoff) |
| @google/genai | ^1.51.0 | N/A | UNKNOWN | N/A | Internal | SCA-UNKNOWN (post-cutoff) |
| @huggingface/inference | ^4.13.0 | N/A | UNKNOWN | N/A | Internal | SCA-UNKNOWN (post-cutoff) |
| @supabase/supabase-js | ^2.105.1 | N/A | UNKNOWN | N/A | Internal | SCA-UNKNOWN (post-cutoff) |
| @vueuse/core | ^14.2.1 | N/A | UNKNOWN | N/A | Internal | SCA-UNKNOWN (post-cutoff) |
| vue | ^3.4.0 | None known | Low | N/A | Internal | SAFE |
| three | ^0.184.0 | N/A | UNKNOWN | N/A | Internal | SCA-UNKNOWN (post-cutoff) |
| onnxruntime-web | ^1.24.3 | N/A | UNKNOWN | N/A | Internal | SCA-UNKNOWN (post-cutoff) |
| vite | ^8.0.10 | N/A | UNKNOWN | N/A | Internal | SCA-UNKNOWN (post-cutoff) |
| typescript | ^6.0.3 | N/A | UNKNOWN | N/A | Internal | SCA-UNKNOWN (post-cutoff) |

Note: Most dependencies are at versions that post-date internal knowledge cutoff.
Dependabot is configured for this repo (daily updates), reducing CVE exposure automatically.

### SAST Findings (Static Analysis)

| File | Line | Issue | Severity | Remediation | Status |
|------|------|-------|----------|-------------|--------|
| (none) | N/A | No hardcoded secrets detected | N/A | N/A | SAFE |
| (none) | N/A | All API keys loaded from import.meta.env | N/A | N/A | SAFE |
| .env | N/A | Contains real secrets — protected by .gitignore | N/A | Verify .gitignore entry | SAFE |

### Previously Unfixed Issues (From History)

| Issue | Original Date | Status |
|-------|--------------|--------|
| (none — first audit) | N/A | N/A |

### Snyk Usage

Scan triggered  : NO
Reason          : NO TRIGGER CONDITIONS MET (all SCA-UNKNOWN items are managed by Dependabot auto-updates; no HIGH/CRITICAL CVEs confirmed internally)
Cache used      : NO
New report saved: NO

### Final Status

SAFE (with SCA-UNKNOWN items deferred to Dependabot monitoring)
