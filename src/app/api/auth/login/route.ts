import { NextRequest, NextResponse } from "next/server";
import { getData } from "@/lib/data";
import { SESSION_COOKIE } from "@/lib/auth";
import type { SessionUser } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const data = await getData();
  const user = data.users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const session: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
  };

  const res = NextResponse.json({ user: session });
  res.cookies.set(SESSION_COOKIE, encodeURIComponent(JSON.stringify(session)), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
