import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_SPECS, POST_STATE_LABELS, POST_STATE_ORDER } from "@/lib/portal/platforms";
import { formatDate, relativeDate } from "@/lib/portal/format";
import type { Post } from "@/lib/portal/types";

/**
 * The pipeline, read top to bottom in the order work needs attention —
 * what's waiting on a decision first, ideas last. Not a kanban: a phone can't
 * show five columns, and the ordering here carries more information than
 * left-to-right would.
 *
 * A server component. Everything it renders is already filtered by
 * `listPosts`, so a client is never sent an idea or a draft to hide.
 */
export function ContentPipeline({
  posts,
  workspaceSlug,
  isAgency,
  basePath,
}: {
  posts: Post[];
  workspaceSlug: string;
  isAgency: boolean;
  basePath?: string;
}) {
  const root = basePath ?? `/portal/${workspaceSlug}/content`;
  const groups = POST_STATE_ORDER.map((state) => ({
    state,
    posts: posts.filter((p) => p.state === state),
  })).filter((g) => g.posts.length > 0);

  if (groups.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => {
        const meta = POST_STATE_LABELS[group.state];
        return (
          <section key={group.state}>
            <h2 className="text-muted-foreground mb-3 text-sm font-medium">
              {isAgency ? meta.label : meta.clientLabel}
            </h2>
            <ul className="flex flex-col gap-3">
              {group.posts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`${root}/${post.id}`}
                    className="border-border bg-card hover:border-primary/40 block rounded-2xl border p-5 transition-[border-color,transform] duration-150 ease-out active:scale-[0.99] focus-visible:ring-3 focus-visible:ring-primary/50 focus-visible:outline-none md:p-6"
                  >
                    <p className="text-foreground text-[15px] leading-relaxed">
                      {firstLine(post.caption)}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge variant={meta.badge}>{isAgency ? meta.label : meta.clientLabel}</Badge>
                      {post.platforms.map((platform) => (
                        <Badge key={platform} variant="outline">
                          {PLATFORM_SPECS[platform].label}
                        </Badge>
                      ))}
                      {post.scheduledFor && (
                        <span className="text-muted-foreground text-xs tabular-nums">
                          {formatDate(post.scheduledFor)} · {relativeDate(post.scheduledFor)}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function firstLine(caption: string): string {
  const line = caption.trim().split("\n")[0] ?? "";
  if (!line) return "Untitled post";
  return line.length > 110 ? `${line.slice(0, 109)}…` : line;
}
