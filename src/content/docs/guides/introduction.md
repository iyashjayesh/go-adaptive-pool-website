---
title: Introduction
description: Overview of go-adaptive-pool
---

**go-adaptive-pool** is a production-grade adaptive worker pool for Go that handles dynamic scaling, backpressure, metrics, and safe shutdown under load. It's built to keep your system stable when traffic spikes by not letting goroutines grow out of control.

## Features

- **Bounded Concurrency**: Fixed queue size prevents unbounded memory growth.
- **Explicit Backpressure**: Context-aware blocking when queue is full.
- **Adaptive Scaling**: Workers scale up/down based on queue utilization.
- **Safe Shutdown**: Graceful draining with deterministic worker cleanup.
- **Prometheus Metrics**: Built-in observability for queue depth, throughput, and latency.
- **Zero Global State**: Multiple pool instances with isolated metrics.
- **Production Ready**: Comprehensive tests with race detector and goroutine leak detection.
