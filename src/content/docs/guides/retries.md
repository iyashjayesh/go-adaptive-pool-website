---
title: Retries
description: Retry failed jobs with backoff, jitter and time budgets
---

Retries are enabled per pool with a reusable policy:

```go
pool, err := adaptivepool.New(
    adaptivepool.WithRetry(adaptivepool.RetryPolicy{
        MaxAttempts:    5,
        Backoff:        adaptivepool.ExponentialBackoff{Base: 100 * time.Millisecond},
        MaxDelay:       2 * time.Second,
        MaxElapsedTime: 10 * time.Second,
        Jitter:         true,
    }),
)
```

## How it works

- A failed job is retried **on the same worker**: it waits, then runs again. Nothing is re-queued and no goroutines or timers are left behind.
- A retrying job keeps its worker busy, so retries consume pool capacity. Bound them with `MaxAttempts`, `MaxDelay` and `MaxElapsedTime`.
- **Every error is retried by default.** The exceptions are errors wrapped with `Permanent`, a done job context, and panics, which are never retried.
- Only retry jobs that are **idempotent**: an attempt may have partly succeeded before it failed.

## Policy options

| Option | Meaning |
|---|---|
| `MaxAttempts` | Required. Total runs, including the first |
| `Backoff` | Wait before each retry: `ConstantBackoff`, `LinearBackoff` or `ExponentialBackoff` (the default: 100ms base, ×1.5), or your own `Next(retry int) time.Duration` |
| `MaxDelay` | Caps any single wait, including `RetryAfter` hints |
| `Jitter` | Full jitter: each wait is drawn from `[0, delay)`, so jobs that failed together don't retry in lockstep |
| `MaxElapsedTime` | Total time budget for one job. Retrying stops as soon as the next wait would exceed it |
| `ErrorLimits` | Fewer attempts for specific errors, matched with `errors.Is` |

## Controlling retries from the job

```go
func chargeCard(ctx context.Context) error {
    if err := validate(req); err != nil {
        return adaptivepool.Permanent(err) // invalid input: never retried
    }
    resp, err := gateway.Charge(ctx, req)
    if err != nil {
        return err // network errors: retried with backoff
    }
    if resp.RateLimited {
        // Wait exactly this long before the next attempt (still capped by MaxDelay)
        return adaptivepool.RetryAfter(errRateLimited, resp.RetryAfter)
    }
    return nil
}
```

If the job's context is cancelled, retrying stops immediately and a backoff wait ends at once.

## Why retrying stopped

When a job gives up, its error is a `*RetryError`. `errors.Is` matches both the stop reason and the job's last error:

| Reason | Status |
|---|---|
| `ErrRetriesExhausted` | `retries_exhausted` |
| `ErrRetryBudgetExceeded` | `budget_exceeded` |
| `ErrPermanentFailure` | `permanent` |
| `context.Canceled` / `context.DeadlineExceeded` | `canceled` |
| `ErrPoolShutdown` | `shutdown` (a forced shutdown aborted the wait) |

The status appears in logs, metrics and the `OnTaskDone` hook. See [Observability](/go-adaptive-pool-website/guides/observability/).

For every option with its use case, see the [Retries and Observability guide](https://github.com/iyashjayesh/go-adaptive-pool/blob/main/docs/RETRY_AND_OBSERVABILITY.md#retries).
