import fs from "fs";
import path from "path";

const notesDir = path.join(process.cwd(), "content", "notes");

export type NoteFrontmatter = {
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  tags: string[];
};

export type NoteMeta = NoteFrontmatter & {
  slug: string;
  readingMinutes: number;
};

const WORDS_PER_MINUTE = 230;

/** Parse the strict frontmatter contract: quoted strings + a JSON array of tags. */
function parseFrontmatter(
  raw: string,
  slug: string
): { frontmatter: NoteFrontmatter; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) throw new Error(`note "${slug}" is missing frontmatter`);

  const fields: Record<string, unknown> = {};
  for (const line of match[1].split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const colon = trimmed.indexOf(":");
    if (colon === -1) continue;
    const key = trimmed.slice(0, colon).trim();
    const value = trimmed.slice(colon + 1).trim();
    try {
      fields[key] = JSON.parse(value);
    } catch {
      throw new Error(`note "${slug}" has unparseable frontmatter value for "${key}"`);
    }
  }

  const { title, description, date, tags } = fields;
  if (typeof title !== "string" || !title.trim())
    throw new Error(`note "${slug}" needs a title`);
  if (typeof description !== "string" || !description.trim())
    throw new Error(`note "${slug}" needs a description`);
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    throw new Error(`note "${slug}" needs a YYYY-MM-DD date`);
  if (!Array.isArray(tags) || tags.some((t) => typeof t !== "string"))
    throw new Error(`note "${slug}" needs a string array of tags`);

  return {
    frontmatter: { title, description, date, tags },
    body: raw.slice(match[0].length),
  };
}

function readingMinutes(body: string): number {
  const words = body.match(/\S+/g)?.length ?? 0;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** All notes, newest first. Throws on malformed frontmatter so builds fail loudly. */
export function getAllNotes(): NoteMeta[] {
  if (!fs.existsSync(notesDir)) return [];
  const slugs = fs
    .readdirSync(notesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  return slugs
    .map((slug) => {
      const raw = fs.readFileSync(path.join(notesDir, slug, "index.mdx"), "utf-8");
      const { frontmatter, body } = parseFrontmatter(raw, slug);
      return { slug, ...frontmatter, readingMinutes: readingMinutes(body) };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Raw MDX source (frontmatter included) for one note, or null if absent. */
export function getNoteSource(slug: string): string | null {
  try {
    return fs.readFileSync(path.join(notesDir, slug, "index.mdx"), "utf-8");
  } catch {
    return null;
  }
}

const MONTHS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
];

/** "2026-07-17" -> "jul 17, 2026" (matches the site's lowercase date style). */
export function formatNoteDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${MONTHS[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}
