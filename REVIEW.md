# Reviewer Handoff — Homepage Heist + Supersanity Engineer

State as of 2026-07-21 ~19:45Z. Everything below was built and live-proven in one working session by a Claude agent (Cowork). This doc is the entry point for an independent agent/human review.

## What exists

**1. supersanity-engineer skill** — full Sanity platform-engineer agent (SKILL.md + 15 reference files, ~5,500 lines) distilled from official Sanity MCP rules + 21 docs pages. Covers provisioning, schema, GROQ, App SDK, Functions/Blueprints, Next.js/visual editing/typegen, content rendering, Agent Actions/Canvas, limits/quotas, CDN/perspectives, a 12-item Provisioning Security Gate, and a living gotchas file.
- superskills: `skills/supersanity-engineer/` (main)
- Wrangler_: PR #472 (docs/knowledge/supersanity-engineer/, open at time of writing)
- Live proof: Sanity project `z849q2xq` + https://supersanity-demo-foundry.sanity.studio/

**2. homepage-heist kit + skill** — one command: URL → homepage recreated pixel-close as editable structured Sanity content + Next.js/Vercel frontend + retro live mission-feed dashboard (the feed is itself a `cloneRun` Sanity doc). v1.1 adds a code Studio with a Mission Control tool (animated feed + embedded clone iframe inside Studio). v1.2 adds the optimized seed protocol.
- Standalone: https://github.com/austinjgilbert/sanity-homepage-heist (public, main)
- superskills: `skills/homepage-heist/`
- Wrangler_: `docs/plays/homepage-heist/` on main (PR #478 merged); benchmark delta on branch `homepage-heist-kit`

**3. Two live benchmark runs**
| | Run 1 (sanity.io) | Run 2 (astro.build) |
|---|---|---|
| Wall time | ~48 min, 3 error detours | 32.9 min, 0 errors |
| Dashboard shareable | 14 min | 3.7 min |
| Sanity project | `afyg7bw1` | `oucql6nr` |
| Clone | (replaced by run 2) | https://minimal-deploy-two.vercel.app |
| Studio | heist-sanity-io.sanity.studio | heist-astro-build.sanity.studio |

Full data: BENCHMARK.md. Learnings 1–17 encoded in skill/SKILL.md.

## Architecture decisions to scrutinize

1. **Fidelity model:** sections store the source site's real HTML as templates with `{{slot}}` placeholders; editable values are structured `slots[]`; original CSS/fonts hotlinked. Trade-off taken: fidelity + editability over asset ownership. Consequence: clone visually depends on the source site keeping its CSS URLs alive. Alternative (not built): re-host assets via Sanity Media Library.
2. **Zero-dependency frontend:** plain `fetch` against the query API, 2.5s polling, published perspective. Deliberate: reliability of one-shot Vercel builds over Live Content API elegance. Review question: should v2 use Live Content API / visual editing (stega) instead?
3. **MCP-managed Studio vs code Studio duality:** quick demos use hosted MCP Studio; Mission Control flavor requires the code Studio (one-schema-source-of-truth rule). Is the duality documented clearly enough to prevent workspace divergence in others' hands?
4. **Progress ledger as Sanity content:** patch→publish pair per update (~2 calls each). Works; chatty. Alternative: mutate published doc directly via HTTP API with token — rejected to keep the flow token-free after provisioning.
5. **dangerouslySetInnerHTML:** scripts are stripped at capture and text slots are HTML-escaped at render, but source-site markup is trusted otherwise. Acceptable for demo tooling; NOT for user-generated content. Flag if this needs a sanitizer pass (DOMPurify) before broader distribution.

## Known gaps / risks (honest list)

- **Seed phase = 46% of wall time** (15.2 min run 2). v1.2 protocol (batched patches, no mid-run checks, direct-return probe) is written into the skill but NOT yet proven by a run-3. Projected ~20 min total.
- **Vercel token can't create projects** (403) — runs deploy into the existing `minimal-deploy` project, so each run replaces the previous clone's URL. Fix: dedicated `homepage-heist` Vercel project or a token with create rights.
- **Datasets are public** by design (published, already-public content). Gate exception is recorded per run, but a reviewer should confirm this stays demo-only.
- **JS-heavy/CSS-in-JS targets untested** (both runs hit link-CSS sites). Recon branch exists (inline-style capture into `globalCss`) but is unproven.
- **Cleanup owed:** throwaway Sanity projects `z849q2xq`, `afyg7bw1`, `oucql6nr`; Vercel `minimal-deploy` currently serves the astro.build clone.
- **In-Studio Mission Control not yet live-deployed** (code shipped, not exercised end-to-end with `sanity deploy`).

## Suggested review checklist

1. Clone the standalone repo; read skill/SKILL.md top to bottom — is the 12-step contract executable by a fresh agent with zero context?
2. Run the heist against a NEW target following only the skill (no session memory). Time it. Compare vs BENCHMARK.md; validate the v1.2 seed protocol claim.
3. Audit security: token handling (never persisted?), CORS entries per project, public-dataset exception, dangerouslySetInnerHTML posture.
4. Audit the supersanity-engineer corpus for accuracy drift vs current Sanity docs (it snapshots 2026-07-21).
5. Deploy the Mission Control Studio once and confirm the split-pane experience.
6. Decide: DOMPurify pass, Live Content API upgrade, asset re-hosting — worth v2?

## Everything in one table

| Artifact | Where |
|---|---|
| Standalone kit repo | github.com/austinjgilbert/sanity-homepage-heist (main) |
| Skills | superskills: skills/supersanity-engineer/, skills/homepage-heist/ |
| Wrangler_ | docs/plays/homepage-heist/ (main) · PR #472 (supersanity corpus) · branch homepage-heist-kit (benchmark+v1.2 delta) |
| Live demo (run 2) | minimal-deploy-two.vercel.app (+/dashboard) · heist-astro-build.sanity.studio |
| Benchmarks | BENCHMARK.md (this repo) |
| Installable skills | supersanity-engineer.skill, homepage-heist.skill (Cowork outputs) |
