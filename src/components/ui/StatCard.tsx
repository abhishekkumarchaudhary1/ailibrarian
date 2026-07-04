import { BookOpen, Users, GraduationCap, Library } from "lucide-react";
import { Card } from "@/components/ui/Card";

const ICONS = { BookOpen, Users, GraduationCap, Library };

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: keyof typeof ICONS;
}) {
  const Icon = ICONS[icon];
  return (
    <Card className="flex items-center gap-2 sm:gap-4 overflow-hidden">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 sm:h-12 sm:w-12">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <div className="min-w-0 overflow-hidden">
        <p className="text-lg font-bold text-slate-800 sm:text-2xl">{value}</p>
        <p className="truncate text-[11px] text-slate-500 sm:text-sm">{label}</p>
      </div>
    </Card>
  );
}
