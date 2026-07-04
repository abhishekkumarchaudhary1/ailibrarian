import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { chatWithGroq } from "@/lib/groq";
import { getData } from "@/lib/data";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChartItem {
  label: string;
  value: number;
  color?: string;
}

export interface ChartData {
  type: "bar" | "donut" | "progress";
  title: string;
  items: ChartItem[];
}

const COLORS = [
  "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd",
  "#1e40af", "#6366f1", "#818cf8", "#a5b4fc",
];

function buildChartsFromData(): { snapshot: string; charts: ChartData[] } {
  return getData().then((data) => {
    const readers = data.users.filter((u) => u.role === "reader");
    const librarians = data.users.filter((u) => u.role === "librarian");
    const activeLoans = data.loans.filter((l) => l.status !== "returned");
    const overdueLoans = data.loans.filter((l) => l.status === "overdue");
    const returnedLoans = data.loans.filter((l) => l.status === "returned");
    const totalCopies = data.books.reduce((s, b) => s + b.copies, 0);
    const totalAvailable = data.books.reduce((s, b) => s + b.available, 0);
    const checkedOut = totalCopies - totalAvailable;
    const utilizationRate = totalCopies > 0
      ? ((checkedOut / totalCopies) * 100).toFixed(1)
      : "0";

    const categoryBreakdown: Record<string, number> = {};
    for (const b of data.books) {
      categoryBreakdown[b.category] = (categoryBreakdown[b.category] || 0) + 1;
    }

    const bookPopularity = data.books.map((b) => ({
      title: b.title,
      author: b.author,
      category: b.category,
      totalCopies: b.copies,
      available: b.available,
      currentlyBorrowed: b.copies - b.available,
      loanCount: data.loans.filter((l) => l.bookId === b.id).length,
    }));

    const readerActivity = readers.map((r) => ({
      name: r.name,
      activeLoans: activeLoans.filter((l) => l.userId === r.id).length,
      overdueLoans: overdueLoans.filter((l) => l.userId === r.id).length,
      totalLoans: data.loans.filter((l) => l.userId === r.id).length,
      enrolledCourses: r.enrolledCourses?.length ?? 0,
      joinedAt: r.joinedAt,
    }));

    const courseStats = data.courses.map((c) => {
      const enrolled = readers.filter((r) =>
        r.enrolledCourses?.includes(c.id)
      ).length;
      const completedMods = c.modules.filter((m) => m.completed).length;
      return {
        title: c.title,
        instructor: c.instructor,
        duration: c.duration,
        totalModules: c.modules.length,
        completedModules: completedMods,
        completionRate: Math.round((completedMods / c.modules.length) * 100),
        enrolledReaders: enrolled,
      };
    });

    const charts: ChartData[] = [
      {
        type: "bar",
        title: "Book Loan Popularity",
        items: bookPopularity
          .sort((a, b) => b.loanCount - a.loanCount)
          .map((b, i) => ({
            label: b.title.length > 25 ? b.title.slice(0, 22) + "..." : b.title,
            value: b.loanCount,
            color: COLORS[i % COLORS.length],
          })),
      },
      {
        type: "donut",
        title: "Inventory by Category",
        items: Object.entries(categoryBreakdown).map(([cat, count], i) => ({
          label: cat,
          value: count,
          color: COLORS[i % COLORS.length],
        })),
      },
      {
        type: "bar",
        title: "Book Availability (Available / Total Copies)",
        items: data.books.map((b, i) => ({
          label: b.title.length > 25 ? b.title.slice(0, 22) + "..." : b.title,
          value: Math.round((b.available / b.copies) * 100),
          color: COLORS[i % COLORS.length],
        })),
      },
      {
        type: "donut",
        title: "Loan Status Distribution",
        items: [
          { label: "Active", value: activeLoans.length, color: "#2563eb" },
          { label: "Overdue", value: overdueLoans.length, color: "#ef4444" },
          { label: "Returned", value: returnedLoans.length, color: "#10b981" },
        ].filter((i) => i.value > 0),
      },
      {
        type: "progress",
        title: "Course Completion Rates",
        items: courseStats.map((c, i) => ({
          label: c.title,
          value: c.completionRate,
          color: COLORS[i % COLORS.length],
        })),
      },
      {
        type: "bar",
        title: "Reader Activity (Total Loans)",
        items: readerActivity.map((r, i) => ({
          label: r.name,
          value: r.totalLoans,
          color: COLORS[i % COLORS.length],
        })),
      },
    ];

    const snapshot = `LIBRARY DATA SNAPSHOT (real-time from database):

USERS:
- Total readers: ${readers.length}
- Librarians: ${librarians.length}
- Total accounts: ${data.users.length}

BOOKS:
- Titles in catalog: ${data.books.length}
- Total copies: ${totalCopies}
- Available copies: ${totalAvailable}
- Currently checked out: ${checkedOut}
- Utilization rate: ${utilizationRate}%
- Categories: ${Object.entries(categoryBreakdown).map(([k, v]) => `${k} (${v})`).join(", ")}

BOOK POPULARITY:
${bookPopularity.map((b) => `- "${b.title}" by ${b.author}: ${b.loanCount} total loans, ${b.currentlyBorrowed} currently out, ${b.available}/${b.totalCopies} available`).join("\n")}

LOANS:
- Active loans: ${activeLoans.length}
- Overdue loans: ${overdueLoans.length}
- Returned loans: ${returnedLoans.length}
- Total historical loans: ${data.loans.length}

ACTIVE LOANS DETAIL:
${activeLoans.map((l) => {
  const book = data.books.find((b) => b.id === l.bookId);
  const user = data.users.find((u) => u.id === l.userId);
  return `- "${book?.title}" borrowed by ${user?.name} on ${l.borrowedAt}, due ${l.dueAt}, status: ${l.status}`;
}).join("\n")}

READER ACTIVITY:
${readerActivity.map((r) => `- ${r.name}: ${r.activeLoans} active loans, ${r.overdueLoans} overdue, ${r.enrolledCourses} courses, joined ${r.joinedAt}`).join("\n")}

COURSES:
${courseStats.map((c) => `- "${c.title}" by ${c.instructor} (${c.duration}): ${c.enrolledReaders} enrolled, ${c.completionRate}% completion (${c.completedModules}/${c.totalModules} modules)`).join("\n")}

ANNOUNCEMENTS:
${data.announcements.map((a) => `- "${a.title}" (${a.createdAt}): ${a.body}`).join("\n")}`;

    return { snapshot, charts };
  }) as unknown as { snapshot: string; charts: ChartData[] };
}

