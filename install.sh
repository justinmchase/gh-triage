#!/bin/bash
deno install \
    -fg \
    -n triage \
    --allow-net \
    --allow-run="gh,open" \
    https://raw.githubusercontent.com/justinmchase/gh-triage/main/main.ts
