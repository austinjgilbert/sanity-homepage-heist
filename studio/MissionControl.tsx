import React, {useEffect, useRef, useState} from 'react'
import {useClient} from 'sanity'

// Mission Control — a custom Studio TOOL. Shows the heist happening live INSIDE
// the Studio: animated progress, per-step descriptions, agent log, and an
// embedded live preview of the clone rebuilding itself as content streams in.

const RUN_QUERY = `*[_type=="cloneRun"]|order(startedAt desc)[0]{
  runId, sourceUrl, status, percent, currentStep,
  steps[]{_key, key, label, status, detail},
  log[]{_key, t, level, msg},
  projectId, studioUrl, vercelUrl, startedAt, finishedAt
}`

const STEP_DESC: Record<string, string> = {
  provision: 'Creating a brand-new Sanity project + dataset. Tokens issued and vaulted.',
  schema: 'Deploying the universal heist content model: clonedSite, clonedPage, cloneRun.',
  rundoc: 'Opening this feed — the progress you are reading is itself a Sanity document.',
  studio: 'Deploying this very Studio so every captured field is editable.',
  frontend: 'Shipping the renderer to Vercel. Everything after this streams from Sanity.',
  cors: 'Allowlisting exactly the origins that may read this dataset. No wildcards.',
  scrape: "Reading the target's rendered DOM in a real browser: HTML, CSS, fonts, favicon.",
  segment: 'The AI step: splitting the page into sections, swapping editable content for structured slots.',
  seed: 'Writing sections into the Content Lake — publish-before-reference, character-exact.',
  verify: 'Loading the clone and checking: sections render, CSS applied, zero leaked placeholders.',
  editproof: 'Changing a headline in Sanity and watching it appear on the clone in seconds.',
  complete: 'Handoff: clone URL, Studio URL, mission log. Nothing was pre-built.',
}

const G = '#33ff66'
const DIM = '#1a7a38'
const RED = '#ff5555'
const AMBER = '#ffcc33'

export default function MissionControl() {
  const client = useClient({apiVersion: '2025-02-19'})
  const [run, setRun] = useState<any>(null)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let alive = true
    const load = () =>
      client
        .fetch(RUN_QUERY)
        .then((r) => alive && r && setRun(r))
        .catch(() => undefined)
    load()
    const id = setInterval(load, 1500)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [client])

  useEffect(() => {
    logRef.current?.scrollTo({top: logRef.current.scrollHeight})
  }, [run?.log?.length])

  const pct = Math.max(0, Math.min(100, run?.percent ?? 0))
  const bar = '█'.repeat(Math.round(pct / 4)) + '░'.repeat(25 - Math.round(pct / 4))
  const statusColor = run?.status === 'error' ? RED : run?.status === 'complete' ? G : AMBER

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        background: '#04100a',
        color: G,
        fontFamily: "'Courier New', ui-monospace, monospace",
      }}
    >
      <style>{`
        @keyframes mcPulse { 0%,100% { opacity:.55 } 50% { opacity:1 } }
        @keyframes mcGlow { 0%,100% { text-shadow:none } 50% { text-shadow:0 0 12px ${G} } }
      `}</style>

      {/* Left: mission feed */}
      <div style={{flex: '0 0 44%', padding: 24, overflowY: 'auto', borderRight: `1px solid ${DIM}`}}>
        <div style={{fontSize: 18, fontWeight: 700, letterSpacing: 2, animation: 'mcGlow 1.6s infinite'}}>
          HOMEPAGE HEIST — MISSION CONTROL
        </div>
        <div style={{color: DIM, margin: '6px 0 16px'}}>live from the Content Lake, inside your Studio</div>

        <div style={{border: `1px solid ${DIM}`, padding: 14, marginBottom: 14}}>
          <div>TARGET : {run?.sourceUrl || 'awaiting orders'}</div>
          <div>
            STATUS : <span style={{color: statusColor}}>{(run?.status || 'standby').toUpperCase()}</span>
            {run?.currentStep ? ` — ${run.currentStep}` : ''}
          </div>
          <div style={{fontSize: 16, marginTop: 6, animation: run?.status === 'running' ? 'mcPulse 1.2s infinite' : undefined}}>
            [{bar}] {pct}%
          </div>
        </div>

        <div style={{border: `1px solid ${DIM}`, padding: 14, marginBottom: 14}}>
          <div style={{color: DIM, marginBottom: 8}}>MISSION STEPS</div>
          {(run?.steps || []).map((s: any) => (
            <div key={s._key} style={{marginBottom: 7}}>
              <span style={{color: s.status === 'done' ? G : s.status === 'running' ? AMBER : s.status === 'error' ? RED : DIM}}>
                {s.status === 'done' ? '█' : s.status === 'running' ? '▶' : s.status === 'error' ? '✖' : '░'}
              </span>{' '}
              {s.label}
              {s.detail ? <span style={{color: DIM}}> — {s.detail}</span> : null}
              {s.status === 'running' && STEP_DESC[s.key] ? (
                <div style={{color: AMBER, fontSize: 12, margin: '3px 0 0 18px', animation: 'mcPulse 1.4s infinite'}}>
                  ▸ {STEP_DESC[s.key]}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div ref={logRef} style={{border: `1px solid ${DIM}`, padding: 14, maxHeight: 220, overflowY: 'auto'}}>
          <div style={{color: DIM, marginBottom: 8}}>AGENT LOG</div>
          {(run?.log || []).map((l: any) => (
            <div key={l._key} style={{marginBottom: 3, color: l.level === 'error' ? RED : G, fontSize: 12}}>
              <span style={{color: DIM}}>{l.t ? l.t.slice(11, 19) : '--:--:--'}</span> {l.msg}
            </div>
          ))}
        </div>
      </div>

      {/* Right: the clone, rebuilding itself live */}
      <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
        <div style={{padding: '10px 16px', borderBottom: `1px solid ${DIM}`, color: DIM, fontSize: 12}}>
          LIVE PREVIEW — {run?.vercelUrl || 'frontend not deployed yet'} (updates as content streams in)
        </div>
        {run?.vercelUrl ? (
          <iframe
            src={run.vercelUrl}
            style={{border: 0, flex: 1, width: '100%', background: '#fff'}}
            title="Live clone preview"
          />
        ) : (
          <div style={{flex: 1, display: 'grid', placeItems: 'center', color: DIM}}>
            waiting for frontend deploy…
          </div>
        )}
      </div>
    </div>
  )
}
