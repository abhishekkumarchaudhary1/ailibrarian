import { getSession } from "@/lib/auth";
import { getData } from "@/lib/data";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Library } from "lucide-react";

export default async function SuperAdminLibrariansPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const data = await getData();
  const librarians = data.users.filter((u) => u.role === "librarian");

  return (
    <DashboardShell
      role="superadmin"
      userName={session.name}
      userAvatar={session.avatar}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Librarians</h2>
        <p className="text-slate-500">Manage library staff accounts</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {librarians.map((lib) => (
          <Card key={lib.id}>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600">
                <Library className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{lib.name}</p>
                <p className="text-sm text-slate-500">{lib.email}</p>
                <div className="mt-2">
                  <Badge>Librarian</Badge>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
