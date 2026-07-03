"use client";

import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Book } from "@/lib/types";

export function BookCard({
  book,
  onBorrow,
  showBorrow = false,
}: {
  book: Book;
  onBorrow?: (id: string) => void;
  showBorrow?: boolean;
}) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-500">
          <BookOpen className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-800 leading-snug">
            {book.title}
          </h3>
          <p className="text-sm text-slate-500">{book.author}</p>
        </div>
      </div>
      <p className="text-sm text-slate-600 line-clamp-2">{book.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Badge>{book.category}</Badge>
          <Badge variant={book.available > 0 ? "success" : "danger"}>
            {book.available > 0 ? `${book.available} available` : "Unavailable"}
          </Badge>
        </div>
        {showBorrow && book.available > 0 && onBorrow && (
          <Button size="sm" onClick={() => onBorrow(book.id)}>
            Borrow
          </Button>
        )}
      </div>
    </Card>
  );
}
