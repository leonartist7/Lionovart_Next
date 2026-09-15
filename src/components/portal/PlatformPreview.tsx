"use client";

import { AlertTriangle, Image as ImageIcon, XCircle } from "lucide-react";
import { PLATFORM_SPECS, type PlatformValidation } from "@/lib/portal/platforms";
import { cn } from "@/lib/utils";

/**
 * One platform's preview — the caption as that platform will actually show it,
 * with its real constraints read out.
 *
 * The truncation is the part that earns the screen: Instagram cuts a feed
 * caption at roughly 125 characters behind a "more", so a caption whose point
 * lands in sentence three is invisible to most of the audience even though it
 * is comfortably inside the 2,200-character limit. Seeing where the fold falls
 * is the whole reason to render four previews instead of one textarea.
 */

/** Characters each platform shows before it collapses the caption behind "more". */
const FOLD_AT: Partial<Record<keyof typeof PLATFORM_SPECS, number>> = {
  instagram: 125,
  facebook: 250,
  linkedin: 210,
};

export interface PreviewMedia {
  assetId: string;
  name: string;
  thumbnailUrl: string | null;
}

export function PlatformPreview({
  validation,
  media,
  className,
}: {
  validation: PlatformValidation;
  media: PreviewMedia[];
  className?: string;
}) {
  const spec = PLATFORM_SPECS[validation.platform];
  const fold = FOLD_AT[validation.platform];
  const over = validation.length > validation.maxChars;
  const near = !over && validation.length > validation.maxChars * 0.9;

  const visible = fold && validation.composed.length > fold ? validation.composed.slice(0, fold) : null;
  const hidden = visible ? validation.composed.slice(visible.length) : null;

  const errors = validation.issues.filter((i) => i.severity === "error");
  const warnings = validation.issues.filter((i) => i.severity === "warning");

  return (
    <section
      className={cn("border-border bg-card rounded-2xl border p-5 md:p-6", className)}
      aria-labelledby={`preview-${validation.platform}`}
    >
      <header className="flex items-baseline justify-between gap-3">
        <h3 id={`preview-${validation.platform}`} className="font-heading text-foreground text-lg font-semibold">
          {spec.label}
        </h3>
        <p
          className={cn(
            "text-xs tabular-nums",
            over ? "text-destructive font-medium" : near ? "text-brand-gold" : "text-muted-foreground",
          )}
        >
          <span className="sr-only">Characters used: </span>
          {validation.length.toLocaleString("en-CA")} / {validation.maxChars.toLocaleString("en-CA")}
        </p>
      </header>

      {media.length > 0 && (
        <div
          className="border-border bg-muted mt-4 overflow-hidden rounded-xl border"
          style={{ aspectRatio: validation.platform === "instagram" ? "4 / 5" : "1.91 / 1" }}
        >
          {media[0].thumbnailUrl ? (
            // Plain img: short-lived signed URL, same as AssetCard.
            <img src={media[0].thumbnailUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-2 p-4">
              <ImageIcon size={18} aria-hidden="true" />
              <p className="max-w-[24ch] truncate text-xs">{media[0].name}</p>
            </div>
          )}
        </div>
      )}

      <p className="text-foreground mt-4 text-[15px] leading-relaxed whitespace-pre-wrap">
        {visible ? (
          <>
            {visible}
            <span className="text-muted-foreground">…</span>{" "}
            <span className="text-muted-foreground text-sm">more</span>
            <span className="sr-only">{hidden}</span>
          </>
        ) : (
          validation.composed || <span className="text-muted-foreground">Nothing written yet.</span>
        )}
      </p>

      {visible && (
        <p className="text-muted-foreground mt-3 text-xs">
          {spec.label} hides everything after the first{" "}
          <span className="tabular-nums">{fold}</span> characters behind “more”.
        </p>
      )}

      {(errors.length > 0 || warnings.length > 0) && (
        <ul className="mt-4 flex flex-col gap-2">
          {errors.map((issue, i) => (
            <li key={`e-${i}`} className="text-destructive flex items-start gap-2 text-sm leading-relaxed">
              <XCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{issue.message}</span>
            </li>
          ))}
          {warnings.map((issue, i) => (
            <li key={`w-${i}`} className="text-muted-foreground flex items-start gap-2 text-sm leading-relaxed">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{issue.message}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
