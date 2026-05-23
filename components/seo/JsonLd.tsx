// Server component that emits a JSON-LD structured-data <script> tag.
// Structured data helps Google AND AI engines (ChatGPT, Perplexity, Gemini)
// understand and cite Fi371 as an entity. Created 2026-05-23.

/**
 * Renders one <script type="application/ld+json"> block.
 * Escapes "<" as "<" before injection to prevent XSS from any
 * interpolated string (per Next.js JSON-LD guidance). Never feed unsanitised
 * user input here without that escape.
 * @param data A schema.org object (or @graph wrapper) to serialise.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
