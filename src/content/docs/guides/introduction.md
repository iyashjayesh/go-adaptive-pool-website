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
- **Observability**: Vendor-agnostic metrics (Prometheus and OpenTelemetry recorders included), structured `slog` logs and an `OnTaskDone` hook
- **Retries**: Inline retries with pluggable backoff, jitter and time budgets
- **Safe shutdown**: Graceful draining, no goroutine leaks, and every dropped job reported

## Key Features

- **Bounded Queue**: Fixed queue size prevents unbounded memory growth and protects your system.
- **Adaptive Worker Lifecycle**: Workers scale up and down automatically based on queue utilization, within configured limits.
- **Explicit Backpressure**: When overloaded, submissions block or are rejected. The caller must handle it.
- **Pluggable Metrics**: Queue depth, throughput, latency and failures by reason, exported to Prometheus, OpenTelemetry or your own backend.
- **Retries with Backoff**: Inline retries with constant, linear or exponential backoff, jitter, time budgets and permanent errors.
- **Task Outcomes**: Tag tasks with an ID and kind, and get a callback with the final status of every task.
- **Safe Shutdown**: Graceful draining, clean worker shutdown with no leaks, and a report of any job a forced shutdown drops.
- **Zero Global State**: Create multiple pool instances with isolated metrics and configuration.
