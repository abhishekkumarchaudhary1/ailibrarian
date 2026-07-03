import type { Role } from "./types";

export function roleHome(role: Role): string {
  switch (role) {
    case "reader":
      return "/reader";
    case "librarian":
      return "/librarian";
    case "superadmin":
      return "/superadmin";
  }
}

export function canAccess(role: Role, path: string): boolean {
  if (path.startsWith("/reader")) return role === "reader";
  if (path.startsWith("/librarian")) return role === "librarian";
  if (path.startsWith("/superadmin")) return role === "superadmin";
  return true;
}
