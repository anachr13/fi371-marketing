"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { setHidden } from "@/lib/news.server";
import { expectedToken, setAdminCookie, clearAdminCookie } from "./auth";

export async function login(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  if (expectedToken() && password === process.env.NEWS_ADMIN_PASSWORD) {
    await setAdminCookie();
    redirect("/admin/news");
  }
  redirect("/admin/news?error=1");
}

export async function logout(): Promise<void> {
  await clearAdminCookie();
  redirect("/admin/news");
}

export async function toggleHidden(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const hidden = String(formData.get("hidden") ?? "") === "true";
  if (id) {
    await setHidden(id, hidden);
    revalidatePath("/admin/news");
    revalidatePath("/news");
  }
}
