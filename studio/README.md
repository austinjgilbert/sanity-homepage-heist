# Heist Studio (Mission Control flavor)

Code Studio that adds the in-Studio magic:

- **Mission Control tool** (left nav): the full heist feed — animated progress bar, per-step "what's happening" descriptions, agent log — rendered live inside Studio, with the clone itself embedded in a split pane so you watch it rebuild as content streams in.
- **Live preview views**: open any `clonedPage` or `cloneRun` document → "Live preview" tab shows the running clone/dashboard next to the fields.

## Deploy

```sh
npm install
SANITY_STUDIO_PROJECT_ID=<projectId> SANITY_STUDIO_PREVIEW_URL=<vercelUrl> npx sanity deploy
```

## Important — one schema source of truth

This Studio ships the same 3 types as the MCP-managed path. A workspace must be EITHER
MCP-managed OR Studio-deployed. If the heist already ran with the MCP hosted Studio,
deploy this one under a **different appHost** and keep schema changes in one place, or
migrate: deploy this Studio via CLI and stop using MCP `deploy_schema` for the project.

The quick-demo default remains the MCP hosted Studio + `/dashboard` on Vercel — zero
local tooling. Use this flavor when the audience should see progress *inside* Studio.
