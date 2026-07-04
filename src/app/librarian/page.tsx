import { getSession } from "@/lib/auth";
import { getData } from "@/lib/data";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ReturnLoanButton } from "@/components/librarian/ReturnLoanButton";
import { AdminAIPanel } from "@/components/admin/AdminAIPanel";

export default async function LibrarianDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  const data = await getData();
  const readers = data.users.filter((u) => u.role === "reader");
  const activeLoans = data.loans.filter((l) => l.status !== "returned");
  const overdue = activeLoans.filter((l) => l.status === "overdue");

  return (
    <DashboardShell
      role="librarian"
      userName={session.name}
      userAvatar={session.avatar}
    >
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">
          Library Dashboard
        </h2>
        <p className="text-slate-500">Manage books, loans, and readers</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <StatCard label="Total Readers" value={readers.length} icon="Users" />
        <StatCard label="Active Loans" value={activeLoans.length} icon="BookOpen" />
        <StatCard label="Books in Catalog" value={data.books.length} icon="Library" />
        <StatCard label="Overdue" value={overdue.length} icon="GraduationCap" />
      </div>

      <div className="mb-8">
        <AdminAIPanel />
      </div>

      <h3 className="mb-4 font-semibold text-slate-800">Recent Loans</h3>
      <div className="space-y-3">
        {activeLoans.map((loan) => {
          const book = data.books.find((b) => b.id === loan.bookId);
          const reader = data.users.find((u) => u.id === loan.userId);
          return (
            <Card key={loan.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium text-slate-800">{book?.title}</p>
                <p className="text-sm text-slate-500">
                  {reader?.name} · Due {loan.dueAt}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Badge
                  variant={
                    loan.status === "overdue"
                      ? "danger"
                      : loan.status === "active"
                        ? "default"
                        : "success"
                  }
                >
                  {loan.status}
                </Badge>
                <ReturnLoanButton loanId={loan.id} />
              </div>
            </Card>
          );
        })}
      </div>
    </DashboardShell>
  );
}
