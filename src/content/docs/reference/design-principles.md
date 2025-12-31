---
title: Design Principles
description: Architecture and design philosophy
---

## Design Principles

- **Bounded > Unbounded**: Fixed limits prevent cascading failures
- **Explicit > Implicit**: Backpressure forces correct overload handling
- **Simple APIs > Clever Internals**: Easy to use, hard to misuse
- **Correct Shutdown > Fast Shutdown**: No goroutine leaks, ever
- **Metrics are Mandatory**: Observability is not optional

## Architecture

```
Producer → Submit(ctx) → Bounded Queue → Dispatcher → Adaptive Workers → Job Execution
                               ↓
                          Backpressure
```

**Key components:**
- **Bounded Queue**: Buffered channel with fixed capacity
- **Dispatcher**: Routes jobs to workers and monitors scaling
- **Workers**: Execute jobs with panic recovery and metrics tracking
- **Scaling Logic**: Adjusts worker count based on queue utilization
