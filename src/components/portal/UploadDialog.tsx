"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, UploadCloud } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const ACCEPT =
  "image/png,image/jpeg,image/webp,image/gif,image/svg+xml,video/mp4,video/quicktime,application/pdf,.doc,.docx,.xlsx,.zip";

/** PUTs directly to the signed URL, reporting real progress via XHR — fetch has no upload-progress event. */
function putFile(url: string, file: File, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("upload failed")));
    xhr.onerror = () => reject(new Error("upload failed"));
    xhr.send(file);
  });
}

/**
 * Uploads a file: sign → PUT to Storage → confirm. Bytes never route through
 * this app's server — see `sign-upload` and `[assetId]/versions`.
 *
 * Same component for a brand-new asset and a new version of an existing one —
 * pass `assetId` for the latter, which also switches the trigger from the
 * dashed "add" tile to a plain button.
 */
export function UploadDialog({
  workspaceSlug,
  assetId,
  demo = false,
}: {
  workspaceSlug: string;
  assetId?: string;
  demo?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setFile(null);
    setNote("");
    setProgress(null);
    setError(null);
  }

  async function upload() {
    if (!file) return;
    if (demo) {
      toast.add({ title: "Preview only", description: "Uploads aren't saved here." });
      setOpen(false);
      return;
    }

    setError(null);
    setProgress(0);
    try {
      const signRes = await fetch(`/api/portal/${workspaceSlug}/assets/sign-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId, name: file.name, mime: file.type, sizeBytes: file.size }),
      });
      const signed = await signRes.json();
      if (!signRes.ok) throw new Error(signed.error ?? "Couldn't start the upload.");

      await putFile(signed.uploadUrl, file, setProgress);

      const confirmRes = await fetch(
        `/api/portal/${workspaceSlug}/assets/${signed.assetId}/versions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            version: signed.version,
            storagePath: signed.storagePath,
            name: file.name,
            mime: file.type,
            sizeBytes: file.size,
            note: note.trim() || undefined,
          }),
        },
      );
      if (!confirmRes.ok) {
        const body = await confirmRes.json().catch(() => ({}));
        throw new Error(body.error ?? "Couldn't finish the upload.");
      }

      toast.add({
        title: assetId ? "New version uploaded" : "File uploaded",
        description: file.name,
      });
      setOpen(false);
      reset();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't upload that file.");
    } finally {
      setProgress(null);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger
        className={
          assetId
            ? cn(buttonVariants({ variant: "outline", size: "lg" }))
            : cn(
                "border-border text-muted-foreground hover:text-foreground hover:border-primary/40 flex min-h-[7rem] w-full items-center justify-center gap-2 rounded-2xl border border-dashed p-6 text-sm font-medium",
                "transition-[color,border-color,transform] duration-150 ease-out active:scale-[0.99]",
                "focus-visible:ring-primary/50 focus-visible:ring-3 focus-visible:outline-none",
              )
        }
      >
        {assetId ? (
          <>
            <UploadCloud size={15} aria-hidden="true" />
            Upload new version
          </>
        ) : (
          <>
            <Plus size={16} aria-hidden="true" />
            Upload files
          </>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{assetId ? "Upload a new version" : "Upload a file"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel>File</FieldLabel>
            <input
              type="file"
              accept={ACCEPT}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-foreground file:border-border file:bg-muted file:text-foreground file:mr-3 file:rounded-lg file:border file:px-3 file:py-1.5 file:text-sm text-sm"
            />
            <FieldDescription>Up to 25MB. Images, video, PDF, and common documents.</FieldDescription>
          </Field>

          {assetId && (
            <Field>
              <FieldLabel>Note (optional)</FieldLabel>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What changed in this version?"
                rows={2}
              />
            </Field>
          )}

          {progress !== null && (
            <div>
              <Progress value={progress} aria-label="Upload progress" />
              <p className="text-muted-foreground mt-1.5 text-xs tabular-nums">{progress}%</p>
            </div>
          )}

          {error && (
            <p role="alert" className="text-destructive text-sm leading-relaxed">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" size="lg" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" size="lg" onClick={upload} disabled={!file || progress !== null}>
            {progress !== null ? `Uploading… ${progress}%` : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
