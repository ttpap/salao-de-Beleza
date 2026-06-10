import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabase } from "@/lib/supabase";
import { setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const { login, password } = await request.json();

  if (!login || !password) {
    return NextResponse.json(
      { error: "Login e senha obrigatórios" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  const isEmail = login.includes("@");
  let query = supabase.from("app_users").select("*");

  if (isEmail) {
    query = query.ilike("email", login);
  } else {
    query = query.ilike("name", login);
  }

  const { data: user, error } = await query.single();

  if (error || !user) {
    return NextResponse.json(
      { error: "Usuário ou senha inválidos" },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json(
      { error: "Usuário ou senha inválidos" },
      { status: 401 }
    );
  }

  await setSessionCookie({
    userId: user.id,
    role: user.role,
    professionalId: user.professional_id,
    name: user.name,
  });

  return NextResponse.json({
    user: {
      id: user.id,
      role: user.role,
      professional_id: user.professional_id,
      name: user.name,
    },
  });
}
