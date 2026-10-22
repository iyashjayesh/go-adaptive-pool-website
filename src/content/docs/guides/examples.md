---
title: Examples
description: Common usage examples
---

## HTTP Server with Backpressure


See [`examples/http_server`](https://github.com/iyashjayesh/go-adaptive-pool/tree/main/examples/http_server/main.go) for a complete HTTP server that:
- Processes background jobs via the pool
- Returns 503 when overloaded
- Exposes metrics endpoint
- Handles graceful shutdown

```bash
cd examples/http_server
go run main.go
```

## Batch Processing


See [`examples/batch_processor`](https://github.com/iyashjayesh/go-adaptive-pool/tree/main/examples/batch_processor/main.go) for processing large batches with:
- Adaptive worker scaling
- Real-time progress tracking
- Throughput metrics

```bash
cd examples/batch_processor
go run main.go
```

## Observability with Prometheus and Grafana

See [`examples/observability`](https://github.com/iyashjayesh/go-adaptive-pool/tree/main/examples/observability) for two pools exporting metrics through `promrecorder`, with a Prometheus and Grafana stack and a provisioned dashboard:
- Bursty synthetic load with retries, `Permanent` errors and `RetryAfter` hints
- Per-kind throughput, failures by status, latency and queue wait
- Rejections from request-scoped and best-effort work on a second, smaller pool

```bash
# From the repo root: start the app (metrics on :2112/metrics)
make run-observability

# Then start Prometheus (:9090) and Grafana (:3000)
cd examples/observability && docker compose up
```
