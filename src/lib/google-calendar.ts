import { google } from "googleapis";

type CalendarEvent = {
  summary: string;
  description?: string;
  start: string; // ISO date
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location?: string;
};

function getAuth() {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!key) return null;

  try {
    const credentials = JSON.parse(key);
    return new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });
  } catch {
    console.error("Invalid GOOGLE_SERVICE_ACCOUNT_KEY JSON");
    return null;
  }
}

function buildEventBody(event: CalendarEvent) {
  const timeZone = "America/Sao_Paulo";
  return {
    summary: event.summary,
    description: event.description || "",
    start: {
      dateTime: `${event.start}T${event.startTime}:00`,
      timeZone,
    },
    end: {
      dateTime: `${event.start}T${event.endTime}:00`,
      timeZone,
    },
    location: event.location || "",
  };
}

export async function createCalendarEvent(
  calendarId: string,
  event: CalendarEvent
): Promise<string | null> {
  const auth = getAuth();
  if (!auth || !calendarId) return null;

  try {
    const calendar = google.calendar({ version: "v3", auth });
    const res = await calendar.events.insert({
      calendarId,
      requestBody: buildEventBody(event),
    });
    return res.data.id || null;
  } catch (err) {
    console.error("Google Calendar create error:", calendarId, err);
    return null;
  }
}

export async function updateCalendarEvent(
  calendarId: string,
  eventId: string,
  event: CalendarEvent
): Promise<boolean> {
  const auth = getAuth();
  if (!auth || !calendarId || !eventId) return false;

  try {
    const calendar = google.calendar({ version: "v3", auth });
    await calendar.events.update({
      calendarId,
      eventId,
      requestBody: buildEventBody(event),
    });
    return true;
  } catch (err) {
    console.error("Google Calendar update error:", calendarId, err);
    return false;
  }
}

export async function deleteCalendarEvent(
  calendarId: string,
  eventId: string
): Promise<boolean> {
  const auth = getAuth();
  if (!auth || !calendarId || !eventId) return false;

  try {
    const calendar = google.calendar({ version: "v3", auth });
    await calendar.events.delete({ calendarId, eventId });
    return true;
  } catch (err) {
    console.error("Google Calendar delete error:", calendarId, err);
    return false;
  }
}

export function isCalendarConfigured(): boolean {
  return !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
}
