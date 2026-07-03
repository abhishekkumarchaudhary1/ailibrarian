import { getSession } from "@/lib/auth";
import { getData } from "@/lib/data";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { BookCard } from "@/components/books/BookCard";

export default async function LibrarianBooksPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const data = await getData();

  return (
    <DashboardShell
      role="librarian"
      userName={session.name}
      userAvatar={session.avatar}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Book Inventory</h2>
        <p className="text-slate-500">{data.books.length} titles in catalog</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </DashboardShell>
  );
}
