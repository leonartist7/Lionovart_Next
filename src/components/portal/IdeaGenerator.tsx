"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { PLATFORM_LIST } from "@/lib/portal/platforms";
import type { Platform } from "@/lib/portal/types";
import { cn } from "@/lib/utils";

interface Idea {
  caption: string;
  hashtags: string[];
  platforms: Platform[];
  rationale: string;
}

/**
 * Agency-only idea generation.
 *
 * Generating does not write anything — the ideas come back and the studio
 * picks. Saving one is the ordinary `POST /content`, so a post has a single
 * write path whether a person or a model wrote the first draft of it, and
 * nothing a model produced reaches a client without someone choosing it.
 */
export function IdeaGenerator({ workspaceSlug }: { workspaceSlug: string }) {
  const router = useRouter();
  const toast = useToast();
  const [brief, setBrief] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>(["instagram", "linkedin"]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/portal/${workspaceSlug}/content/ai/ideas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brief, platforms, count: 4 }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Couldn't generate ideas.");
      return;
    }
    setIdeas(data.ideas ?? []);
  }

  async function save(idea: Idea, index: number) {
    setSaving(index);
    const res = await fetch(`/api/portal/${workspaceSlug}/content`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...idea, state: "idea" }),
    });
    setSaving(null);
    if (!res.ok) {
      setError("Couldn't save that idea.");
      return;
    }
    setIdeas((current) => current.filter((_, i) => i !== index));
    toast.add({ title: "Saved as an idea" });
    router.refresh();
  }

  return (
    <section className="border-border bg-card rounded-2xl border p-5 md:p-6">
      <h2 className="font-heading text-foreground text-lg font-semibold">Generate ideas</h2>
      <p className="text-muted-foreground mt-2 max-w-xl text-[15px] leading-relaxed">
        Written from this workspace’s real projects and milestones. Nothing is saved until you pick one.
      </p>

      <div className="mt-5 flex max-w-xl flex-col gap-4">
        <Field>
          <FieldLabel>Steer</FieldLabel>
          <Input
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Optional — “the rebrand launch”, “behind the scenes”"
          />
        </Field>

        <fieldset>
          <legend className="text-muted-foreground mb-3 text-sm font-medium">For</legend>
          <div className="flex flex-wrap gap-2">
            {PLATFORM_LIST.map((spec) => {
              const on = platforms.includes(spec.id);
              return (
                <button
                  key={spec.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setPlatforms((current) =>
                      current.includes(spec.id)
                        ? current.filter((p) => p !== spec.id)
                        : [...current, spec.id],
                    )
                  }
                  className={cn(
                    "min-h-11 rounded-xl border px-4 text-sm font-medium",
                    "transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.985]",
                    "focus-visible:ring-primary/50 focus-visible:ring-3 focus-visible:outline-none",
                    on ? "border-primary/40 bg-primary/12 text-primary" : "border-border text-muted-foreground",
                  )}
                >
                  {spec.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {error && (
          <p role="alert" className="text-destructive text-sm leading-relaxed">
            {error}
          </p>
        )}

        <div>
          <Button type="button" size="lg" disabled={busy || platforms.length === 0} onClick={generate}>
            {busy ? "Writing…" : "Generate ideas"}
          </Button>
        </div>
      </div>

      {ideas.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {ideas.map((idea, i) => (
            <li key={i} className="border-border rounded-xl border p-4">
              <p className="text-foreground text-[15px] leading-relaxed whitespace-pre-wrap">
                {idea.caption}
              </p>
              {idea.hashtags.length > 0 && (
                <p className="text-primary mt-2 text-sm">{idea.hashtags.join(" ")}</p>
              )}
              {idea.rationale && (
                <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{idea.rationale}</p>
              )}
              <div className="mt-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={saving === i}
                  onClick={() => save(idea, i)}
                >
                  Keep this idea
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
