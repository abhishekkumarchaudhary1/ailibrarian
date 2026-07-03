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

  const systemPrompt = `You are an AI study assistant for an academic library LMS called AI Librarian. Help students learn clearly and concisely.

${courseContext}

The student may also ask about topics outside their enrolled courses — help them anyway and suggest relevant library books.

Library catalog:
${libraryCatalog}

Remember the full conversation. If the student agrees to recommendations or says "yes", continue from what you previously offered — do not reset the topic. Suggest specific books from the catalog when relevant. Keep answers focused and encouraging.`;

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
