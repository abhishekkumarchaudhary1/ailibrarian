"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
  X,
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
    { href: "/reader/courses", label: "Courses", icon: GraduationCap },
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
    { href: "/superadmin/users", label: "Users", icon: Users },
    { href: "/superadmin/librarians", label: "Librarians", icon: Library },
    { href: "/superadmin/settings", label: "Settings", icon: Settings },
  ],
};

function NavLinks({
  links,
  pathname,
  onNavigate,
  className,
}: {
  links: typeof NAV.reader;
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={cn("space-y-1", className)}>
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === href
              ? "bg-blue-50 text-blue-700"
              : "text-slate-600 hover:bg-slate-50"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const pageTitle =
    links.find((l) => l.href === pathname)?.label ?? `${role} Portal`;

  return (
    <div className="gradient-bg flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200/80 bg-white/80 backdrop-blur-md lg:flex">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">AI Librarian</p>
            <p className="text-xs capitalize text-slate-500">{role}</p>
          </div>
        </div>
        <div className="flex-1 px-3 py-4">
          <NavLinks links={links} pathname={pathname} />
        </div>
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

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(100%,280px)] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    AI Librarian
                  </p>
                  <p className="text-xs capitalize text-slate-500">{role}</p>
                </div>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <NavLinks
                links={links}
                pathname={pathname}
                onNavigate={() => setMenuOpen(false)}
              />
            </div>
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
        </div>
      )}

      <div className="flex flex-1 flex-col lg:ml-64">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200/60 bg-white/70 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8 lg:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 lg:hidden"
              aria-label="Open menu"
            >
              <LayoutDashboard className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-slate-800 sm:text-lg">
                {pageTitle}
              </h1>
              <p className="hidden text-xs capitalize text-slate-500 sm:block">
                {role} portal
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
              <Bell className="h-5 w-5" />
            </button>
            <div className="relative lg:hidden">
              <button
                onClick={() => setAccountOpen((o) => !o)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-semibold text-white"
              >
                {userAvatar}
              </button>
              {accountOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setAccountOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                    <p className="truncate px-3 py-2 text-sm font-medium text-slate-700">
                      {userName}
                    </p>
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/90 px-2 py-2 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-around gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium sm:text-xs",
                  active ? "text-blue-600" : "text-slate-500"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-blue-600")} />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
