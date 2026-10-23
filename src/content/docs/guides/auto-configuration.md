---
title: Auto-Configuration
description: Size the pool from a workload profile and the resources available to the process
---

Auto-configuration (added in v0.2.0) sets min and max workers, queue size and the scale-up threshold for you, from a workload profile and the resources available to the process.

## Workload profiles

```go
pool, err := adaptivepool.New(
    adaptivepool.WithAutoConfig(adaptivepool.ProfileAPIServer),
)
```

| Profile | Use case | Min workers | Max workers | Queue size | Scale-up threshold |
|---|---|---|---|---|---|
| `ProfileAPIServer` | I/O-bound API servers | 2x CPUs | 10x CPUs | 20x max workers | 0.6 |
| `ProfileCPUIntensive` | CPU-bound tasks | 1x CPUs | 2x CPUs | 5x max workers | 0.8 |
| `ProfileBatchProcessor` | Batch processing | 2x CPUs | 4x CPUs | 50x max workers | 0.7 |

CPUs are counted with `GOMAXPROCS`, which follows container CPU limits on Linux: a pod limited to 2 CPUs is sized for 2, not for every core on the node.

## System-aware configuration

For more control, describe the workload instead of picking a profile:

```go
pool, err := adaptivepool.New(
    adaptivepool.WithSystemAwareConfig(adaptivepool.SystemAwareConfig{
        WorkloadType:       adaptivepool.IOBound, // or CPUBound, Mixed
        TargetLatencyMs:    200,
        AvgJobMemoryBytes:  50 * 1024, // memory held by one queued job
        MemoryLimitPercent: 0.2,       // queue may use 20% of the memory limit
    }),
)
```

| Workload type | Min workers | Max workers | Default queue size | Scale-up threshold |
|---|---|---|---|---|
| `IOBound` | 2x CPUs | 8x CPUs | 20x max workers | 0.6 |
| `CPUBound` | 1x CPUs | 2x CPUs | 5x max workers | 0.8 |
| `Mixed` | 1x CPUs | 4x CPUs | 10x max workers | 0.7 |

- **Latency target:** below 100ms lowers the scale-up threshold to 0.5, and below 500ms to 0.6, so workers are added sooner.
- **Memory:** with `AvgJobMemoryBytes` set, the queue holds as many jobs as fit in `MemoryLimitPercent` of the process memory limit (default 0.2), kept between 5x and 100x max workers. The limit is `GOMEMLIMIT` when set, otherwise the container's cgroup memory limit on Linux. Without either, the default queue size above is used.

## Overriding values

Auto-config only sets base values. Explicit options override them, wherever they appear in the list:

```go
pool, err := adaptivepool.New(
    adaptivepool.WithAutoConfig(adaptivepool.ProfileAPIServer),
    adaptivepool.WithQueueSize(5000),
)
```

The overridden values still have to be valid together: for example, `WithMinWorkers` can't exceed the profile's max workers, or `New` returns an error wrapping `ErrInvalidConfig`.

If you pass both `WithAutoConfig` and `WithSystemAwareConfig`, the last one wins.

## Seeing what was chosen

The pool logs the final values once at startup, after your overrides:

```
level=INFO msg="auto-config applied" min_workers=4 max_workers=20 queue_size=400 scale_up_threshold=0.6
```

To inspect the values without creating a pool, use `SuggestConfig`:

```go
c := adaptivepool.SuggestConfig(adaptivepool.IOBound)
fmt.Println(c.MinWorkers(), c.MaxWorkers(), c.QueueSize())
```

See [`examples/autoconfig`](https://github.com/iyashjayesh/go-adaptive-pool/tree/main/examples/autoconfig) for a runnable example.
