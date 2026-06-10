import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { createCalendarEvent, isCalendarConfigured } from "@/lib/google-calendar";

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
    .select("*, client:clients(*), professional:professionals(*), service:services(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (isCalendarConfigured() && data) {
    const event = {
      summary: `${data.client?.name} — ${data.service?.name}`,
      description: `Profissional: ${data.professional?.name}\nServiço: ${data.service?.name}\nPreço: R$ ${data.price}\n${data.notes || ""}`,
      start: data.date,
      startTime: data.start_time.slice(0, 5),
      endTime: data.end_time.slice(0, 5),
    };

    const profCalendarId = data.professional?.google_calendar_id;
    const updates: Record<string, string> = {};

    if (profCalendarId) {
      const eventId = await createCalendarEvent(profCalendarId, event);
      if (eventId) updates.google_event_id = eventId;
    }

    const { data: settings } = await supabase
      .from("salon_settings")
      .select("value")
      .eq("key", "master_calendar_id")
      .single();

    if (settings?.value) {
      const masterEventId = await createCalendarEvent(settings.value, event);
      if (masterEventId) updates.google_master_event_id = masterEventId;
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from("appointments").update(updates).eq("id", data.id);
      Object.assign(data, updates);
    }
  }

  return NextResponse.json(data, { status: 201 });
}
