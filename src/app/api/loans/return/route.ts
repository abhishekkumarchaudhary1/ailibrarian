import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getData, saveData } from "@/lib/data";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !["librarian", "superadmin"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { loanId } = await req.json();
  const data = await getData();
  const loan = data.loans.find((l) => l.id === loanId);
  if (!loan || loan.status === "returned") {
    return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  }

  loan.status = "returned";
  const book = data.books.find((b) => b.id === loan.bookId);
  if (book) book.available += 1;

  await saveData(data);
  return NextResponse.json({ ok: true });
}
