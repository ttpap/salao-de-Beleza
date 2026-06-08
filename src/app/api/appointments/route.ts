import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  let query = supabase
    .from("appointments")
    .select("*, client:clients(*), professional:professionals(*), service:services(*)")
    .order("start_time");

  if (date) {
    query = query.eq("date", date);
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
