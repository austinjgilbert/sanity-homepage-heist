import {defineField, defineType} from 'sanity'

// Code mirror of the MCP-deployed heist schema. Keep in sync with
// schema/schema-declaration.md — one source of truth per workspace:
// use EITHER this Studio (CLI `sanity schema deploy`) OR the MCP path, never both.

export const clonedSite = defineType({
  name: 'clonedSite',
  type: 'document',
  title: 'Cloned Site',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'sourceUrl', type: 'url', title: 'Source URL'}),
    defineField({name: 'faviconUrl', type: 'url'}),
    defineField({name: 'styleLinks', type: 'array', title: 'Original stylesheet URLs', of: [{type: 'url'}]}),
    defineField({name: 'fontLinks', type: 'array', title: 'Font stylesheet URLs', of: [{type: 'url'}]}),
    defineField({name: 'globalCss', type: 'text', title: 'Extra global CSS', rows: 12}),
    defineField({name: 'bodyClass', type: 'string', title: 'Body class attribute'}),
  ],
})

export const clonedPage = defineType({
  name: 'clonedPage',
  type: 'document',
  title: 'Cloned Page',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: (r) => r.required()}),
    defineField({name: 'site', type: 'reference', to: [{type: 'clonedSite'}]}),
    defineField({
      name: 'sections',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'section',
          title: 'Section',
          preview: {
            select: {title: 'label', subtitle: 'kind'},
          },
          fields: [
            {name: 'label', type: 'string', title: 'Section label'},
            {name: 'kind', type: 'string', title: 'Kind'},
            {name: 'htmlTemplate', type: 'text', rows: 20, title: 'HTML template ({{slotKey}} placeholders)'},
            {
              name: 'slots',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'slot',
                  preview: {select: {title: 'label', subtitle: 'value'}},
                  fields: [
                    {name: 'key', type: 'string', validation: (r: any) => r.required()},
                    {name: 'label', type: 'string'},
                    {name: 'kind', type: 'string', title: 'text | image | href'},
                    {name: 'value', type: 'text', rows: 2, title: 'Text value'},
                    {name: 'imageUrl', type: 'url', title: 'Image URL'},
                    {name: 'href', type: 'url', title: 'Link URL'},
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
  ],
})

export const cloneRun = defineType({
  name: 'cloneRun',
  type: 'document',
  title: 'Clone Run',
  fields: [
    defineField({name: 'runId', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'sourceUrl', type: 'url'}),
    defineField({name: 'status', type: 'string', title: 'queued | running | complete | error'}),
    defineField({name: 'percent', type: 'number'}),
    defineField({name: 'currentStep', type: 'string'}),
    defineField({
      name: 'steps',
      type: 'array',
      of: [{type: 'object', name: 'step', fields: [
        {name: 'key', type: 'string'},
        {name: 'label', type: 'string'},
        {name: 'status', type: 'string', title: 'pending | running | done | error'},
        {name: 'detail', type: 'string'},
      ]}],
    }),
    defineField({
      name: 'log',
      type: 'array',
      of: [{type: 'object', name: 'logLine', fields: [
        {name: 't', type: 'string', title: 'ISO timestamp'},
        {name: 'level', type: 'string', title: 'info | warn | error'},
        {name: 'msg', type: 'string'},
      ]}],
    }),
    defineField({name: 'projectId', type: 'string'}),
    defineField({name: 'studioUrl', type: 'url'}),
    defineField({name: 'vercelUrl', type: 'url'}),
    defineField({name: 'startedAt', type: 'datetime'}),
    defineField({name: 'finishedAt', type: 'datetime'}),
  ],
})

export const schemaTypes = [clonedSite, clonedPage, cloneRun]
