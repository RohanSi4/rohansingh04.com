import type { Metadata } from "next";
import { Geist, Fraunces, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  // optical sizing makes it look great at both display and text sizes
  axes: ["opsz"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Rohan Singh: projects, running, and more",
    template: "%s | Rohan Singh",
  },
  description:
    "I'm Rohan, a UVA computer science student who likes making things I can actually use. This is where I keep my projects, running progress, travel, and whatever I'm working on now.",
  metadataBase: new URL("https://rohansingh04.com"),
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/feed.xml" },
  },
  authors: [{ name: "Rohan Singh", url: "https://rohansingh04.com" }],
  creator: "Rohan Singh",
  keywords: [
    "Rohan Singh",
    "software engineer",
    "data engineering",
    "machine learning",
    "University of Virginia",
  ],
  openGraph: {
    title: "Rohan Singh: projects, running, and more",
    description:
      "Projects, running, travel, and whatever Rohan is into right now.",
    url: "https://rohansingh04.com",
    siteName: "Rohan Singh",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rohan Singh: projects, running, and more",
    description:
      "Projects, running, travel, and whatever Rohan is into right now.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// runs before React hydrates -- reads localStorage and applies .dark class
// to prevent flash of wrong theme on first load
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if (t === 'dark') document.documentElement.classList.add('dark');
  } catch (_) {}
})()
`.trim();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* blocking script -- must run before body paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* page metadata overrides `alternates` per page, so declare RSS discovery directly */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Rohan Singh · notes"
          href="/feed.xml"
        />
      </head>
      <body className="bg-bg text-fg antialiased min-h-screen flex flex-col">
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-fg px-4 py-2 text-sm font-semibold text-bg shadow-lg transition-transform focus:translate-y-0"
        >
          skip to content
        </a>
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
