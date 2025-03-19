#!/bin/bash
tmux new-session -s mapvoyage -n tunnel 'cd server && npm run tunnel' \; \
  new-window -n server 'cd server && deno run -A --watch dev.ts' \; \
  new-window -n app 'cd app && npm run android' \; \
  select-window -t 0

# see https://ai.roettgers.co/c/20e0db10-5cb0-403c-a679-e0b15f5c2440