import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();
  const today = new Date().toISOString().split("T")[0];

  const [appointmentsRes, clientsRes, professionalsRes] = await Promise.all([
    supabase.from("appointments").select("status, price").eq("date", today),
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase
      .from("professionals")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
  ]);

  if (appointmentsRes.error) {
    return NextResponse.json(
      { error: appointmentsRes.error.message },
      { status: 500 }
    );
  }

  const todayAppts = appointmentsRes.data ?? [];
  const completed = todayAppts.filter((a) => a.status === "concluido");
  const revenue = completed.reduce((sum, a) => sum + a.price, 0);

  return NextResponse.json({
    todayTotal: todayAppts.length,
    todayCompleted: completed.length,
    todayPending: todayAppts.filter(
      (a) => a.status === "agendado" || a.status === "confirmado"
    ).length,
    todayRevenue: revenue,
    totalClients: clientsRes.count ?? 0,
    activeProfessionals: professionalsRes.count ?? 0,
  });
}
