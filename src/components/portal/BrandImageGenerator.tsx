"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { BRAND_TEMPLATES, type BrandTemplateId } from "@/lib/portal/brand";

/** Generates and saves a background plate for later design work. */
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
        Generate a background plate with the studio’s colours, light and texture. The saved image has no lettering; add your headline and logo in your design tool before publishing.
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

      {plate && <p className="text-muted-foreground mt-6 text-sm">Saved background: {plate.name}</p>}
    </section>
  );
}
