---
title: Observability
description: Task identity, metrics exporters, structured logs and the OnTaskDone hook
---

## Task identity

Give tasks an ID and a kind so logs and metrics can tell them apart:

```go
pool.SubmitTask(ctx, adaptivepool.Task{
    ID:   "order-8812",  // unique: logs and OnTaskDone only
    Kind: "send_email",  // bounded: metric label
    Run:  sendEmail,
})
```

Keep the set of kinds small: each one becomes a metric label value.

## Exporting metrics

The core has no metrics dependency. Plug in a recorder with `WithRecorder`.

**Prometheus**

```bash
go get github.com/iyashjayesh/go-adaptive-pool/promrecorder
```

```go
reg := prometheus.NewRegistry()
pool, _ := adaptivepool.New(
    adaptivepool.WithName("orders"),
    adaptivepool.WithRecorder(promrecorder.New(reg)),
)
http.Handle("/metrics", promhttp.HandlerFor(reg, promhttp.HandlerOpts{}))
```

**OpenTelemetry**

```bash
go get github.com/iyashjayesh/go-adaptive-pool/otelrecorder
```

```go
pool, _ := adaptivepool.New(
    adaptivepool.WithName("orders"),
    adaptivepool.WithRecorder(otelrecorder.New(meterProvider)), // nil uses otel.GetMeterProvider()
)
```

Both report, per pool and task kind: active and busy workers, queue depth and wait, throughput, execution time, failures by status, rejections by reason, retries, and jobs dropped by a forced shutdown. Any other backend needs a five-method `Recorder`.

The [`examples/observability`](https://github.com/iyashjayesh/go-adaptive-pool/tree/main/examples/observability) directory has a ready-made Grafana dashboard.

## Structured logging

The pool logs through `log/slog` (default: `slog.Default()`). Failures are logged with `pool`, `task_id`, `kind`, `status`, `attempts`, `duration` and `err`:

```go
adaptivepool.WithLogger(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
```

## The `OnTaskDone` hook

`Submit` returns as soon as a task is queued. `WithOnTaskDone` tells you how it ended, and is called exactly once per executed task:

```go
pool, _ := adaptivepool.New(
    adaptivepool.WithOnTaskDone(func(r adaptivepool.TaskResult) {
        if r.Err != nil {
            deadLetters.Publish(r.ID, r.Kind, r.Status, r.Err) // hand off, don't block
        }
    }),
)
```

`TaskResult` contains `ID`, `Kind`, `QueueWait`, `Duration`, `Attempts`, `Status` and `Err`. The hook runs on the worker goroutine, so keep it fast. A panic inside it is recovered and logged.

A job dropped from the queue by a forced shutdown is also reported, with status `shutdown` and `Attempts` 0.

## Status reference

Every finished task has exactly one status, used in the `status` metric label, the log attribute and `TaskResult.Status`:

| Status | Meaning |
|---|---|
| `success` | The job returned nil (possibly after retries) |
| `error` | The job returned an error and retries are disabled |
| `panic` | The job panicked (never retried) |
| `retries_exhausted` | All allowed attempts failed |
| `budget_exceeded` | `MaxElapsedTime` would have been exceeded |
| `permanent` | The job returned a `Permanent` error |
| `canceled` | The job failed after its context was done |
| `shutdown` | A forced shutdown aborted retrying, or dropped the task from the queue before it ran |

For metric names, PromQL queries and custom recorders, see the [Retries and Observability guide](https://github.com/iyashjayesh/go-adaptive-pool/blob/main/docs/RETRY_AND_OBSERVABILITY.md#metrics).
