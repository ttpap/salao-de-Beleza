import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  return NextResponse.json(store.getServices());
}

export async function POST(request: Request) {
  const data = await request.json();
  const service = store.addService(data);
  return NextResponse.json(service, { status: 201 });
}
