import { getSession } from "@/lib/auth";
import { getData } from "@/lib/data";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { CatalogGrid } from "@/components/books/CatalogGrid";

export default async function CatalogPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const data = await getData();

  return (
    <DashboardShell
      role="reader"
      userName={session.name}
      userAvatar={session.avatar}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Book Catalog</h2>
        <p className="text-slate-500">Browse and borrow from our collection</p>
      </div>
      <CatalogGrid books={data.books} />
    </DashboardShell>
  );
}
