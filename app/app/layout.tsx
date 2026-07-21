import type { ReactNode } from "react";

export const metadata = {
  title: "Homepage Heist — powered by Sanity",
  description:
    "A homepage recreated as structured, editable Sanity content by a Claude agent.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
