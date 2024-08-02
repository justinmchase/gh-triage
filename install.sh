#!/bin/bash
set -e

if [[ ! $(which deno) ]]
then
  echo "Please install deno first!"
  echo ""
  echo "curl -fsSL https://deno.land/install.sh | sh"
  echo ""
  exit 1
fi

curl -s https://raw.githubusercontent.com/justinmchase/gh-triage/0.1.2/deno.jsonc \
  -o ~/.deno/bin/triage.deno.jsonc

deno install \
  -fg \
  -n triage \
  --allow-net \
  --allow-run="gh,open" \
  --config ~/.deno/bin/triage.deno.jsonc \
  https://raw.githubusercontent.com/justinmchase/gh-triage/0.1.2/main.ts

if [[ ! $(which triage) ]]
then
  echo "Installation was not successful. Please try again or report any errors here:"
  echo ""
  echo "https://github.com/justinmchase/gh-triage/issues"
  echo ""
  exit 1
fi