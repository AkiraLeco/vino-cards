import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Camada extra de proteção do /admin: sem cookie de sessão do Supabase, nem chega nas páginas.
 * A conferência real do usuário continua em requireAdmin() (lib/auth.ts).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  const hasSession = request.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));
  if (!hasSession) return NextResponse.redirect(new URL("/admin/login", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
