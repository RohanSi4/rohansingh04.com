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
    default: "rohan singh",
    template: "%s | rohan singh",
  },
  description: "cs student at uva. building things.",
  metadataBase: new URL("https://rohansingh04.com"),
  openGraph: {
    title: "rohan singh",
    description: "cs student at uva. building things.",
    url: "https://rohansingh04.com",
    siteName: "rohan singh",
    locale: "en_US",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "rohan singh",
    description: "cs student at uva. building things.",
    images: ["/og.png"],
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
  var t = localStorage.getItem('theme');
  if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  if (t === 'dark') document.documentElement.classList.add('dark');
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
      </head>
      <body className="bg-bg text-fg antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
