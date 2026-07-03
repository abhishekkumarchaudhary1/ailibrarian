"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Users,
  Library,
  BarChart3,
  Bell,
} from "lucide-react";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const NAV: Record<
  Role,
  { href: string; label: string; icon: React.ElementType }[]
> = {
  reader: [
    { href: "/reader", label: "Dashboard", icon: LayoutDashboard },
    { href: "/reader/catalog", label: "Catalog", icon: BookOpen },
    { href: "/reader/courses", label: "My Courses", icon: GraduationCap },
    { href: "/reader/ai-tutor", label: "AI Tutor", icon: MessageSquare },
  ],
  librarian: [
    { href: "/librarian", label: "Dashboard", icon: LayoutDashboard },
    { href: "/librarian/books", label: "Books", icon: Library },
    { href: "/librarian/loans", label: "Loans", icon: BookOpen },
    { href: "/librarian/readers", label: "Readers", icon: Users },
  ],
  superadmin: [
    { href: "/superadmin", label: "Overview", icon: BarChart3 },
    { href: "/superadmin/users", label: "All Users", icon: Users },
    { href: "/superadmin/librarians", label: "Librarians", icon: Library },
    { href: "/superadmin/settings", label: "Settings", icon: Settings },
  ],
};

export function DashboardShell({
  role,
  userName,
  userAvatar,
  children,
}: {
  role: Role;
  userName: string;
  userAvatar: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const links = NAV[role];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="gradient-bg flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">AI Librarian</p>
            <p className="text-xs capitalize text-slate-500">{role}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-semibold text-white">
              {userAvatar}
            </div>
            <p className="truncate text-sm font-medium text-slate-700">
              {userName}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="ml-64 flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/60 bg-white/70 px-8 py-4 backdrop-blur-md">
          <h1 className="text-lg font-semibold text-slate-800 capitalize">
            {role} Portal
          </h1>
          <button className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
            <Bell className="h-5 w-5" />
          </button>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
