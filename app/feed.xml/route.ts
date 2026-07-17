import { getAllNotes } from "@/lib/notes";

export const dynamic = "force-static";

const site = "https://rohansingh04.com";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822(date: string): string {
  return new Date(`${date}T12:00:00Z`).toUTCString();
}

export async function GET() {
  const notes = getAllNotes();
  const newest = notes[0]?.date;

  const items = notes
    .map(
      (note) => `    <item>
      <title>${escapeXml(note.title)}</title>
      <link>${site}/notes/${note.slug}</link>
      <guid isPermaLink="true">${site}/notes/${note.slug}</guid>
      <description>${escapeXml(note.description)}</description>
      <pubDate>${rfc822(note.date)}</pubDate>
      ${note.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("\n      ")}
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Rohan Singh · notes</title>
    <link>${site}/notes</link>
    <description>Occasional writing on the systems Rohan Singh builds: LLM tooling, data pipelines, and how his site works.</description>
    <language>en-us</language>
    ${newest ? `<lastBuildDate>${rfc822(newest)}</lastBuildDate>` : ""}
    <atom:link href="${site}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
