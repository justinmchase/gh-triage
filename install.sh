#!/bin/bash
curl -s https://raw.githubusercontent.com/justinmchase/gh-triage/0.1.0/deno.jsonc -o ~/.deno/bin/triage.deno.jsonc
deno install \
    -fg \
    -n triage \
    --allow-net \
    --allow-run="gh,open" \
    --config ~/.deno/bin/triage.deno.jsonc \
    https://raw.githubusercontent.com/justinmchase/gh-triage/0.1.0/main.ts
