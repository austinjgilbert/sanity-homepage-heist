"use client";

import { useEffect, useState } from "react";
import {
  groq,
  renderSection,
  projectId,
  type ClonedPage,
} from "../lib/sanity";

const PAGE_QUERY = `*[_type=="clonedPage" && slug.current=="home"]|order(_updatedAt desc)[0]{
  title,
  sections[]{_key, label, kind, htmlTemplate, slots[]{_key, key, label, kind, value, imageUrl, href}},
  "site": site->{title, sourceUrl, faviconUrl, styleLinks, fontLinks, globalCss, bodyClass}
}`;

export default function ClonePage() {
  const [page, setPage] = useState<ClonedPage | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const result = await groq<ClonedPage>(PAGE_QUERY);
      if (alive && result) setPage(result);
    };
    load();
    const id = setInterval(() => {
      load();
      setTick((t) => t + 1);
    }, 2500);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (!page) {
    return (
      <div
        style={{
          fontFamily: "monospace",
          background: "#0a0a0a",
          color: "#4ade80",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 24 }}>HOMEPAGE HEIST</div>
        <div>Waiting for content… the agent is still working.</div>
        <a href="/dashboard" style={{ color: "#4ade80" }}>
          → watch the heist live
        </a>
      </div>
    );
  }

  const site = page.site || {};

  return (
    <>
      {/* Original site stylesheets + fonts, hotlinked for max fidelity */}
      {(site.fontLinks || []).map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      {(site.styleLinks || []).map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      {site.globalCss ? <style>{site.globalCss}</style> : null}
      {site.faviconUrl ? <link rel="icon" href={site.faviconUrl} /> : null}

      <div className={site.bodyClass || ""} data-heist-tick={tick}>
        {(page.sections || []).map((section) => (
          <div
            key={section._key}
            data-heist-section={section.label || section.kind}
            // Section HTML originates from the cloned site + our own slot
            // substitution with escaped text values.
            dangerouslySetInnerHTML={{ __html: renderSection(section) }}
          />
        ))}
      </div>

      {/* Heist badge */}
      <div
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 99999,
          background: "#101112",
          color: "#fff",
          border: "1px solid #f0326433",
          borderRadius: 8,
          padding: "10px 14px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          fontSize: 13,
          boxShadow: "0 4px 24px rgba(0,0,0,.4)",
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <span>
          ⚡ Recreated in <strong>Sanity</strong> — edits go live in seconds
        </span>
        <a
          style={{ color: "#f03264", textDecoration: "none", fontWeight: 600 }}
          href={`https://www.sanity.io/manage/project/${projectId}`}
          target="_blank"
          rel="noreferrer"
        >
          Manage
        </a>
        <a
          style={{ color: "#4ade80", textDecoration: "none", fontWeight: 600 }}
          href="/dashboard"
        >
          Heist log
        </a>
      </div>
    </>
  );
}
