---
title: Design Principles
description: Architecture and design philosophy
---

## Design Principles

- **Bounded > Unbounded**: Fixed limits prevent cascading failures
- **Explicit > Implicit**: Backpressure forces correct overload handling
- **Simple APIs > Clever Internals**: Easy to use, hard to misuse
- **Correct Shutdown > Fast Shutdown**: No goroutine leaks, ever
- **Observability is Built In**: In-process metrics are always on, and exporters plug in without adding dependencies to the core

## Architecture

```
Producer → Submit(ctx) → Bounded Queue → Adaptive Workers → Job Execution (+ retries)
                               ↓                  ↑
                          Backpressure      Dispatcher (scales workers)
```

**Key components:**
- **Bounded Queue**: Buffered channel with fixed capacity
- **Dispatcher**: Checks queue utilization and adds workers when it crosses the scale-up threshold
- **Workers**: Pull jobs from the queue and execute them with panic recovery, retries and metrics tracking
- **Scaling Logic**: Adjusts worker count based on queue utilization
