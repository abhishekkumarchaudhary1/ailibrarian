"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, User, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { roleHome } from "@/lib/auth-utils";
import type { Role } from "@/lib/types";

const DEMO_ACCOUNTS = [
  {
    role: "reader" as Role,
    email: "reader@library.edu",
    password: "reader123",
    label: "Reader",
    icon: User,
  },
  {
    role: "librarian" as Role,
    email: "librarian@library.edu",
    password: "lib123",
    label: "Librarian",
    icon: Users,
  },
  {
    role: "superadmin" as Role,
    email: "admin@library.edu",
    password: "admin123",
    label: "Super Admin",
    icon: Shield,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(creds?: { email: string; password: string }) {
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(creds ?? { email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Login failed");
      return;
    }
    router.push(roleHome(data.user.role));
  }

  return (
    <div className="gradient-bg flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold text-slate-800">
              AI Librarian
            </span>
          </Link>
          <p className="mt-2 text-sm text-slate-500">Sign in to your portal</p>
        </div>

        <Card className="mb-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              login();
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@library.edu"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Card>

        <p className="mb-3 text-center text-xs text-slate-400">
          Quick demo access
        </p>
        <div className="grid gap-2">
          {DEMO_ACCOUNTS.map(({ role, email, password, label, icon: Icon }) => (
            <button
              key={role}
              onClick={() => login({ email, password })}
              disabled={loading}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm transition-colors hover:bg-blue-50 disabled:opacity-50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-slate-700">{label}</p>
                <p className="text-xs text-slate-400">{email}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
