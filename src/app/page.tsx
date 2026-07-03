import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Users,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="gradient-hero min-h-screen">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold text-slate-800">
            AI Librarian
          </span>
        </div>
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
      </nav>

      <section className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 sm:py-20">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm text-blue-700">
          <Sparkles className="h-4 w-4" />
          AI-Powered Library & LMS
        </div>
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Learn smarter with
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            your AI librarian
          </span>
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-base text-slate-500 sm:text-lg">
          A unified platform for students, librarians, and administrators —
          browse books, take courses, and get AI-powered study help.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-3">
        {[
          {
            icon: GraduationCap,
            title: "Readers",
            desc: "Access courses, borrow books, and chat with an AI tutor tailored to your learning.",
          },
          {
            icon: Users,
            title: "Librarians",
            desc: "Manage catalog, track loans, and support readers from a clean admin dashboard.",
          },
          {
            icon: Shield,
            title: "Super Admin",
            desc: "Oversee the entire system, manage staff, and monitor library-wide analytics.",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="gradient-card rounded-2xl border border-slate-200/80 p-6 text-center shadow-sm"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-semibold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
