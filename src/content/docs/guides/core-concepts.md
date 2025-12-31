---
title: Core Concepts
description: Understanding Backpressure, Metrics, and Shutdown
---

## Backpressure Handling

The pool enforces backpressure when the queue is full. You can handle this using standard Context timeouts.

```go
// Block until capacity is available
ctx := context.Background()
err := pool.Submit(ctx, job)

// Timeout after 5 seconds
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()
err := pool.Submit(ctx, job)
if err == adaptivepool.ErrTimeout {
    // Handle overload
}

// Return immediately if full
ctx, cancel := context.WithTimeout(context.Background(), 0)
defer cancel()
err := pool.Submit(ctx, job)
```

## Metrics

Access pool metrics for observability:

```go
metrics := pool.Metrics()

fmt.Printf("Queue Depth: %d\n", metrics.QueueDepth())
fmt.Printf("Active Workers: %d\n", metrics.ActiveWorkers())
fmt.Printf("Jobs Processed: %d\n", metrics.JobsProcessed())
fmt.Printf("Jobs Rejected: %d\n", metrics.JobsRejected())
fmt.Printf("Avg Latency: %v\n", metrics.AvgJobLatency())
```

## Graceful Shutdown

Shutting down the pool safely ensures that all in-flight jobs are completed (drained) before the program exits.

```go
// Shutdown with timeout
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()

if err := pool.Shutdown(ctx); err != nil {
    log.Printf("Shutdown error: %v", err)
}
```

**Shutdown behavior:**
1. Stops accepting new jobs (returns `ErrPoolShutdown`).
2. Drains in-flight jobs within the timeout.
3. Terminates all workers deterministically.
4. Returns an error if jobs were dropped due to timeout.
