"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { BRAND_TEMPLATES, type BrandTemplateId } from "@/lib/portal/brand";
import { cn } from "@/lib/utils";

/**
 * On-brand image generation, and an honest account of what it does.
 *
 * Gemini generates the **plate** — colour, light, material, composition — and
 * is told to render no text whatsoever. The headline, the rule and the
 * wordmark are laid over it here as real type in the studio's own typeface at
 * the studio's own red. That split is the whole design: an image model holds a
 * palette and a mood reliably, and does not hold Clash Display at a specific
 * weight and tracking. Letting it try produces the almost-right lettering that
 * reads as generated, which is exactly what `PORTAL_DESIGN.md`'s forbidden
 * list is about.
 *
 * So what this ships is a composite whose type is genuinely the brand's, over
 * a plate that is genuinely on-palette — rather than one generated image that
 * is neither.
 */
export function BrandImageGenerator({
  workspaceSlug,
  onAttach,
}: {
  workspaceSlug: string;
  onAttach?: (assetId: string) => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [template, setTemplate] = useState<BrandTemplateId>("square");
  const [subject, setSubject] = useState("");
  const [headline, setHeadline] = useState("");
  const [plate, setPlate] = useState<{ assetId: string; name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const spec = BRAND_TEMPLATES.find((t) => t.id === template)!;

  async function generate() {
    setBusy(true);
    setError(null);
    setPlate(null);
    const res = await fetch(`/api/portal/${workspaceSlug}/content/ai/image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, template }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Couldn't generate that.");
      return;
    }
    setPlate({ assetId: data.asset.id, name: data.asset.name });
    toast.add({ title: "Plate generated", description: "It's in Files, ready to attach." });
    router.refresh();
  }

  return (
    <section className="border-border bg-card rounded-2xl border p-5 md:p-6">
      <h2 className="font-heading text-foreground text-lg font-semibold">Generate an image</h2>
      <p className="text-muted-foreground mt-2 max-w-xl text-[15px] leading-relaxed">
        The model makes the plate — colour, light, texture, no lettering. The headline and the mark
        are set in the studio’s own type over the top, because a generated typeface is never quite
        the studio’s.
      </p>

      <div className="mt-5 flex max-w-xl flex-col gap-4">
        <Field>
          <FieldLabel>Template</FieldLabel>
          <Select value={template} onValueChange={(v) => setTemplate((v ?? "square") as BrandTemplateId)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BRAND_TEMPLATES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label} — {t.width}×{t.height}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground mt-2 text-xs">{spec.note}</p>
        </Field>

        <Field>
          <FieldLabel>What it shows</FieldLabel>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Letterpress proofs drying under a single lamp"
          />
        </Field>

        <Field>
          <FieldLabel>Headline</FieldLabel>
          <Input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Set over the plate, in Clash Display"
          />
        </Field>

        {error && (
          <p role="alert" className="text-destructive text-sm leading-relaxed">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="lg" disabled={busy || !subject.trim()} onClick={generate}>
            {busy ? "Generating…" : "Generate plate"}
          </Button>
          {plate && onAttach && (
            <Button type="button" size="lg" variant="outline" onClick={() => onAttach(plate.assetId)}>
              Attach to this post
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 max-w-sm">
        <BrandOverlayPreview
          headline={headline}
          width={spec.width}
          height={spec.height}
          plateName={plate?.name ?? null}
        />
      </div>
    </section>
  );
}

/**
 * The template's type layer, at the real aspect ratio.
 *
 * Brand utilities (`bg-brand-red`, `text-brand-gold`) rather than semantic
 * tokens: this is artwork, not chrome. A social graphic is the same in light
 * mode and dark mode because it leaves the portal entirely.
 */
function BrandOverlayPreview({
  headline,
  width,
  height,
  plateName,
}: {
  headline: string;
  width: number;
  height: number;
  plateName: string | null;
}) {
  return (
    <figure>
      <div
        className={cn(
          "border-border relative isolate w-full overflow-hidden rounded-xl border",
          "bg-bg-brand-black",
        )}
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        {plateName ? (
          // The plate is a private asset — the composer shows it once it's
          // attached and has a signed URL. Here, name it rather than imply a
          // preview that isn't loaded.
          <p className="text-text-muted absolute inset-x-0 bottom-0 truncate p-3 text-[11px]">
            {plateName}
          </p>
        ) : null}

        <div className="absolute inset-0 flex flex-col justify-between p-[6%]">
          <p className="font-heading text-[clamp(1.1rem,5cqw,2rem)] leading-[1.05] font-bold tracking-[-0.025em] text-white">
            {headline.trim() || "Your headline sits here"}
          </p>
          <div>
            <span className="bg-brand-red block h-[3px] w-10 rounded-full" />
            <p className="mt-3 text-[10px] font-medium tracking-[0.16em] text-white/80 uppercase">
              Lionovart
            </p>
          </div>
        </div>
      </div>
      <figcaption className="text-muted-foreground mt-2 text-xs">
        {width}×{height} · type set over the generated plate
      </figcaption>
    </figure>
  );
}
