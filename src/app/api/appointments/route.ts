import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");

  let query = supabase
    .from("appointments")
    .select("*, client:clients(*), professional:professionals(*), service:services(*)")
    .order("date")
    .order("start_time");

  if (date) {
    query = query.eq("date", date);
  } else if (dateFrom && dateTo) {
    query = query.gte("date", dateFrom).lte("date", dateTo);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = getSupabase();
  const body = await request.json();
  const { data, error } = await supabase
    .from("appointments")
    .insert(body)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
