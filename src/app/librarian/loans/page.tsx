import { getSession } from "@/lib/auth";
import { getData } from "@/lib/data";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ReturnLoanButton } from "@/components/librarian/ReturnLoanButton";

export default async function LibrarianLoansPage() {
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
        <h2 className="text-2xl font-bold text-slate-800">Loan Management</h2>
        <p className="text-slate-500">All active and overdue loans</p>
      </div>
      <div className="space-y-3">
        {data.loans
          .filter((l) => l.status !== "returned")
          .map((loan) => {
            const book = data.books.find((b) => b.id === loan.bookId);
            const reader = data.users.find((u) => u.id === loan.userId);
            return (
              <Card key={loan.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-slate-800">{book?.title}</p>
                  <p className="text-sm text-slate-500">
                    {reader?.name} · Borrowed {loan.borrowedAt} · Due{" "}
                    {loan.dueAt}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <Badge
                    variant={loan.status === "overdue" ? "danger" : "default"}
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
