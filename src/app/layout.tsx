import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/literata/index.css";
import "@fontsource/mukta/400.css";
import "@fontsource/mukta/500.css";
import "@fontsource/mukta/600.css";
import "@fontsource/mukta/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DIYALO",
    template: "%s | DIYALO",
  },
  description: "Lighting the Path to a Brighter Future.",
  // Stage 1 is a design prototype with fictional content: keep it out of search indexes.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f2a43",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
