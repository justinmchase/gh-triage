#!/bin/bash

deno install \
    -fg \
    -n triage \
    --allow-net \
    --allow-run="gh,open" \
    --config https://raw.githubusercontent.com/justinmchase/gh-triage/0.1.0/deno.jsonc \
    https://raw.githubusercontent.com/justinmchase/gh-triage/0.1.0/main.ts
