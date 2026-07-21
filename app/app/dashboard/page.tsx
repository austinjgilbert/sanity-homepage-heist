"use client";

import { useEffect, useRef, useState } from "react";
import { groq, type CloneRun } from "../../lib/sanity";

const RUN_QUERY = `*[_type=="cloneRun"]|order(startedAt desc)[0]{
  runId, sourceUrl, status, percent, currentStep,
  steps[]{_key, key, label, status, detail},
  log[]{_key, t, level, msg},
  projectId, studioUrl, vercelUrl, startedAt, finishedAt
}`;

const green = "#33ff66";
const dim = "#1a7a38";
const red = "#ff5555";
const amber = "#ffcc33";

// What each step is actually doing — shown under the step while it runs
const STEP_DESC: Record<string, string> = {
  provision:
    "Creating a brand-new Sanity project + dataset via MCP. Tokens issued and vaulted.",
  schema:
    "Deploying the universal heist content model: clonedSite, clonedPage (sections+slots), cloneRun.",
  rundoc:
    "Opening this very feed — the dashboard you're reading is a Sanity document updating live.",
  studio:
    "Deploying a hosted Sanity Studio so every captured field is editable in a real CMS UI.",
  frontend:
    "Shipping the renderer to Vercel. From here on you're watching Sanity content stream in.",
  cors: "Allowlisting exactly the origins that may read this dataset. No wildcards.",
  scrape:
    "Reading the target's rendered DOM through a real browser: HTML, stylesheets, fonts, favicon.",
  segment:
    "The AI step: splitting the page into sections and swapping editable text/images/links for structured slots.",
  seed: "Writing sections into the Content Lake — publish-before-reference, character-exact.",
  verify:
    "Loading the clone and checking: sections render, CSS applied, zero leaked placeholders.",
  editproof:
    "Changing a headline in Sanity and watching it appear on the clone within seconds.",
  complete: "Handoff: clone URL, Studio URL, and this mission log. Nothing was pre-built.",
};

function StepGlyph({ status }: { status: string }) {
  if (status === "done") return <span style={{ color: green }}>█ DONE </span>;
  if (status === "running")
    return <span style={{ color: amber }}>▶ RUN… </span>;
  if (status === "error") return <span style={{ color: red }}>✖ FAIL </span>;
  return <span style={{ color: dim }}>░ WAIT </span>;
}

export default function Dashboard() {
  const [run, setRun] = useState<CloneRun | null>(null);
  const [blink, setBlink] = useState(true);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const r = await groq<CloneRun>(RUN_QUERY);
      if (r) setRun(r);
    };
    load();
    const poll = setInterval(load, 1500);
    const cursor = setInterval(() => setBlink((b) => !b), 530);
    return () => {
      clearInterval(poll);
      clearInterval(cursor);
    };
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [run?.log?.length]);

  const pct = Math.max(0, Math.min(100, run?.percent ?? 0));
  const cells = 32;
  const filled = Math.round((pct / 100) * cells);
  const bar = "█".repeat(filled) + "░".repeat(cells - filled);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at center, #06140a 0%, #020803 100%)",
        color: green,
        fontFamily: "'Courier New', ui-monospace, monospace",
        padding: "40px 24px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {/* CRT scanlines */}
      <style>{`
        @keyframes heistPulse { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
        @keyframes heistShimmer { 0% { opacity: .85 } 50% { opacity: 1; text-shadow: 0 0 14px ${green} } 100% { opacity: .85 } }
      `}</style>
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,.25) 0 1px, transparent 1px 3px)",
        }}
      />
      <div style={{ width: "min(860px, 100%)" }}>
        <pre style={{ color: green, textShadow: `0 0 8px ${green}66`, fontSize: 13, lineHeight: 1.15 }}>
{String.raw`
 _   _  ___  __  __ ___ ___  _   ___ ___   _  _ ___ ___ ___ _____
| |_| |/ _ \|  \/  | __| _ \/_\ / __| __| | || | __|_ _/ __|_   _|
|  _  | (_) | |\/| | _||  _/ _ \ (_ | _|  | __ | _| | |\__ \ | |
|_| |_|\___/|_|  |_|___|_|/_/ \_\___|___| |_||_|___|___|___/ |_|
`}
        </pre>
        <div style={{ marginBottom: 8, color: dim }}>
          ── LIVE OPERATION FEED ── powered by Sanity Content Lake ──
        </div>

        <div style={{ border: `1px solid ${dim}`, padding: 20, marginBottom: 16 }}>
          <div style={{ marginBottom: 6 }}>
            TARGET&nbsp;&nbsp;: {run?.sourceUrl || "awaiting orders"}
          </div>
          <div style={{ marginBottom: 6 }}>
            STATUS&nbsp;&nbsp;:{" "}
            <span
              style={{
                color:
                  run?.status === "error"
                    ? red
                    : run?.status === "complete"
                    ? green
                    : amber,
              }}
            >
              {(run?.status || "standby").toUpperCase()}
            </span>
            {run?.currentStep ? ` — ${run.currentStep}` : ""}
            {blink ? "▮" : " "}
          </div>
          <div style={{ fontSize: 18, letterSpacing: 1, animation: run?.status === "running" ? "heistShimmer 1.2s ease-in-out infinite" : undefined }}>
            [{bar}] {pct}%
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 320px", border: `1px solid ${dim}`, padding: 16 }}>
            <div style={{ color: dim, marginBottom: 10 }}>MISSION STEPS</div>
            {(run?.steps || []).map((s) => (
              <div key={s._key} style={{ marginBottom: 8 }}>
                <StepGlyph status={s.status} />
                {s.label}
                {s.detail ? (
                  <span style={{ color: dim }}> — {s.detail}</span>
                ) : null}
                {s.status === "running" && STEP_DESC[s.key] ? (
                  <div
                    style={{
                      color: amber,
                      fontSize: 12,
                      margin: "4px 0 2px 58px",
                      animation: "heistPulse 1.4s ease-in-out infinite",
                    }}
                  >
                    ▸ {STEP_DESC[s.key]}
                  </div>
                ) : null}
              </div>
            ))}
            {!run?.steps?.length && (
              <div style={{ color: dim }}>No active mission. INSERT URL TO CONTINUE.</div>
            )}
          </div>

          <div
            ref={logRef}
            style={{
              flex: "1 1 320px",
              border: `1px solid ${dim}`,
              padding: 16,
              maxHeight: 340,
              overflowY: "auto",
            }}
          >
            <div style={{ color: dim, marginBottom: 10 }}>AGENT LOG</div>
            {(run?.log || []).map((l) => (
              <div key={l._key} style={{ marginBottom: 4, color: l.level === "error" ? red : green }}>
                <span style={{ color: dim }}>{l.t ? l.t.slice(11, 19) : "--:--:--"}</span>{" "}
                {l.msg}
              </div>
            ))}
          </div>
        </div>

        {run?.status === "complete" && (
          <div style={{ border: `1px solid ${green}`, padding: 20, marginTop: 16, textShadow: `0 0 8px ${green}66` }}>
            <div style={{ marginBottom: 8 }}>★ MISSION COMPLETE ★</div>
            <div>
              → CLONE&nbsp;: <a style={{ color: green }} href="/">view recreated homepage</a>
            </div>
            {run.studioUrl && (
              <div>
                → STUDIO : <a style={{ color: green }} href={run.studioUrl} target="_blank" rel="noreferrer">{run.studioUrl}</a>
              </div>
            )}
            <div style={{ color: dim, marginTop: 8 }}>
              Edit any headline in Studio, hit publish, watch the clone update in ~2s.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
