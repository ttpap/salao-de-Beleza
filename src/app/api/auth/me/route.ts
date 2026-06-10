import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({
    profile: {
      id: session.userId,
      role: session.role,
      professional_id: session.professionalId,
      name: session.name,
    },
  });
}
