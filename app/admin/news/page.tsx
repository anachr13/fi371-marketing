// Private hide/unhide tool. The public /news page is never gated; only this page requires
// the single password.
import { isAdmin } from "./auth";
import { login, logout, toggleHidden } from "./actions";
import { getAdminRecentItems } from "@/lib/news.server";
import { categoryLabel } from "@/lib/news";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const authed = await isAdmin();

  if (!authed) {
    const { error } = await searchParams;
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
        <form action={login} className="w-full max-w-sm">
          <h1 className="font-display text-[32px] mb-2">Audit Pulse admin</h1>
          <p className="text-muted-foreground text-[15px] mb-6">Enter the admin password.</p>
          <input
            type="password"
            name="password"
            autoFocus
            className="w-full rounded-lg border border-border bg-card px-4 py-3 mb-3"
            placeholder="Password"
          />
          {error ? <p className="text-destructive text-[14px] mb-3">Wrong password.</p> : null}
          <button
            type="submit"
            className="w-full rounded-lg bg-primary text-primary-foreground font-semibold py-3"
          >
            Sign in
          </button>
        </form>
      </main>
    );
  }

  const items = await getAdminRecentItems(100);

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-[900px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-[40px]">Audit Pulse — hide control</h1>
          <form action={logout}>
            <button className="font-mono text-[13px] text-muted-foreground hover:text-foreground">
              Sign out
            </button>
          </form>
        </div>

        {items.length === 0 ? (
          <p className="text-muted-foreground text-[17px]">No items yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-4 py-3">
                <span
                  className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                    it.hidden
                      ? "border-destructive text-destructive"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {it.hidden ? "HIDDEN" : "LIVE"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium truncate">{it.title}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {it.sourceName} · {categoryLabel(it.category)}
                  </p>
                </div>
                <form action={toggleHidden}>
                  <input type="hidden" name="id" value={it.id} />
                  <input type="hidden" name="hidden" value={String(!it.hidden)} />
                  <button className="font-mono text-[12px] px-3 py-1.5 rounded-full border border-foreground hover:bg-foreground hover:text-background transition-colors">
                    {it.hidden ? "Unhide" : "Hide"}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
