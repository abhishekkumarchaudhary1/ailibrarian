import { getSession } from "@/lib/auth";
import { getData } from "@/lib/data";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function LibrarianReadersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const data = await getData();
  const readers = data.users.filter((u) => u.role === "reader");

  return (
    <DashboardShell
      role="librarian"
      userName={session.name}
      userAvatar={session.avatar}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Readers</h2>
        <p className="text-slate-500">{readers.length} registered readers</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {readers.map((reader) => {
          const loans = data.loans.filter(
            (l) => l.userId === reader.id && l.status !== "returned"
          );
          const courses = data.courses.filter((c) =>
            reader.enrolledCourses?.includes(c.id)
          );
          return (
            <Card key={reader.id}>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-semibold text-white">
                  {reader.avatar}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{reader.name}</p>
                  <p className="text-sm text-slate-500">{reader.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge>{loans.length} loans</Badge>
                <Badge variant="success">
                  {courses.length} courses
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </DashboardShell>
  );
}
