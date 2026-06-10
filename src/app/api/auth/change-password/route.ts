import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (session.role !== "profissional") {
    return NextResponse.json(
      { error: "Apenas profissionais podem alterar senha" },
      { status: 403 }
    );
  }

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Senha atual e nova senha obrigatórias" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  const { data: user, error } = await supabase
    .from("app_users")
    .select("*")
    .eq("id", session.userId)
    .single();

  if (error || !user) {
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 404 }
    );
  }

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) {
    return NextResponse.json(
      { error: "Senha atual incorreta" },
      { status: 401 }
    );
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  const { error: updateError } = await supabase
    .from("app_users")
    .update({ password_hash: newHash })
    .eq("id", session.userId);

  if (updateError) {
    return NextResponse.json(
      { error: "Erro ao atualizar senha" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
