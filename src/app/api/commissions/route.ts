import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") ?? "2024-01-01";
  const endDate = searchParams.get("endDate") ?? "2099-12-31";

  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("price, professional_id, professionals(id, name, commission_pct)")
    .eq("status", "concluido")
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Aggregate by professional
  const byProfessional = new Map<
    string,
    {
      professional: { id: string; name: string; commission_pct: number };
      total: number;
      commission: number;
      count: number;
    }
  >();

  for (const a of appointments ?? []) {
    const prof = a.professionals as unknown as {
      id: string;
      name: string;
      commission_pct: number;
    } | null;
    if (!prof) continue;

    const existing = byProfessional.get(a.professional_id) || {
      professional: prof,
      total: 0,
      commission: 0,
      count: 0,
    };
    existing.total += a.price;
    existing.commission += a.price * (prof.commission_pct / 100);
    existing.count += 1;
    byProfessional.set(a.professional_id, existing);
  }

  return NextResponse.json(Array.from(byProfessional.values()));
}
