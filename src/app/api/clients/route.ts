import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  return NextResponse.json(store.getClients());
}

export async function POST(request: Request) {
  const data = await request.json();
  const client = store.addClient(data);
  return NextResponse.json(client, { status: 201 });
}
