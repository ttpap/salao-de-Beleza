import { NextResponse } from "next/server";
import { isCalendarConfigured } from "@/lib/google-calendar";

export async function GET() {
  return NextResponse.json({ configured: isCalendarConfigured() });
}
