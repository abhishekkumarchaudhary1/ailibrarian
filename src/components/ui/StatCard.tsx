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
    <Card className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </Card>
  );
}
