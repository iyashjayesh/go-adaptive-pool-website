---
title: Installation and Quick Start
description: How to install and start using go-adaptive-pool
---

## Installation


```bash
go get github.com/iyashjayesh/go-adaptive-pool
```

The core has no dependency on Prometheus or OpenTelemetry. The metrics adapters are separate modules; add the one you use:

```bash
go get github.com/iyashjayesh/go-adaptive-pool/promrecorder   # Prometheus
go get github.com/iyashjayesh/go-adaptive-pool/otelrecorder   # OpenTelemetry
```

## Quick Start

Here is a simple example of how to create a pool and submit a job.

```go
package main

import (
    "context"
    "log"
    "time"

    "github.com/iyashjayesh/go-adaptive-pool"
)

func main() {
    // creating pool
    pool, err := adaptivepool.New(
        adaptivepool.WithMinWorkers(4),
        adaptivepool.WithMaxWorkers(32),
        adaptivepool.WithQueueSize(1000),
    )
    if err != nil {
        log.Fatal(err)
    }
    defer pool.Shutdown(context.Background())

    // Submit job
    job := func(ctx context.Context) error {
        // Your work here
        time.Sleep(100 * time.Millisecond)
        return nil
    }

    if err := pool.Submit(context.Background(), job); err != nil {
        log.Printf("Failed to Submit: %v", err)
    }
}
```

## Next steps

- [Configuration](/go-adaptive-pool-website/guides/configuration/): every option and its default
- [Auto-Configuration](/go-adaptive-pool-website/guides/auto-configuration/): size the pool from a workload profile
- [Core Concepts](/go-adaptive-pool-website/guides/core-concepts/): backpressure, metrics and shutdown
- [Retries](/go-adaptive-pool-website/guides/retries/): retry failed jobs with backoff
- [Observability](/go-adaptive-pool-website/guides/observability/): task identity, metrics exporters, logs and the `OnTaskDone` hook
