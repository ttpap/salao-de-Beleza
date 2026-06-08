import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? undefined;
  return NextResponse.json(store.getAppointmentsWithRelations(date));
}

export async function POST(request: Request) {
  const data = await request.json();
  const appointment = store.addAppointment(data);
  return NextResponse.json(appointment, { status: 201 });
}
