import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const professionalId = searchParams.get("professional_id");

  let query = supabase
    .from("payments")
    .select("*, professional:professionals(id, name)")
    .order("created_at", { ascending: false });

  if (month) query = query.eq("reference_month", month);
  if (professionalId) query = query.eq("professional_id", professionalId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = getSupabase();
  const body = await request.json();

  const { data, error } = await supabase
    .from("payments")
    .insert({
      professional_id: body.professional_id,
      amount: body.amount,
      type: body.type,
      reference_month: body.reference_month,
      notes: body.notes || null,
    })
    .select("*, professional:professionals(id, name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
