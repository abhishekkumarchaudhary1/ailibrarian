import { getSession } from "@/lib/auth";
import { getData } from "@/lib/data";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function SuperAdminUsersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const data = await getData();

  return (
    <DashboardShell
      role="superadmin"
      userName={session.name}
      userAvatar={session.avatar}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">All Users</h2>
        <p className="text-slate-500">{data.users.length} accounts</p>
      </div>
      <div className="space-y-3">
        {data.users.map((u) => (
          <Card key={u.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-semibold text-white">
                {u.avatar}
              </div>
              <div>
                <p className="font-medium text-slate-800">{u.name}</p>
                <p className="text-sm text-slate-500">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  u.role === "superadmin"
                    ? "warning"
                    : u.role === "librarian"
                      ? "default"
                      : "success"
                }
              >
                {u.role}
              </Badge>
              <span className="text-xs text-slate-400">Joined {u.joinedAt}</span>
            </div>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
