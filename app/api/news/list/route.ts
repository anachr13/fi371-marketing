import { NextRequest, NextResponse } from "next/server";
import { isNewsCategorySlug, PAGE_SIZE } from "@/lib/news";
import { getNewsPage, decodeCursor } from "@/lib/news.server";

// Public, read-only. Returns the next batch of visible items for the infinite-scroll feed.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");
    const cursorParam = searchParams.get("cursor");
    const limitParam = searchParams.get("limit");

    const category =
      categoryParam && isNewsCategorySlug(categoryParam) ? categoryParam : null;
    const cursor = cursorParam ? decodeCursor(cursorParam) : null;
    const limit = limitParam
      ? Math.min(Math.max(parseInt(limitParam, 10) || PAGE_SIZE, 1), 50)
      : PAGE_SIZE;

    const page = await getNewsPage({ category, cursor, limit });
    return NextResponse.json(page, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (err) {
    console.error("news list error:", err);
    return NextResponse.json({ error: "Failed to load news" }, { status: 500 });
  }
}
