import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Newsreader } from "next/font/google";
import "./globals.css";

/**
 * Typography — DESIGN.md §3.
 *
 *   Instrument Serif  display only, 36px and above, regular weight only
 *   Geist Sans        body and UI
 *   Geist Mono        instrument labelling — coordinates, metrics, tags.
 *                     Never body copy: mono prose is a terminal theme, which
 *                     the brief rules out.
 *   Newsreader        the running text engraved on the stones. A text serif
 *                     drawn for reading, so it keeps its shape small and on a
 *                     textured surface, where Instrument Serif's thin display
 *                     strokes would break up. Used by the engraving canvas
 *                     only; nothing in the DOM is set in it.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Abyud Shetty — Field",
  description:
    "A spatial map of the systems and experiences I've built.",
};

export const viewport: Viewport = {
  themeColor: "#0E1011",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${newsreader.variable}`}
    >
      {/* Browser extensions (Grammarly, password managers) write attributes
          onto <body> before React hydrates; that is not a mismatch in the
          site, so it is not reported as one. Applies to this tag only. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
