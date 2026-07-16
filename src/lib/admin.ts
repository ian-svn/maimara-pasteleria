import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return {
      session: null,
      error: NextResponse.json({ error: "No autorizado" }, { status: 403 }),
    };
  }
  return { session, error: null };
}
