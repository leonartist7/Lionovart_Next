/**
 * JsonLd — renders one or more schema.org objects as a <script type=
 * "application/ld+json">. Server-safe; emits into the SSR HTML so crawlers
 * and AI answer engines see structured data without executing JS.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(Array.isArray(data) ? data : [data]);
  return (
    <script
      type="application/ld+json"
      // Schema is built from trusted, in-repo config — no user input.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
