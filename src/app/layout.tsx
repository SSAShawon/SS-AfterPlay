import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SS AFTERPLAY — The game ends. The memories don't.",
    template: "%s — SS AFTERPLAY",
  },
  description:
    "A personal cinematic gaming archive: full storylines, chapter breakdowns, characters, memorable moments, personal ratings, rankings, journal essays and a chronological gaming history.",
  applicationName: "SS AFTERPLAY",
  authors: [{ name: "SS Afterplay" }],
  keywords: [
    "gaming archive",
    "game journal",
    "video game stories",
    "game rankings",
    "SS Afterplay",
  ],
  openGraph: {
    type: "website",
    siteName: "SS AFTERPLAY",
    title: "SS AFTERPLAY — The game ends. The memories don't.",
    description:
      "A personal cinematic gaming archive of the games that stayed: storylines, characters, memories, rankings and essays.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "SS AFTERPLAY",
    description: "The game ends. The memories don't.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#08090C",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body className="min-h-dvh bg-void text-soft">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#0d0f13",
              border: "1px solid rgba(244,244,245,0.12)",
              color: "#F4F4F5",
              borderRadius: 0,
              fontFamily: "var(--font-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}
