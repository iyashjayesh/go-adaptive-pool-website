---
title: Configuration
description: Configuration options for go-adaptive-pool
---

You can configure the pool using functional options passed to `adaptivepool.New()`.

```go
pool, err := adaptivepool.New(
    // Minimum workers (default: 1)
    adaptivepool.WithMinWorkers(4),
    
    // Maximum workers (default: runtime.NumCPU())
    adaptivepool.WithMaxWorkers(32),
    
    // Queue capacity (default: 1000)
    adaptivepool.WithQueueSize(5000),
    
    // Queue % to trigger scale-up (default: 0.7)
    adaptivepool.WithScaleUpThreshold(0.6),
    
    // Idle time before scale-down (default: 30s)
    adaptivepool.WithScaleDownIdleDuration(20*time.Second),
    
    // Cooldown between scaling operations (default: 5s)
    adaptivepool.WithScaleCooldown(3*time.Second),
    
    // Enable/disable metrics (default: true)
    adaptivepool.WithMetricsEnabled(true),
)
```
