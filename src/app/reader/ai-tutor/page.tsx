import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AIChat } from "@/components/reader/AIChat";

export default async function AITutorPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <DashboardShell
      role="reader"
      userName={session.name}
      userAvatar={session.avatar}
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">AI Study Tutor</h2>
        <p className="text-slate-500">
          Powered by Groq — ask about your courses and library resources
        </p>
      </div>
      <AIChat />
    </DashboardShell>
  );
}
