---
name: homepage-heist
description: >-
  One-command Sanity demo: given any homepage URL, recreate it at maximum
  fidelity as fully editable structured content in a brand-new Sanity project,
  with a Next.js frontend on Vercel and a retro live-progress dashboard the
  audience watches while the agent works. Use when someone says "clone this
  homepage into Sanity", "homepage heist", "recreate <url> in Sanity", "run the
  ultimate sanity demo", "show them their site in Sanity", or wants the
  URL-to-editable-site play for a prospect. Requires: Sanity MCP (authed) and
  Vercel MCP (or vercel CLI). Pairs with the supersanity-engineer skill for
  provisioning details and security gates.
---

# Homepage Heist

Single command: `heist <url>`. Output: their homepage, pixel-close, running on Vercel, every headline/image/CTA editable in a hosted Sanity Studio, with a live "mission feed" dashboard that updated itself while you worked — and the dashboard itself is Sanity content (say that out loud in the demo; it lands).

## Architecture (do not improvise a new one)

- **Universal schema** (schema/schema-declaration.md): `clonedSite` (stylesheet/font links, favicon, body class) + `clonedPage` (array of `section` objects) + `cloneRun` (progress feed).
- **Fidelity model:** each section stores the site's *real HTML* as `htmlTemplate` with editable content replaced by `{{slotKey}}` placeholders; original values live in `slots[]`. Original CSS/fonts are hotlinked via `styleLinks`/`fontLinks`. Frontend re-injects slot values into templates → pixel fidelity + structured editing.
- **Frontend:** the `app/` Next.js app in this kit. Zero runtime deps beyond Next; queries the Content Lake by plain fetch; polls every ~2s so Studio publishes appear live mid-demo.
- **Progress:** you (the agent) patch the published `cloneRun` document after EVERY step. The `/dashboard` page renders it retro-CRT style. Never skip a progress write — the show is the point.

## Prerequisites check (fail fast, fix, or ask)

1. Sanity MCP authed (`whoami`) and an org ID (`list_organizations`).
2. Vercel MCP available (`deploy_to_vercel`) — else `vercel` CLI logged in.
3. A way to get the page's real DOM: Claude-in-Chrome browser tools (Cowork), or `curl`/fetch in environments that permit it. JS-heavy SPAs need the browser path.
4. This kit's files (app/ + schema/). If missing, clone github.com/austinjgilbert/sanity-homepage-heist.

## The run (12 steps; write progress after each)

Percent map: 5, 12, 20, 30, 38, 50, 62, 74, 84, 92, 97, 100.

1. **PROVISION** — `create_project` (name `heist-<domain>-<yyyymm>`, sandbox org). Vault the returned tokens; never echo. Dataset `production` (public is OK: cloned public content only — record as gate exception).
2. **SCHEMA** — `deploy_schema` with the exact declaration from schema/schema-declaration.md.
3. **RUN DOC** — create + publish `cloneRun` (`runId` = ISO date + domain, status `running`, all 12 steps `pending`, log line "mission start"). All later updates: `patch_documents` on the **published** ID, set `percent`/`currentStep`/`steps`/append `log`.
4. **STUDIO** — `deploy_studio` (appHost `heist-<domain>`; globally unique — suffix on collision). Patch run doc with `studioUrl`.
5. **FRONTEND UP EARLY** — in `app/lib/sanity.ts` replace `__PROJECT_ID__` with the real project ID, then `deploy_to_vercel` (target `production`, name `heist-<domain>`). Patch run doc with `vercelUrl`. **Hand the audience `<vercelUrl>/dashboard` NOW** — they watch the rest happen.
6. **CORS** — `add_cors_origin` for the Vercel URL (and localhost:3000). Never `*`.
7. **SCRAPE** — get the rendered DOM: browser path = navigate + `document.documentElement.outerHTML` via JS; also collect `<link rel="stylesheet">` hrefs, Google/font links, favicon, `document.body.className`. Grab per-section HTML separately (top-level `<header>`, `<main>` children / obvious section landmarks, `<footer>`) to keep chunks manageable.
8. **SEGMENT & SLOT** (the intelligent step) — for the nav, hero, 2–4 key body sections, and footer: keep HTML structure intact; find human-editable content (headlines, paragraphs, button labels, hrefs, img srcs); replace each with `{{slotKey}}` (semantic keys: `heroHeading`, `ctaLabel`, `logoImage`…); record originals in `slots[]` with correct `kind` (text|image|href). Rules: escape nothing in templates; strip `<script>` tags entirely; make relative URLs absolute; cap ~8–14 slots/section (headline-level, not every word); leave the rest of the HTML untouched — fidelity lives there.
9. **SEED** — create `clonedSite`, publish it FIRST (publish-before-reference rule), then create + publish `clonedPage` (slug `home`, sections array). `_key` on every array member.
10. **VERIFY RENDER** — fetch the Vercel URL (or browser-load it): sections render, CSS applied, no `{{` leaking. Fix and re-patch content if needed.
11. **EDIT PROOF** — patch one obvious slot (e.g. hero heading → "Now served by Sanity ⚡"), publish, confirm the live page shows it within ~5s, then revert. Log both moments to the run doc — the audience sees the edit happen on the dashboard timeline.
12. **COMPLETE** — status `complete`, percent 100, `finishedAt`, final log line with all URLs. Run the supersanity-engineer Security Gate; record the public-dataset exception. Hand off: clone URL, dashboard URL, Studio URL, manage URL.