function pickCharts(question: string, allCharts: ChartData[]): ChartData[] {
  const q = question.toLowerCase();
  const picked: ChartData[] = [];

  if (q.includes("overview") || q.includes("analytics") || q.includes("summary") || q.includes("dashboard")) {
    return allCharts.slice(0, 4);
  }
  if (q.includes("book") || q.includes("demand") || q.includes("popular") || q.includes("inventory")) {
    picked.push(...allCharts.filter((c) => c.title.includes("Book") || c.title.includes("Inventory") || c.title.includes("Availability")));
  }
  if (q.includes("loan") || q.includes("overdue") || q.includes("borrow")) {
    picked.push(...allCharts.filter((c) => c.title.includes("Loan")));
  }
  if (q.includes("course") || q.includes("completion") || q.includes("enroll")) {
    picked.push(...allCharts.filter((c) => c.title.includes("Course")));
  }
  if (q.includes("reader") || q.includes("activity") || q.includes("user")) {
    picked.push(...allCharts.filter((c) => c.title.includes("Reader")));
  }
  if (q.includes("utiliz") || q.includes("availab")) {
    picked.push(...allCharts.filter((c) => c.title.includes("Availability") || c.title.includes("Inventory")));
  }
  if (q.includes("category")) {
    picked.push(...allCharts.filter((c) => c.title.includes("Category")));
  }

  if (picked.length === 0) {
    return allCharts.slice(0, 2);
  }

  const unique = picked.filter((c, i, a) => a.findIndex((x) => x.title === c.title) === i);
  return unique.slice(0, 4);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["librarian", "superadmin"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messages required" }, { status: 400 });
  }

  const lastUser = [...messages].reverse().find((m: ChatMessage) => m.role === "user");
  if (!lastUser?.content?.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const { snapshot, charts: allCharts } = await buildChartsFromData();
  const relevantCharts = pickCharts(lastUser.content, allCharts);

  const systemPrompt = `You are an AI analytics assistant for a library management system called AI Librarian. You serve librarians (admins) and superadmins.

You have access to the complete real-time library data below. Use ONLY this data for numbers — never invent or estimate figures.

${snapshot}

RESPONSE STYLE — follow strictly:
- Plain conversational text. NO markdown: no **, no ##, no ---, no backticks.
- Use short paragraphs separated by blank lines.
- For lists, use a dash and space: - Item here
- Give specific numbers from the data. Be precise, not vague.
- Visual charts will be automatically displayed alongside your response, so reference them naturally (e.g. "as you can see in the chart" or "the chart below shows").
- When asked about revenue, explain that the current system tracks loans (not payments) and offer to analyze loan volume, book utilization, and demand trends instead.
- When asked about trends, analyze dates and patterns in the loan data.
- Proactively surface insights: overdue risks, popular books, low-utilization inventory, course enrollment gaps.
- Be professional but approachable. End with a relevant follow-up question when it adds value.
- Remember the full conversation context.`;

  const groqMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m: ChatMessage) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  try {
    const reply = await chatWithGroq(groqMessages);
    return NextResponse.json({ reply, charts: relevantCharts });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI request failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
