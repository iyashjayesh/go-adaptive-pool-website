---
title: Benchmarks
description: Performance benchmarks and stress tests
---

## 1 Million RPS Stress Test

We performed an extreme pressure test (1M RPS target for 30s with 500KB tasks) to compare the adaptive pool against naive goroutine spawning.

| Metric | Naive (No Pool) | Adaptive Pool |
| :--- | :--- | :--- |
| **Peak RAM Usage** | **50.86 GB** | **1.41 GB** |
| **Average Latency** | **2,063 ms** | **161 ms** |
| **Peak Goroutines** | 104,473 | 5,002 |
| **Reliability** | Fails Under Load | Rock Solid |

**Why the Pool Wins:**
Under extreme load, the Naive approach causes a "Goroutine Explosion" and "Memory Bomb" that forces the Go runtime into constant Garbage Collection, leading to unusable 2-second latencies. The `go-adaptive-pool` shields your system by enforcing backpressure and resource caps.

**Run the comparison yourself:**
```bash
make run-comparison
```

## Micro-Benchmarks

Run standard micro-benchmarks:

```bash
cd benchmarks
go test -bench=. -benchmem -benchtime=10s
```

Sample micro-benchmark results:
```
BenchmarkPoolThroughput/workers=8-10     500000    2341 ns/op    128 B/op    3 allocs/op
BenchmarkAdaptivePool-10                 300000    3892 ns/op    256 B/op    5 allocs/op
BenchmarkNaiveGoroutines-10              200000    8234 ns/op    512 B/op   12 allocs/op
```
