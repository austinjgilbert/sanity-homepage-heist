// Zero-dependency Sanity client. The heist skill rewrites PROJECT_ID at deploy time.
export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "__PROJECT_ID__";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

// Direct API (not apicdn): edits show within seconds while demoing.
export async function groq<T = unknown>(query: string): Promise<T | null> {
  const url = `https://${projectId}.api.sanity.io/v2025-02-19/data/query/${dataset}?query=${encodeURIComponent(
    query
  )}&perspective=published`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as { result: T };
    return body.result;
  } catch {
    return null;
  }
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type Slot = {
  _key: string;
  key: string;
  label?: string;
  kind: "text" | "image" | "href";
  value?: string;
  imageUrl?: string;
  href?: string;
};

export type Section = {
  _key: string;
  label?: string;
  kind?: string;
  htmlTemplate?: string;
  slots?: Slot[];
};

export type ClonedSite = {
  title?: string;
  sourceUrl?: string;
  faviconUrl?: string;
  styleLinks?: string[];
  fontLinks?: string[];
  globalCss?: string;
  bodyClass?: string;
};

export type ClonedPage = {
  title?: string;
  sections?: Section[];
  site?: ClonedSite;
};

export type CloneRun = {
  runId?: string;
  sourceUrl?: string;
  status?: "queued" | "running" | "complete" | "error";
  percent?: number;
  currentStep?: string;
  steps?: { _key: string; key: string; label: string; status: string; detail?: string }[];
  log?: { _key: string; t?: string; level?: string; msg: string }[];
  projectId?: string;
  studioUrl?: string;
  vercelUrl?: string;
  startedAt?: string;
  finishedAt?: string;
};

// Fill a section template: {{key}} placeholders -> slot values.
// text slots are HTML-escaped; image/href slots are inserted raw (URLs).
export function renderSection(section: Section): string {
  let html = section.htmlTemplate || "";
  for (const slot of section.slots || []) {
    const replacement =
      slot.kind === "image"
        ? slot.imageUrl || ""
        : slot.kind === "href"
        ? slot.href || "#"
        : escapeHtml(slot.value || "");
    html = html.split(`{{${slot.key}}}`).join(replacement);
  }
  return html;
}
