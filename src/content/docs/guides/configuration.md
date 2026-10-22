---
title: Configuration
description: Configuration options for go-adaptive-pool
---


You can configure the pool using functional options passed to `adaptivepool.New()`. The most important options are:

```go
pool, err := adaptivepool.New(
    // Minimum workers (default: 1)
    adaptivepool.WithMinWorkers(4),

    // Maximum workers (default: runtime.NumCPU())
    adaptivepool.WithMaxWorkers(32),

    // Queue capacity (default: 1000)
    adaptivepool.WithQueueSize(5000),

    // Queue utilization % to trigger scale-up (default: 0.7)
    adaptivepool.WithScaleUpThreshold(0.6),

    // Idle time before scale-down (default: 30s)
    adaptivepool.WithScaleDownIdleDuration(20*time.Second),

    // Cooldown between scaling operations (default: 5s)
    adaptivepool.WithScaleCooldown(3*time.Second),

    // Name attached to logs and metrics (default: "")
    adaptivepool.WithName("orders"),

    // Export metrics: promrecorder, otelrecorder or your own (default: none)
    adaptivepool.WithRecorder(promrecorder.New(prometheus.DefaultRegisterer)),

    // Structured logger (default: slog.Default())
    adaptivepool.WithLogger(slog.New(slog.NewJSONHandler(os.Stdout, nil))),

    // Called once per finished task (default: none)
    adaptivepool.WithOnTaskDone(func(r adaptivepool.TaskResult) { /* ... */ }),

    // Retry failed jobs (default: disabled)
    adaptivepool.WithRetry(adaptivepool.RetryPolicy{MaxAttempts: 3}),
)
```

In-process metrics (`pool.Metrics()`) are always on. `WithMetricsEnabled` is deprecated and does nothing; to export metrics, pass a recorder with `WithRecorder`. See [Observability](/go-adaptive-pool-website/guides/observability/).

An invalid configuration makes `New` return an error wrapping `ErrInvalidConfig`.
