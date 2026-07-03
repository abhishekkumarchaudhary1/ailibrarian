import type { Book } from "./types";

export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]{3,}\s*$/gm, "")
    .replace(/`(.+?)`/g, "$1")
    .trim();
}

export type MessagePart =
  | { type: "text"; value: string }
  | { type: "book"; title: string; author: string };

export function bookSearchUrl(title: string, author?: string): string {
  const query = author?.trim() ? `${title} ${author} book` : `${title} book`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

type Match = {
  index: number;
  length: number;
  title: string;
  author: string;
};

function findBookMatches(text: string, catalog: Book[]): Match[] {
  const matches: Match[] = [];
  const bookByTitle = new Map(catalog.map((b) => [b.title.toLowerCase(), b]));

  const patterns: { regex: RegExp; authorGroup?: number }[] = [
    { regex: /\[\[(.+?)\]\]/g },
    { regex: /"([^"]+)"\s+by\s+([^",\n]+)/gi, authorGroup: 2 },
    { regex: /'([^']+)'\s+by\s+([^',\n]+)/gi, authorGroup: 2 },
  ];

  for (const { regex, authorGroup } of patterns) {
    for (const m of text.matchAll(regex)) {
      const rawTitle = m[1].trim();
      if (!rawTitle || rawTitle.length < 3) continue;

      const catalogBook = bookByTitle.get(rawTitle.toLowerCase());
      const author = authorGroup
        ? m[authorGroup].trim()
        : (catalogBook?.author ?? "");

      matches.push({
        index: m.index!,
        length: m[0].length,
        title: catalogBook?.title ?? rawTitle,
        author,
      });
    }
  }

  for (const book of [...catalog].sort((a, b) => b.title.length - a.title.length)) {
    const lower = text.toLowerCase();
    const titleLower = book.title.toLowerCase();
    let start = 0;
    while (start < lower.length) {
      const idx = lower.indexOf(titleLower, start);
      if (idx === -1) break;
      const overlaps = matches.some(
        (m) => idx < m.index + m.length && idx + book.title.length > m.index
      );
      if (!overlaps) {
        matches.push({
          index: idx,
          length: book.title.length,
          title: book.title,
          author: book.author,
        });
      }
      start = idx + 1;
    }
  }

  matches.sort((a, b) => a.index - b.index);

  const deduped: Match[] = [];
  for (const m of matches) {
    const last = deduped[deduped.length - 1];
    if (last && m.index < last.index + last.length) continue;
    deduped.push(m);
  }

  return deduped;
}

export function parseMessageParts(text: string, books: Book[]): MessagePart[] {
  const cleaned = stripMarkdown(text);
  const matches = findBookMatches(cleaned, books);

  if (matches.length === 0) {
    return cleaned ? [{ type: "text", value: cleaned }] : [];
  }

  const parts: MessagePart[] = [];
  let cursor = 0;

  for (const m of matches) {
    if (m.index > cursor) {
      parts.push({ type: "text", value: cleaned.slice(cursor, m.index) });
    }
    parts.push({ type: "book", title: m.title, author: m.author });
    cursor = m.index + m.length;
  }

  if (cursor < cleaned.length) {
    parts.push({ type: "text", value: cleaned.slice(cursor) });
  }

  return parts.filter((p) => p.type !== "text" || p.value.length > 0);
}

export function splitIntoBlocks(text: string): string[] {
  const cleaned = stripMarkdown(text);
  const lines = cleaned.split("\n");
  const blocks: string[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  function flushParagraph() {
    if (paragraph.length) {
      blocks.push(paragraph.join(" "));
      paragraph = [];
    }
  }

  function flushList() {
    if (list.length) {
      blocks.push(list.join("\n"));
      list = [];
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      flushParagraph();
      continue;
    }
    if (/^[-•*]\s+/.test(trimmed)) {
      flushParagraph();
      list.push(trimmed);
    } else {
      flushList();
      paragraph.push(trimmed);
    }
  }

  flushList();
  flushParagraph();
  return blocks.filter(Boolean);
}

export function isListBlock(block: string): boolean {
  const lines = block.split("\n");
  return lines.every((l) => /^[-•*]\s+/.test(l.trim()) || l.trim() === "");
}

export function parseListItems(block: string): string[] {
  return block
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => l.replace(/^[-•*]\s+/, ""));
}
