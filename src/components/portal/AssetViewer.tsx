import { FileText } from "lucide-react";
import { PinchZoomImage } from "@/components/portal/PinchZoomImage";
import { buttonVariants } from "@/components/ui/button";
import type { AssetKind } from "@/lib/portal/types";
import { cn } from "@/lib/utils";

/**
 * Renders whatever the file actually is. Images get the pinch-zoom viewer —
 * the box it leaves behind is what Phase 4's annotation pins will normalize
 * coordinates against. Everything else gets a plain, honest "can't preview
 * this here" rather than pretending to embed a PDF badly.
 */
export function AssetViewer({ kind, url, name }: { kind: AssetKind; url: string; name: string }) {
  if (kind === "image") return <PinchZoomImage src={url} alt={name} />;

  if (kind === "video") {
    return (
      <video
        src={url}
        controls
        className="bg-muted w-full rounded-2xl"
        style={{ maxHeight: "min(70vh, 640px)" }}
      />
    );
  }

  return (
    <div className="border-border bg-muted flex flex-col items-center justify-center gap-3 rounded-2xl border p-12 text-center">
      <FileText size={32} className="text-muted-foreground" aria-hidden="true" />
      <p className="text-muted-foreground text-sm">Preview isn&apos;t available for this file type.</p>
      {url && (
        <a href={url} download={name} className={cn(buttonVariants({ variant: "outline" }))}>
          Download to view
        </a>
      )}
    </div>
  );
}
