import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const professional = store.getProfessional(id);
  if (!professional) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(professional);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();
  const professional = store.updateProfessional(id, data);
  if (!professional) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(professional);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  store.deleteProfessional(id);
  return NextResponse.json({ ok: true });
}
