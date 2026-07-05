import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { chatWithGroq } from "@/lib/groq";
import { getData } from "@/lib/data";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "reader") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages, courseId } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messages required" }, { status: 400 });
  }

  const lastUser = [...messages].reverse().find((m: ChatMessage) => m.role === "user");
  if (!lastUser?.content?.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const data = await getData();
  const user = data.users.find((u) => u.id === session.id);
  const courses = data.courses.filter((c) =>
    user?.enrolledCourses?.includes(c.id)
  );
  const currentCourse = courseId
    ? data.courses.find((c) => c.id === courseId)
    : null;

  const courseContext = currentCourse
    ? `The student is studying "${currentCourse.title}" (${currentCourse.description}). Modules: ${currentCourse.modules.map((m) => m.title).join(", ")}.`
    : `Enrolled courses: ${courses.map((c) => c.title).join(", ")}.`;

  const libraryCatalog = data.books
    .map(
      (b) =>
        `- "${b.title}" by ${b.author} (${b.category})${b.available > 0 ? ", available" : ", currently unavailable"}`
    )
    .join("\n");

  const myLoans = data.loans.filter((l) => l.userId === session.id);
  const activeLoans = myLoans.filter((l) => l.status !== "returned");
  const returnedLoans = myLoans.filter((l) => l.status === "returned");

  const formatLoan = (l: (typeof myLoans)[0]) => {
    const book = data.books.find((b) => b.id === l.bookId);
    return `- "${book?.title}" by ${book?.author ?? "Unknown"} — borrowed ${l.borrowedAt}, due ${l.dueAt}, status: ${l.status}`;
  };

  const loanContext =
    myLoans.length === 0
      ? "This student has no loan history."
      : `Active/current loans (${activeLoans.length}):
${activeLoans.length > 0 ? activeLoans.map(formatLoan).join("\n") : "- None"}

Past returned loans (${returnedLoans.length}):
${returnedLoans.length > 0 ? returnedLoans.map(formatLoan).join("\n") : "- None"}`;

  const systemPrompt = `You are a warm, engaging AI study tutor for an academic library LMS called AI Librarian. Talk like a friendly human mentor — not a formal textbook.

Student: ${user?.name ?? session.name} (reader account)

${courseContext}

The student may ask about topics outside enrolled courses. Help them anyway and suggest relevant library books.

This student's personal loan history (use ONLY this data for loan/borrow questions — never invent loans):
${loanContext}

Library catalog (use EXACT titles when recommending):
${libraryCatalog}

RESPONSE STYLE — follow strictly:
- Plain conversational text only. NO markdown: no **, no ##, no ---, no asterisk bullets.
- Use short paragraphs separated by blank lines.
- For lists, put each item on its own line starting with a dash and space, like: - First point here
- When you mention ANY book (whether in our catalog or not), always wrap the full title in double brackets: [[Book Title]]
- If you know the author, write it right after: [[Book Title]] by Author Name
- When asked about their loans or borrowed books, answer from their personal loan history above only.
- Be encouraging, curious, and interactive — ask a brief follow-up question when it helps.
- Remember the full conversation. If the student says "yes" or agrees, continue from what you just offered.
- Keep responses focused but personable, not robotic.`;

  const groqMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m: ChatMessage) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  try {
    const reply = await chatWithGroq(groqMessages);
    return NextResponse.json({ reply });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI request failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
