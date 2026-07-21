# 🏴 Homepage Heist

**One command. Any homepage. Fully recreated in Sanity, live on Vercel, editable in Studio — while the audience watches a retro dashboard load it like an old video game.**

Built to be run by a Claude agent (Cowork, Claude Code, or any Claude with Sanity + Vercel MCP). No pre-work, no pre-built content: a fresh Claude instance goes from URL → working editable site in minutes.

## The play

1. You say: **`heist https://prospect.com`**
2. Claude provisions a new Sanity project + hosted Studio, deploys this repo's Next.js app to Vercel, and hands you a **live dashboard URL** immediately.
3. The audience watches the mission feed: scrape → segment → model → seed → verify — a progress bar and agent log, all rendered from a `cloneRun` document **in Sanity itself**.
4. The homepage appears at the Vercel URL: their real HTML/CSS, pixel-close, with every headline, image, and CTA now a structured, editable Sanity field.
5. Closer: edit the hero in Studio, publish, and the clone updates in ~2 seconds.

## Quickstart (for a fresh Claude instance)

Give Claude this repo plus one line:

> Read skill/SKILL.md and run the heist against https://TARGET-SITE.com

Requirements: Sanity MCP (authenticated), Vercel MCP or `vercel` CLI, and browser tools (for JS-heavy sites). Everything else — schema, frontend, dashboard, progress contract, error handling, security gate — is encoded in the skill.

## What's in the box

```
app/        Next.js 15 frontend — clone renderer (/), retro dashboard (/dashboard).
            Zero runtime deps beyond Next. Polls the Content Lake every 2s so
            Studio publishes appear live mid-demo.
schema/     The exact Sanity schema (deploy via MCP deploy_schema): clonedSite,
            clonedPage (sections + slots), cloneRun (the progress feed).
skill/      The orchestrator skill — 12-step run, progress-write contract,
            segmentation rules, error contract, demo talk track.
```

## How fidelity + editability coexist

Each section keeps the site's **real HTML** as a template; only human-editable content is swapped for `{{slot}}` placeholders backed by structured fields. Original stylesheets and fonts are hotlinked. Editors change fields in Studio; the renderer re-injects them into the template. You get pixel fidelity AND structured content — the entire Sanity pitch in one artifact.

## Notes

- Demo-only: content/CSS/images remain the property of the source site (hotlinked, not claimed). Use with prospects on their own site, or safe internal defaults.
- Datasets are public (published, already-public content only). Tokens issued at provisioning are vaulted, never committed.
- Tear down demo projects after the deal cycle.

Built with the [supersanity-engineer](https://github.com/austinjgilbert/superskills) corpus. Live-proven end to end before first commit.
