import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import {
  updateCalendarEvent,
  deleteCalendarEvent,
  isCalendarConfigured,
} from "@/lib/google-calendar";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabase();
  const body = await request.json();
  const { data, error } = await supabase
    .from("appointments")
    .update(body)
    .eq("id", id)
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

    if (profCalendarId && data.google_event_id) {
      await updateCalendarEvent(profCalendarId, data.google_event_id, event);
    }

    const { data: settings } = await supabase
      .from("salon_settings")
      .select("value")
      .eq("key", "master_calendar_id")
      .single();

    if (settings?.value && data.google_master_event_id) {
      await updateCalendarEvent(settings.value, data.google_master_event_id, event);
    }
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabase();

  const { data: appt } = await supabase
    .from("appointments")
    .select("*, professional:professionals(google_calendar_id)")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("appointments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (isCalendarConfigured() && appt) {
    const profCalendarId = (appt.professional as { google_calendar_id: string | null } | null)?.google_calendar_id;

    if (profCalendarId && appt.google_event_id) {
      await deleteCalendarEvent(profCalendarId, appt.google_event_id);
    }

    const { data: settings } = await supabase
      .from("salon_settings")
      .select("value")
      .eq("key", "master_calendar_id")
      .single();

    if (settings?.value && appt.google_master_event_id) {
      await deleteCalendarEvent(settings.value, appt.google_master_event_id);
    }
  }

  return NextResponse.json({ ok: true });
}
