import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("professionals")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = getSupabase();
  const body = await request.json();
  const { data, error } = await supabase
    .from("professionals")
    .insert(body)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (data && data.email) {
    const hash = await bcrypt.hash("123", 10);
    await supabase.from("app_users").upsert(
      {
        email: data.email,
        password_hash: hash,
        role: "profissional",
        professional_id: data.id,
        name: data.name,
      },
      { onConflict: "email" }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
