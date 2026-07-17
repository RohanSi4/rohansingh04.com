import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatNoteDate, getAllNotes, getNoteSource } from "./notes";

const root = process.cwd();

function internalRouteExists(url: string): boolean {
  const route = url.split(/[?#]/, 1)[0];
  if (route === "/") return fs.existsSync(path.join(root, "app", "page.tsx"));
  const segments = route.replace(/^\//, "").split("/").filter(Boolean);
  if (fs.existsSync(path.join(root, "app", ...segments, "page.tsx"))) return true;
  // dynamic content routes: /notes/x and /projects/x resolve via [slug] + content dir
  if (segments.length === 2 && ["notes", "projects"].includes(segments[0])) {
    return (
      fs.existsSync(path.join(root, "app", segments[0], "[slug]", "page.tsx")) &&
      fs.existsSync(path.join(root, "content", segments[0], segments[1], "index.mdx"))
    );
  }
  return false;
}

describe("notes content", () => {
  const notes = getAllNotes();

  it("has at least one note", () => {
    expect(notes.length).toBeGreaterThan(0);
  });

  it("keeps frontmatter complete and slugs unique", () => {
    const slugs = new Set<string>();
    for (const note of notes) {
      expect(note.title.trim().length, `${note.slug} has an empty title`).toBeGreaterThan(0);
      expect(note.description.trim().length, `${note.slug} has an empty description`).toBeGreaterThan(0);
      expect(note.date, `${note.slug} has an invalid date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(new Date(`${note.date}T12:00:00Z`).getTime()), `${note.slug} date does not parse`).toBe(false);
      expect(note.tags.length, `${note.slug} needs at least one tag`).toBeGreaterThan(0);
      expect(note.readingMinutes, `${note.slug} reading time looks wrong`).toBeGreaterThan(0);
      expect(slugs.has(note.slug), `duplicate note slug: ${note.slug}`).toBe(false);
      slugs.add(note.slug);
    }
  });

  it("sorts newest first", () => {
    const dates = notes.map((note) => note.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("keeps internal links in note bodies resolvable", () => {
    for (const note of notes) {
      const source = getNoteSource(note.slug);
      expect(source, `${note.slug} source went missing`).not.toBeNull();
      const internalLinks = [...source!.matchAll(/(?<!!)\[[^\]]+\]\((\/[^)]+)\)/g)].map(
        (match) => match[1],
      );
      for (const target of internalLinks) {
        expect(
          internalRouteExists(target),
          `${note.slug} points to missing route ${target}`,
        ).toBe(true);
      }
    }
  });

  it("contains no em dashes", () => {
    for (const note of notes) {
      const source = getNoteSource(note.slug)!;
      expect(source.includes("—"), `${note.slug} contains an em dash`).toBe(false);
    }
  });

  it("formats note dates in the site style", () => {
    expect(formatNoteDate("2026-07-17")).toBe("jul 17, 2026");
    expect(formatNoteDate("2026-01-05")).toBe("jan 5, 2026");
  });

  it("returns null for unknown note sources", () => {
    expect(getNoteSource("does-not-exist")).toBeNull();
  });
});
