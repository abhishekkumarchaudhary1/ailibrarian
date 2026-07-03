import { getSession } from "@/lib/auth";
import { getData } from "@/lib/data";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { CourseCard } from "@/components/courses/CourseCard";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function CoursesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const data = await getData();
  const user = data.users.find((u) => u.id === session.id);
  const courses = data.courses.filter((c) =>
    user?.enrolledCourses?.includes(c.id)
  );

  return (
    <DashboardShell
      role="reader"
      userName={session.name}
      userAvatar={session.avatar}
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">My Courses</h2>
          <p className="text-sm text-slate-500 sm:text-base">Track your learning progress</p>
        </div>
        <Link href="/reader/ai-tutor" className="w-full sm:w-auto">
          <Button variant="secondary" className="w-full sm:w-auto">Ask AI Tutor</Button>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {courses.map((course) => (
          <div key={course.id}>
            <CourseCard course={course} />
            <Card className="mt-3">
              <h4 className="mb-3 text-sm font-semibold text-slate-700">
                Modules
              </h4>
              <ul className="space-y-2">
                {course.modules.map((mod) => (
                  <li key={mod.id} className="flex items-center gap-2 text-sm">
                    {mod.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-300" />
                    )}
                    <span
                      className={
                        mod.completed ? "text-slate-600" : "text-slate-400"
                      }
                    >
                      {mod.title}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
