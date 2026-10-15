---
name: pg-outbox
stars: "640"
forks: "37"
license: Apache-2.0
since: "2022"
url: "#"
install: go get github.com/nkovac/pg-outbox
points:
  - Exactly-once handoff to any queue with an at-least-once sink.
  - Batch drain with configurable back-pressure.
  - Runs in production on three teams' services.
activity: [22, 40, 62, 48, 70, 36, 58, 80, 44, 54, 68, 34]
---

The transactional outbox pattern for Postgres, small enough to read in one sitting. Writes and events commit together, so a crash never leaves a half-published message.
