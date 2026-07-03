"use client";

import { ExternalLink, BookOpen } from "lucide-react";
import type { Book } from "@/lib/types";
import {
  splitIntoBlocks,
  isListBlock,
  parseListItems,
  parseMessageParts,
  bookSearchUrl,
} from "@/lib/format-ai-message";

function BookTag({ title, author }: { title: string; author?: string }) {
  return (
    <a
      href={bookSearchUrl(title, author)}
      target="_blank"
      rel="noopener noreferrer"
      className="mx-0.5 inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 hover:text-blue-800"
    >
      <BookOpen className="h-3 w-3 shrink-0" />
      <span>{title}</span>
      <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-60" />
    </a>
  );
}

function InlineContent({ text, books }: { text: string; books: Book[] }) {
  const parts = parseMessageParts(text, books);
  return (
    <>
      {parts.map((part, i) =>
        part.type === "book" ? (
          <BookTag key={i} title={part.title} author={part.author} />
        ) : (
          <span key={i}>{part.value}</span>
        )
      )}
    </>
  );
}

export function ChatMessage({
  content,
  books,
  animate = false,
}: {
  content: string;
  books: Book[];
  animate?: boolean;
}) {
  const blocks = splitIntoBlocks(content);

  return (
    <div
      className={`space-y-3 text-sm leading-relaxed ${animate ? "animate-[fadeIn_0.4s_ease-out]" : ""}`}
    >
      {blocks.map((block, i) => {
        if (isListBlock(block)) {
          return (
            <ul key={i} className="space-y-2 pl-1">
              {parseListItems(block).map((item, j) => (
                <li key={j} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                  <span>
                    <InlineContent text={item} books={books} />
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i}>
            <InlineContent text={block.replace(/\n/g, " ")} books={books} />
          </p>
        );
      })}
    </div>
  );
}
