---
title: How to Size Your Worker Pool Queue (Without Guessing)
description: A practical guide to tuning queue sizes based on latency, traffic patterns, and real production lessons learned the hard way.
---

So you've built a worker pool (or maybe your using something like go-adaptive-pool), and now your staring at the configuration wondering... "what the hell should my queue size be?"

I get this question alot. And honestly, there's no magic number that works everywhere. But there IS a methodical way to think about it that'll save you from some painful production incidents.

Let me break down what I've learned after tuning these things in real systems.

## The Problem Nobody Talks About

Most tutorials just say "set it to 1000" or "base it on your RAM". But that's like someone telling you to "just add salt" without ever tasting the food first.

Your queue size directly impacts two things that are constantly fighting eachother:
1. **How fast you reject overload** (latency)
2. **How many requests you buffer during spikes** (throughput)

Get it wrong, and your either rejecting healthy traffic or drowning in a backlog that takes forever to drain.

## Start With This (Then Tune It)

I usually start with this simple formula:

```
QueueSize = MaxWorkers × (10 to 20)
```

Why? It gives you enough headroom to handle temporary bursts without going totally overboard. Got 32 workers? Start with a queue of 320-640.

But here's the important part - **this is just your baseline**. The real work starts when you tune based on actual behavior in production.

## Two Schools of Thought

### The "Buffer Everything" Approach (Large Queue)

Some folks like big queues - think 5000 or even 10,000. Their logic:

- Traffic comes in waves, not steady streams
- Better to queue requests than reject them
- System gets time to "catch up" after spikes

**When this works:** E-commerce flash sales, batch processing, background jobs where latency doesn't matter much.

**When this backfires:** Queue fills up during sustained overload. Requests that got accepted 5 minutes ago are now timing out. Users stare at loading spinners for 2-3 minutes before finally seeing an error. Terrible experience.

### The "Fail Fast" Approach (Small Queue)

Other people prefer smaller queues - usually 100-500 range. Their thinking:

- If we're overloaded, tell clients IMMEDIATELY
- Don't give false hope by accepting work we can't actually handle
- Let upstream systems (load balancers, retry mechanisms) deal with redistribution

**When this works:** Real-time APIs, user-facing services, anything where every millisecond of latency matters.

**When this backfires:** Temporary spikes (like cache warming after deployment) cause unnecessary rejections when you could've just buffered for 10-15 seconds and handled everything fine.

## My Real Production Strategy

Here's what I actually do in live systems (learned through painful trial and error):

### Step 1: Start Conservative
```go
pool, _ := adaptivepool.New(
    adaptivepool.WithMaxWorkers(32),
    adaptivepool.WithQueueSize(500), // About 15x workers
    adaptivepool.WithMetricsEnabled(true),
)
```

Not too aggressive, not too timid. This gives me a solid baseline to work from.

### Step 2: Watch These Two Metrics Like a Hawk

After deploying, I'm obsessively checking:

1. **`AvgJobLatency`** - Is it creeping up over time? Queue might be too large.
2. **`JobsRejected`** - Are we rejecting legitimate traffic? Queue might be too small.

Real example: Last month we were rejecting 5% of requests during morning peak hours. I bumped the queue from 500 → 1200. Rejections dropped to 0.3% and latency stayed under 200ms. Problem solved.

### Step 3: Load Test The Scary Scenarios

Don't just test normal traffic. Test the stuff that'll wake you up at 3am:

- **Sustained overload** - Run at 2x capacity for 10+ minutes
- **Sudden spikes** - Go from 0 → 10k RPS in 5 seconds
- **Downstream failures** - What happens when your database starts taking 5s per query instead of 100ms?

One time we had queue size set to 2000. During a database slowdown, our p99 latency went from 300ms → 45 seconds. Why? We were accepting work we had no chance of finishing in reasonable time.

We shrunk the queue to 800. Now failures happen in 2 seconds instead of 45. Users get errors faster, which is way better than making them wait almost a minute.

## The Mental Model That Changed Everything For Me

Here's what finally made it click:

**Your queue is a shock absorber, not a parking lot.**

