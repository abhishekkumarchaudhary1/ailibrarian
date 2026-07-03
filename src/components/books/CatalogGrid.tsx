"use client";

import { BookCard } from "@/components/books/BookCard";
import { BorrowButton } from "@/components/books/BorrowButton";
import type { Book } from "@/lib/types";

export function CatalogGrid({ books }: { books: Book[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => (
        <div key={book.id} className="relative">
          <BookCard book={book} />
          {book.available > 0 && (
            <div className="absolute bottom-5 right-5">
              <BorrowButton bookId={book.id} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
