import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") ?? "2024-01-01";
  const endDate = searchParams.get("endDate") ?? "2099-12-31";
  return NextResponse.json(store.getCommissions(startDate, endDate));
}
