# Heist Benchmark — Run 1 vs Run 2

Two live end-to-end runs, same operator (Claude in Cowork), same kit. Run 2 applied the 10 field learnings captured from run 1. Timestamps are real tool-clock times (a run-1 lesson: run 1's dashboard log used estimated timestamps; run 2 pulled `date -u` at phase boundaries).

| | **Run 1 — sanity.io** (2026-07-21 ~17:02–17:50Z) | **Run 2 — astro.build** (18:50:54–19:23:48Z) | Δ |
|---|---|---|---|
| **Total wall time** | ~48 min | **32.9 min** | **−31%** |
| **Errors / detours** | 3 (Vercel 403 ×2, CORS miss on render, over-pruned nav) | **0** | −3 |
| **Time to shareable dashboard** | ~14 min | **~3.7 min** | **−74%** |
| Provision block (project+schema+CORS+feed+studio) | ~4 min, 6 sequential calls | 1.6 min, 2 batched blocks | −60% |
| Vercel deploy | serial, after CORS detour | launched in parallel with scrape; build 37s | overlapped |
| Scrape recon calls | 4 | **1** | −75% |
| Section extraction JS calls | 7 (incl. 2 fix iterations) | **2** | −71% |
| Sections / slots captured | 6 / 27 (103KB) | 8 / 27 (75.5KB; hero pruned 73→21KB) | more sections, leaner |
| Seed phase | 18.3 min, 45 tool calls, transfer recipe discovered by trial | 15.2 min, 39 calls, recipe given upfront, 0 retries | −17% |
| Render verify | FAILED first try (CORS), +4 min fix loop | **passed first try** | ✔ |
| Edit-proof latency (publish → live) | ~5s | **≤3s** | −40% |
| Placeholder integrity check | not run | placeholders == slots, 8/8 | new gate |

## Where the 33 minutes go now (run 2 profile)

1. Provision block — 1.6 min (near floor; Sanity API latency)
2. Vercel deploy — 0 net (parallel with scrape)
3. Scrape + segment — ~12 min wall (2 JS calls; most of this is agent payload assembly, not the browser)
4. **Seed — 15.2 min (46% of total; the bottleneck)**
5. Verify + edit proof + complete — ~2.5 min

## Next optimizations (targeted at seed, in priority order)

1. **Batch 2–3 sections per patch call** (all fit; largest pair ~37KB) → est. −5 min
2. **Drop per-section mid-run length checks** (keep only the final integrity query) → est. −3 min
3. **Skip the `<pre>`/get_page_text channel when templates are filter-safe** (probe one section via direct return first; only fall back to the escape channel on block) → est. −2 min
4. Pre-warm: keep a standing `heist-template` Vercel project so frontend deploy is a config write, not a full build.

Projected run 3: **~20 min total, ~8 min seed.**

## Run-2-only learnings (now in SKILL.md)

- Escape RAW field values (not the JSON.stringify blob) when using the `<pre>` transfer channel — double-encoding corrupts `\n`.
- Stash the page body once and restore once (not per section) — saves a round-trip per section.
- Harden multi-space runs against text-extraction whitespace collapsing (code blocks).
- Real timestamps only on the mission feed — `date -u` at phase boundaries; estimated times destroy benchmark value.
- Watch for `` (DEL) separators and HTML entities inside `data-*` attributes; preserve byte-exact.