It should handle temporary bumps in the road - traffic spikes, brief system hiccups. But if there's a permanent pothole (sustained overload), no shock absorber will save you. You need to fix the actual road by adding more capacity.

### Signs Your Using The Queue As A Parking Lot (Bad):
- Queue depth consistently sits at 70%+ full
- Jobs regularly wait multiple seconds
- Memory usage climbing steadily over time

### Signs Your Queue Is Working Right (Good):
- Queue depth fluctuates naturally (20% → 80% → 30%)
- Quick recovery after spikes (under 60 seconds)
- Rejections only happen during extreme anomalies

## But What About RAM Though?

Yeah, memory matters. But it's usually not the constraint people think it is.

Quick math: If each job struct is around 1KB, a queue of 5000 jobs = 5MB. That's basically nothing. Even at 10KB per job, your only using 50MB.

**The Exception:** If your queueing actual data payloads (image uploads, file processing, video encoding), then yes, RAM becomes a real constraint. In those cases:
- Queue pointers or references, not the full data
- Use an external queue system (Redis, RabbitMQ, SQS)
- Keep queue size much smaller

## My Cheat Sheet For Different Use Cases

Here's what I typically reach for:

**API Gateway / Load Balancer:**
- Queue: 100-300 (fail fast)
- Why: Users are literally waiting for responses, every millisecond matters

**Background Job Processor:**
- Queue: 2000-5000 (buffer generously)
- Why: Jobs aren't time-sensitive, throughput matters more than latency

**Real-time Analytics Pipeline:**
- Queue: 500-1000 (middle ground)
- Why: Some buffering is fine, but can't fall too far behind real-time

**Image/Video Processing:**
- Queue: 50-200 (small, RAM-constrained)
- Why: Each job eats significant memory, can't queue too many

## The Continuous Tuning Loop

After picking an initial size, you gotta keep iterating:

1. Deploy with conservative settings
2. Monitor for 1-2 days (catch daily traffic patterns)
3. Check p50, p95, p99 latency percentiles
4. Look at rejection rates during peak hours
5. Adjust in 20-30% increments (not huge jumps)
6. Repeat until it feels right

Don't change everything at once, or you wont know what actually helped.

## Mistakes I've Made (So You Don't Have To)

### Mistake #1: Setting Queue = 10,000 "Just To Be Safe"
**Result:** During an overload incident, requests took 3+ minutes to fail. Customer support got absolutely hammered with angry users. Not fun.

### Mistake #2: Setting Queue = 50 "For Predictable Latency"
**Result:** Rejected 15% of totally legitimate traffic during normal daily peak hours. Business team was not happy.

### Mistake #3: Never Revisiting The Config
**Result:** Traffic grew 3x over 6 months. Queue settings that worked initially became completely wrong for current load patterns.

## Comparison Table

| Scenario | Queue Size | Trade-off |
| :--- | :--- | :--- |
| Bursty Traffic | 1000-5000 | Smooth spikes, risk of long latency |
| Sustained Load | 100-500 | Fast failures, more rejections |
| Background Jobs | 2000-5000 | High throughput, latency doesn't matter |
| Real-time APIs | 300-800 | Balanced approach for user-facing work |

## Final Thoughts

"It depends" is the most frustrating answer, I know. But the right queue size genuinely depends on:
- Your latency SLOs
- Your traffic patterns (bursty vs steady)
- Your tolerance for rejections
- How your downstream dependencies behave under load

There's no universal magic number. But now you've got a framework to find YOUR number systematically.

Start with `MaxWorkers × 15`, monitor it obsessively for a few days, and tune based on what the metrics are telling you. Your future self (and your on-call teammates) will thank you when things stay stable under load.

---

Got specific questions about your setup? Always happy to discuss worker pool tuning and performance optimization.

**P.S.** - If your constantly fighting queue sizing problems, it might be time to look at horizontal scaling or implementing better load shedding strategies upstream. Sometimes the best queue size is "no queue" because you've got enough raw capacity to handle everything.

Check out the project: [go-adaptive-pool](https://github.com/iyashjayesh/go-adaptive-pool)