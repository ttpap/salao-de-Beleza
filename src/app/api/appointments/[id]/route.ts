import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();
  const appointment = store.updateAppointment(id, data);
  if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(appointment);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  store.deleteAppointment(id);
  return NextResponse.json({ ok: true });
}
