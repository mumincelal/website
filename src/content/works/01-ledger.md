---
title: Ledger
year: "2026"
role: Lead engineer
client: Ledger Financial
kicker: Fintech — Realtime dashboard
scope: Product design & build
url: "#"
shots:
  - Ledger — dashboard overview
  - Filter panel
  - Merchant detail
points:
  - First paint down from 3.2s to 380ms on a mid-range Android.
  - Delta stream replaced 14 polling endpoints.
  - Cache layer shared with the mobile client.
---

A realtime dashboard used by 40,000 merchants to watch money move. The old build re-fetched everything on every filter change; the rewrite streams deltas and renders from a local cache.
