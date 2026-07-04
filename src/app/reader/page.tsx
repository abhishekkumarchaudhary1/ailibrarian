import { getSession } from "@/lib/auth";
import { getData } from "@/lib/data";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/ui/StatCard";
import { CourseCard } from "@/components/courses/CourseCard";
import { BookCard } from "@/components/books/BookCard";
import { Card } from "@/components/ui/Card";
import { Bell } from "lucide-react";

export default async function ReaderDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  const data = await getData();
  const user = data.users.find((u) => u.id === session.id);
  const courses = data.courses.filter((c) =>
    user?.enrolledCourses?.includes(c.id)
  );
  const myLoans = data.loans.filter(
    (l) => l.userId === session.id && l.status !== "returned"
  );
  const announcements = data.announcements.slice(0, 2);

  return (
    <DashboardShell
      role="reader"
      userName={session.name}
      userAvatar={session.avatar}
    >
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">
          Welcome back, {session.name.split(" ")[0]}
        </h2>
        <p className="text-slate-500">Here&apos;s your learning overview</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
        <StatCard label="Active Loans" value={myLoans.length} icon="BookOpen" />
        <StatCard label="Enrolled Courses" value={courses.length} icon="GraduationCap" />
        <StatCard label="Books Available" value={data.books.reduce((a, b) => a + b.available, 0)} icon="Library" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 font-semibold text-slate-800">My Courses</h3>
          <div className="space-y-4">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-4 font-semibold text-slate-800">Announcements</h3>
            <div className="space-y-3">
              {announcements.map((a) => (
                <Card key={a.id} className="flex gap-3">
                  <Bell className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <div>
                    <p className="font-medium text-slate-800">{a.title}</p>
                    <p className="text-sm text-slate-500">{a.body}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-slate-800">Current Loans</h3>
            <div className="space-y-3">
              {myLoans.length === 0 ? (
                <Card className="text-center text-sm text-slate-400">
                  No active loans
                </Card>
              ) : (
                myLoans.map((loan) => {
                  const book = data.books.find((b) => b.id === loan.bookId);
                  return book ? (
                    <BookCard key={loan.id} book={book} />
                  ) : null;
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
