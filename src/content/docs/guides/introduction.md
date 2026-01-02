---
title: Introduction
description: Overview of go-adaptive-pool
---


**go-adaptive-pool** is a bounded worker pool for Go with an adaptive worker lifecycle and explicit backpressure, designed to keep systems stable under bursty load.

The goal is not to maximize throughput at all costs, but to prevent unbounded goroutine growth, avoid OOMs, and force overload to be handled explicitly instead of crashing later.

## What does it do?

This pool focuses on controlling concurrency and memory usage when job submission can outpace processing. It provides:

- **Bounded concurrency** via a fixed-size queue
- **Adaptive worker lifecycle**: Workers scale up and down based on queue pressure
- **Explicit backpressure**: When the queue is full, submissions block or fail fast
- **Observability**: Built-in Prometheus metrics
- **Safe shutdown**: Graceful draining and no goroutine leaks

## Key Features

- **Bounded Queue**: Fixed queue size prevents unbounded memory growth and protects your system.
- **Adaptive Worker Lifecycle**: Workers scale up and down automatically based on queue utilization, within configured limits.
- **Explicit Backpressure**: When overloaded, submissions block or are rejected. The caller must handle it.
- **Prometheus Metrics**: Built-in observability for queue depth, throughput, latency, and more.
- **Safe Shutdown**: Graceful draining of queued jobs and clean worker shutdown with no leaks.
- **Zero Global State**: Create multiple pool instances with isolated metrics and configuration.
