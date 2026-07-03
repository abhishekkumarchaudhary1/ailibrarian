import { GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Course } from "@/lib/types";

export function CourseCard({ course }: { course: Course }) {
  const done = course.modules.filter((m) => m.completed).length;
  const total = course.modules.length;
  const pct = Math.round((done / total) * 100);

  return (
    <Card>
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">{course.title}</h3>
          <p className="text-sm text-slate-500">{course.instructor}</p>
        </div>
      </div>
      <p className="mb-4 text-sm text-slate-600">{course.description}</p>
      <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
        <span>
          {done}/{total} modules
        </span>
        <Badge>{course.duration}</Badge>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </Card>
  );
}
