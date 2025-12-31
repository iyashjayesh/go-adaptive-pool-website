---
title: Examples
description: Common usage examples
---

## HTTP Server with Backpressure

See [examples/http_server](https://github.com/iyashjayesh/go-adaptive-pool/tree/main/examples/http_server/main.go) for a complete HTTP server that:
- Processes background jobs via the pool
- Returns 503 when overloaded
- Exposes metrics endpoint
- Handles graceful shutdown

```bash
cd examples/http_server
go run main.go
```

## Batch Processing

See [examples/batch_processor](https://github.com/iyashjayesh/go-adaptive-pool/tree/main/examples/batch_processor/main.go) for processing large batches with:
- Adaptive worker scaling
- Real-time progress tracking
- Throughput metrics

```bash
cd examples/batch_processor
go run main.go
```
