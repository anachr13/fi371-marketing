// Topic filter chips, rendered as links so each filter is a shareable, indexable URL.
import Link from "next/link";
import { NEWS_CATEGORIES, type NewsCategorySlug } from "@/lib/news";

export default function CategoryFilter({ active }: { active: NewsCategorySlug | null }) {
  const chip = (href: string, label: string, isActive: boolean) => (
    <Link
      key={href}
      href={href}
      className={`font-mono text-[12px] px-3 py-1.5 rounded-full border transition-colors ${
        isActive
          ? "bg-foreground text-background border-foreground"
          : "bg-transparent text-muted-foreground border-border hover:border-foreground"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex flex-wrap gap-2 border-t border-border pt-5">
      {chip("/news", "All", active === null)}
      {NEWS_CATEGORIES.map((c) => chip(`/news?category=${c.slug}`, c.label, active === c.slug))}
    </div>
  );
}
