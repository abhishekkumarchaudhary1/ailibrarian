import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Settings, Database, Sparkles } from "lucide-react";

export default async function SuperAdminSettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const settings = [
    {
      icon: Database,
      title: "Data Store",
      desc: "Using data/maindata.json — prototype mode, no database connected.",
    },
    {
      icon: Sparkles,
      title: "AI Provider",
      desc: "Groq (llama-3.3-70b-versatile) powers the reader AI tutor.",
    },
    {
      icon: Settings,
      title: "Authentication",
      desc: "Cookie-based sessions with dummy accounts for all three roles.",
    },
  ];

  return (
    <DashboardShell
      role="superadmin"
      userName={session.name}
      userAvatar={session.avatar}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-slate-500">System configuration overview</p>
      </div>
      <div className="space-y-4 max-w-2xl">
        {settings.map(({ icon: Icon, title, desc }) => (
          <Card key={title} className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{title}</p>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
