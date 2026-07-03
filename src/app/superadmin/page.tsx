import { getSession } from "@/lib/auth";
import { getData } from "@/lib/data";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function SuperAdminDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");
  const data = await getData();

  return (
    <DashboardShell
      role="superadmin"
      userName={session.name}
      userAvatar={session.avatar}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">System Overview</h2>
        <p className="text-slate-500">Library-wide analytics and management</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <StatCard label="Total Readers" value={data.stats.totalReaders} icon="Users" />
        <StatCard label="Active Loans" value={data.stats.activeLoans} icon="BookOpen" />
        <StatCard label="Books" value={data.stats.booksInCatalog} icon="Library" />
        <StatCard label="Courses" value={data.stats.coursesOffered} icon="GraduationCap" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 font-semibold text-slate-800">Staff</h3>
          <div className="space-y-3">
            {data.users
              .filter((u) => u.role !== "reader")
              .map((u) => (
                <Card key={u.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-semibold text-white">
                      {u.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{u.name}</p>
                      <p className="text-sm text-slate-500">{u.email}</p>
                    </div>
                  </div>
                  <Badge>{u.role}</Badge>
                </Card>
              ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-slate-800">Announcements</h3>
          <div className="space-y-3">
            {data.announcements.map((a) => (
              <Card key={a.id}>
                <p className="font-medium text-slate-800">{a.title}</p>
                <p className="text-sm text-slate-500">{a.body}</p>
                <p className="mt-2 text-xs text-slate-400">{a.createdAt}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
