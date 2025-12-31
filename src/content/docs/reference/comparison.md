---
title: Comparison
description: Comparison with other Go worker pool libraries
---

| Feature | go-adaptive-pool | ants | pond | errgroup |
|---------|-----------------|------|------|----------|
| Adaptive Scaling | Yes | No | Yes | No |
| Explicit Backpressure | Yes | Partial | Partial | No |
| Prometheus Metrics | Yes | No | No | No |
| Graceful Shutdown | Yes | Yes | Yes | Yes |
| Context Support | Yes | Partial | Yes | Yes |
| Zero Global State | Yes | No | Yes | Yes |
