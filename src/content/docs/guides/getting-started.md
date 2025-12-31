---
title: Installation and Quick Start
description: How to install and start using go-adaptive-pool
---

## Installation

```bash
go get github.com/iyashjayesh/go-adaptive-pool/adaptivepool
```

## Quick Start

Here is a simple example of how to create a pool and submit a job.

```go
package main

import (
    "context"
    "log"
    "time"

    "github.com/iyashjayesh/go-adaptive-pool/adaptivepool"
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
