import React from 'react'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemas'
import MissionControl from './MissionControl'

// Fill these in (the heist skill does it automatically):
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '__PROJECT_ID__'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

// Live iframe preview pane attached to documents: open a clonedPage or cloneRun
// and see the running clone/dashboard right next to the fields.
function UrlPreview(props: {document: {displayed: any}}) {
  const doc = props.document.displayed
  const url =
    doc?._type === 'cloneRun'
      ? doc?.vercelUrl && `${doc.vercelUrl}/dashboard`
      : doc?.vercelUrl || undefined
  // clonedPage: resolve via its run's vercelUrl is async; simplest: use env
  const fallback = process.env.SANITY_STUDIO_PREVIEW_URL || ''
  const src = url || fallback
  if (!src) return <div style={{padding: 16}}>Set SANITY_STUDIO_PREVIEW_URL to enable preview.</div>
  return <iframe src={src} style={{width: '100%', height: '100%', border: 0}} title="Preview" />
}

export default defineConfig({
  name: 'homepage-heist',
  title: 'Homepage Heist',
  projectId,
  dataset,
  plugins: [
    structureTool({
      defaultDocumentNode: (S, {schemaType}) =>
        ['clonedPage', 'cloneRun'].includes(schemaType)
          ? S.document().views([
              S.view.form(),
              S.view.component(UrlPreview).title('Live preview'),
            ])
          : S.document(),
    }),
  ],
  tools: (prev) => [
    {
      name: 'mission-control',
      title: 'Mission Control',
      component: MissionControl,
    },
    ...prev,
  ],
  schema: {types: schemaTypes},
})
