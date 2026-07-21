# Heist Schema (MCP `deploy_schema` payload)

Paste this exact `schemaDeclaration` string into the Sanity MCP `deploy_schema` tool (workspace `default`). JS object literals — no `[]` wrapper, no imports.

```
{
  name: 'clonedSite',
  type: 'document',
  title: 'Cloned Site',
  fields: [
    {name: 'title', type: 'string', validation: (Rule) => Rule.required()},
    {name: 'sourceUrl', type: 'url', title: 'Source URL'},
    {name: 'faviconUrl', type: 'url'},
    {name: 'styleLinks', type: 'array', title: 'Original stylesheet URLs', of: [{type: 'url'}]},
    {name: 'fontLinks', type: 'array', title: 'Font stylesheet URLs', of: [{type: 'url'}]},
    {name: 'globalCss', type: 'text', title: 'Extra global CSS', rows: 12},
    {name: 'bodyClass', type: 'string', title: 'Body class attribute'},
  ],
}

{
  name: 'clonedPage',
  type: 'document',
  title: 'Cloned Page',
  fields: [
    {name: 'title', type: 'string', validation: (Rule) => Rule.required()},
    {name: 'slug', type: 'slug', options: {source: 'title'}, validation: (Rule) => Rule.required()},
    {name: 'site', type: 'reference', to: [{type: 'clonedSite'}]},
    {name: 'sections', type: 'array', of: [
      {type: 'object', name: 'section', title: 'Section', fields: [
        {name: 'label', type: 'string', title: 'Section label'},
        {name: 'kind', type: 'string', title: 'Kind (nav/hero/features/testimonials/cta/footer/other)'},
        {name: 'htmlTemplate', type: 'text', rows: 20, title: 'HTML template ({{slotKey}} placeholders)'},
        {name: 'slots', type: 'array', of: [
          {type: 'object', name: 'slot', fields: [
            {name: 'key', type: 'string', validation: (Rule) => Rule.required()},
            {name: 'label', type: 'string'},
            {name: 'kind', type: 'string', title: 'text | image | href'},
            {name: 'value', type: 'text', rows: 2, title: 'Text value'},
            {name: 'imageUrl', type: 'url', title: 'Image URL'},
            {name: 'href', type: 'url', title: 'Link URL'},
          ]},
        ]},
      ]},
    ]},
  ],
}

{
  name: 'cloneRun',
  type: 'document',
  title: 'Clone Run',
  fields: [
    {name: 'runId', type: 'string', validation: (Rule) => Rule.required()},
    {name: 'sourceUrl', type: 'url'},
    {name: 'status', type: 'string', title: 'queued | running | complete | error'},
    {name: 'percent', type: 'number'},
    {name: 'currentStep', type: 'string'},
    {name: 'steps', type: 'array', of: [
      {type: 'object', name: 'step', fields: [
        {name: 'key', type: 'string'},
        {name: 'label', type: 'string'},
        {name: 'status', type: 'string', title: 'pending | running | done | error'},
        {name: 'detail', type: 'string'},
      ]},
    ]},
    {name: 'log', type: 'array', of: [
      {type: 'object', name: 'logLine', fields: [
        {name: 't', type: 'string', title: 'ISO timestamp'},
        {name: 'level', type: 'string', title: 'info | warn | error'},
        {name: 'msg', type: 'string'},
      ]},
    ]},
    {name: 'projectId', type: 'string'},
    {name: 'studioUrl', type: 'url'},
    {name: 'vercelUrl', type: 'url'},
    {name: 'startedAt', type: 'datetime'},
    {name: 'finishedAt', type: 'datetime'},
  ],
}
```

## Editing model

- `section.htmlTemplate` holds the site's real HTML for that section, with editable
  content swapped for `{{slotKey}}` placeholders.
- Each `slot` carries the original value (text / image URL / href). Editors change slot
  values in Studio; the frontend re-injects them into the template. Pixel fidelity stays,
  content becomes structured and editable.
- The dashboard reads `cloneRun` — the progress feed is itself Sanity content (dogfood beat).