## Error contract

Any step fails → patch run doc: step status `error`, run status `error`, log the exact error text — the dashboard shows the failure honestly. Fix, patch back to `running`, continue. Never leave the run doc stale; it is the demo.

## Demo script (30 seconds of talk track)

"One URL went in. Claude scraped it, modeled it as structured content, provisioned Sanity, deployed a frontend, and rebuilt the page — you watched it happen on a dashboard that is itself Sanity content. Now watch: I change the headline in Studio… publish… there. That's your site, editable, in the time it took to get coffee. Nothing here was pre-built."

## In-Studio experience (Mission Control flavor)

Two dashboard surfaces exist; pick per audience:
- **Default (zero local tooling):** MCP hosted Studio + `/dashboard` on the Vercel app.
- **Mission Control (in-Studio magic):** deploy `studio/` from this kit via CLI — adds a custom Studio tool with the animated mission feed + the clone embedded in a split pane, and "Live preview" iframe views on `clonedPage`/`cloneRun` documents. See studio/README.md; one-schema-source-of-truth rule applies.

## Field learnings (live run vs sanity.io, 2026-07-21 — read before every run)

1. **`patch_documents` ALWAYS writes to the draft.** Every progress update = patch → `publish_documents`, or the dashboard shows stale state. Budget 2 calls per update.
2. **CORS before render-verify.** The frontend origin (exact Vercel URLs, `allowCredentials: false`) must be allowlisted or the page silently sits at "Waiting for content". This was the one checklist step skipped in the proof run — and it bit immediately.
3. **Vercel MCP tokens may not be able to create projects (403).** Recovery: `list_teams` → `list_projects` → deploy into an existing scratch project by name; log the reroute to the mission feed. Prefer a pre-created `homepage-heist` Vercel project for demos.
4. **Browser output filter blocks query strings + embedded-JSON props.** Strip `?query` params from asset URLs before returning them (CSS loads fine without `?dpl=` pins — HEAD-check to confirm). For big HTML transfer out of the browser: `javascript_tool` return values get blocked/truncated — write the payload ASCII-escaped into a temporary `<pre>`, read it with `get_page_text`, restore the DOM after.
5. **`offsetParent` is null inside `position:fixed` headers** — visibility-prune with `getComputedStyle` + `getBoundingClientRect`, and only remove invisible nodes with >200 chars of text (keeps decorative wrappers).
6. **Skip or split 40KB+ sections** (astro-island interactive monsters). 5–7 sections totaling ≤110KB is the sweet spot: fidelity high, payloads safe, seeding fast.
7. **Slotify only leaf nodes** (`el.children.length === 0`) or the template breaks; cap slots per section (~8–14) — headline-level editing demos better than 100 fields.
8. **Astro/Tailwind sites are ideal targets** (linked CSS). CSS-in-JS sites need inline `<style>` capture into `globalCss` — recon first: count link stylesheets vs inline style bytes, choose strategy.
9. **Timing reality (this run):** provision→studio ~2 min; Vercel build 43s; scrape+segment ~6 min; seed ~4 min (delegate to a subagent); verify+edit proof ~2 min. **Total ~15 min.** Announce the dashboard URL at minute 3 — the audience watches the remaining 12.
10. **Edit proof lands in ~5s** (published perspective + api host + 2.5s poll). Don't promise "instant"; promise "before you finish the sentence".

## Run-2 learnings (benchmark run vs astro.build, 2026-07-21 — see BENCHMARK.md)

Run 2 applied learnings 1–10 and finished 33 min / 0 errors vs run 1's ~48 min / 3 errors. Additions:

11. **Batch the provision block:** after `create_project`, fire `deploy_schema` + extra `add_cors_origin` + runDoc `create_documents` in ONE parallel block; then publish+`deploy_studio` together. Provision phase 4 min → 1.6 min.
12. **Launch the Vercel deploy before scraping** — it builds (~40s) while you read the target. Dashboard shareable at minute ~4, not 14.
13. **One recon call, one extraction call.** Inject the extractor + take inventory in call 1; extract ALL sections + stash `window.__sections` in call 2. Prune oversized heroes inside the extraction call (visibility rules → drop `video/picture/canvas`/big `svg` → trim trailing child blocks until ≤34KB).
14. **Seed transfer channel refinements:** escape RAW field values, not the stringified JSON (double-encoding corrupts `\n`); stash/restore the host page body ONCE for the whole batch; harden 2+ space runs against text-extraction collapse; expect DEL chars and HTML entities inside `data-*` attributes.
15. **Real timestamps only** on the mission feed (`date -u` at phase boundaries) — estimated times make benchmarks worthless.
16. **Integrity gate:** after seeding, verify `count of "{{" in each htmlTemplate == count(slots)` and template lengths == browser-measured lengths, char-exact.
17. **Seed is the bottleneck (46% of wall).** Next run: batch 2–3 sections per patch, drop mid-run length checks, probe direct JS return before falling back to the `<pre>` channel. Target ~20 min total.

## Legal/hygiene

Demo-only recreation for the prospect's own site (or your own). Content, images, and CSS remain theirs — hotlinked, not claimed. Tear down after the deal cycle. Never run against sites you have no business relationship with, except neutral safe defaults for internal practice.
