---
title: Core Concepts
description: Understanding Backpressure, Metrics, and Shutdown
---

## Backpressure Handling

The pool enforces backpressure when the queue is full. You choose how long a caller may wait for space:

```go
// Block until capacity is available
err := pool.Submit(context.Background(), job)

// Wait at most 5 seconds for capacity
waitCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()
err := pool.SubmitTask(waitCtx, adaptivepool.Task{
    Context: context.Background(), // the job's own context, unaffected by waitCtx
    Run:     job,
})
if errors.Is(err, adaptivepool.ErrTimeout) {
    // Handle overload
}

// Don't wait at all if the queue is full
err := pool.TrySubmit(context.Background(), adaptivepool.Task{Run: job})
if errors.Is(err, adaptivepool.ErrQueueFull) {
    // Drop or handle overload
}
```

The context passed to `Submit` is also the context the job runs with, so a wait deadline on it would also cancel the job. Set `Task.Context` to keep the two apart.

A nil error means the task was queued. Otherwise the submit methods return:

| Error | When |
|---|---|
| `ErrNilJob` | `Run` is nil |
| `ErrPoolShutdown` | `Shutdown` has started |
| `ErrTimeout` | The submit context's deadline passed. It wraps `context.DeadlineExceeded` |
| `context.Canceled` | The submit context was cancelled |
| `ErrQueueFull` | `TrySubmit` only: the queue was full |

## Metrics

In-process metrics are always available, with no exporter configured:

```go
metrics := pool.Metrics()

fmt.Printf("Queue Depth: %d\n", metrics.QueueDepth())
fmt.Printf("Active / Busy Workers: %d / %d\n", metrics.ActiveWorkers(), metrics.BusyWorkers())
fmt.Printf("Jobs Processed / Failed: %d / %d\n", metrics.JobsProcessed(), metrics.JobsFailed())
fmt.Printf("Jobs Rejected / Dropped: %d / %d\n", metrics.JobsRejected(), metrics.JobsDropped())
fmt.Printf("Retries: %d\n", metrics.RetryAttempts())
fmt.Printf("Avg Latency / Queue Wait: %v / %v\n", metrics.AvgJobLatency(), metrics.AvgQueueWait())
```

To export metrics to Prometheus or OpenTelemetry, see [Observability](/go-adaptive-pool-website/guides/observability/).

## Graceful Shutdown

Shutting down the pool safely ensures that all in-flight jobs are completed (drained) before the program exits.

```go
// Shutdown with timeout
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()

if err := pool.Shutdown(ctx); err != nil {
    var se *adaptivepool.ShutdownError
    if errors.As(err, &se) {
        log.Printf("shutdown timed out, %d queued jobs dropped", se.Dropped)
    }
}
```

**Shutdown behavior:**
1. Stops accepting new jobs (returns `ErrPoolShutdown`)
2. Drains queued and in-flight jobs within the timeout
3. Terminates all workers deterministically
4. If the timeout expires, aborts retry waits, lets running jobs finish, and drops jobs still queued. Each dropped job is reported to `OnTaskDone` with status `shutdown`, and `Shutdown` returns a `*ShutdownError` with the count. It wraps the context's error, so `errors.Is(err, context.DeadlineExceeded)` still matches.

`Shutdown` can be called more than once: later calls return the first call's result.
