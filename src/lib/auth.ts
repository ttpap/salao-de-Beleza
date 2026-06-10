import { cookies } from "next/headers";

export type SessionData = {
  userId: string;
  role: "admin" | "profissional";
  professionalId: string | null;
  name: string;
};

const SECRET = process.env.AUTH_SECRET || "salao-beleza-secret-2024-xk9m";

async function hmacSign(data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacVerify(data: string, signature: string): Promise<boolean> {
  const expected = await hmacSign(data);
  return expected === signature;
}

export async function createSessionToken(data: SessionData): Promise<string> {
  const json = JSON.stringify(data);
  const b64 = btoa(json);
  const sig = await hmacSign(b64);
  return `${b64}.${sig}`;
}

export async function verifySessionToken(
  token: string
): Promise<SessionData | null> {
  const dotIdx = token.indexOf(".");
  if (dotIdx === -1) return null;
  const b64 = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  if (!(await hmacVerify(b64, sig))) return null;
  try {
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(data: SessionData): Promise<string> {
  const token = await createSessionToken(data);
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return token;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
