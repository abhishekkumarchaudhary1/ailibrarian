import { cookies } from "next/headers";
import type { SessionUser } from "./types";

export { roleHome, canAccess } from "./auth-utils";

const SESSION_COOKIE = "ailibrarian_session";

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as SessionUser;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE };
