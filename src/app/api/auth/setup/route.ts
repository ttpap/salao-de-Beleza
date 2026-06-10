import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabase } from "@/lib/supabase";

export async function POST() {
  const supabase = getSupabase();

  const adminHash = await bcrypt.hash("salao123", 10);
  const profHash = await bcrypt.hash("123", 10);

  const results: Array<{ name: string; email: string; status: string }> = [];

  const { error: adminError } = await supabase.from("app_users").upsert(
    {
      email: "ricardo@salao.com",
      password_hash: adminHash,
      role: "admin",
      professional_id: null,
      name: "Ricardo",
    },
    { onConflict: "email" }
  );

  results.push({
    name: "Ricardo",
    email: "ricardo@salao.com",
    status: adminError ? adminError.message : "ok",
  });

  const { data: professionals } = await supabase
    .from("professionals")
    .select("id, name, email")
    .eq("is_active", true);

  if (professionals) {
    for (const prof of professionals) {
      const { error: profError } = await supabase.from("app_users").upsert(
        {
          email: prof.email,
          password_hash: profHash,
          role: "profissional",
          professional_id: prof.id,
          name: prof.name,
        },
        { onConflict: "email" }
      );

      results.push({
        name: prof.name,
        email: prof.email,
        status: profError ? profError.message : "ok",
      });
    }
  }

  return NextResponse.json({ results });
}
