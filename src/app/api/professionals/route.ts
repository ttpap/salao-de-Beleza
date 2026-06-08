import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  return NextResponse.json(store.getProfessionals());
}

export async function POST(request: Request) {
  const data = await request.json();
  const professional = store.addProfessional(data);
  return NextResponse.json(professional, { status: 201 });
}
