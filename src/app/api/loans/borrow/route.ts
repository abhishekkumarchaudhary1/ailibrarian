import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getData, saveData } from "@/lib/data";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "reader") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookId } = await req.json();
  const data = await getData();
  const book = data.books.find((b) => b.id === bookId);
  if (!book || book.available < 1) {
    return NextResponse.json({ error: "Book unavailable" }, { status: 400 });
  }

  const existing = data.loans.find(
    (l) => l.bookId === bookId && l.userId === session.id && l.status === "active"
  );
  if (existing) {
    return NextResponse.json({ error: "Already borrowed" }, { status: 400 });
  }

  const due = new Date();
  due.setDate(due.getDate() + 30);

  data.loans.push({
    id: `loan_${Date.now()}`,
    bookId,
    userId: session.id,
    borrowedAt: new Date().toISOString().split("T")[0],
    dueAt: due.toISOString().split("T")[0],
    status: "active",
  });
  book.available -= 1;

  await saveData(data);
  return NextResponse.json({ ok: true });
}
