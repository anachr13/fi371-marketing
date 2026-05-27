// Server-only helpers for the single-password admin gate. NOT a server-actions file:
// these are plain functions used by the page + the actions.
import { cookies } from "next/headers";
import { createHmac } from "crypto";

const COOKIE = "ap_admin";

// Token the cookie must hold: HMAC over a fixed string, keyed by the admin password.
// Unguessable without the password; changing the password invalidates old cookies.
export function expectedToken(): string | null {
  const pw = process.env.NEWS_ADMIN_PASSWORD;
  if (!pw) return null;
  return createHmac("sha256", pw).update("audit-pulse-admin").digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  const token = expectedToken();
  if (!token) return false;
  const jar = await cookies();
  return jar.get(COOKIE)?.value === token;
}

export async function setAdminCookie(): Promise<void> {
  const token = expectedToken();
  if (!token) return;
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin/news",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearAdminCookie(): Promise<void> {
  const jar = await cookies();
  // Expire on the same path it was set with (delete() with a custom path is version-sensitive).
  jar.set(COOKIE, "", { path: "/admin/news", maxAge: 0 });
}
