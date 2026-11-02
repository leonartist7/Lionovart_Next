"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ExternalLink, Link2, LockKeyhole, Pencil, Plus, Trash2 } from "lucide-react";
import { MAX_RESOURCE_LINKS, validateResourceLink, type ResourceLink } from "@/lib/portal/resource-links";

export function ResourceLinksPanel({ initialLinks, canManage, endpoint, demo = false }: {
  initialLinks: ResourceLink[]; canManage: boolean; endpoint?: string; demo?: boolean;
}) {
  const [links, setLinks] = useState(initialLinks);
  const [editing, setEditing] = useState(false);
  const [editingLink, setEditingLink] = useState<ResourceLink | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) nameRef.current?.focus(); }, [editing, editingLink]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !canManage) return;
    setError(""); setNotice("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const input = validateResourceLink({ label: data.get("label"), url: data.get("url"), visibility: data.get("visibility") });
      if (!editingLink && links.length >= MAX_RESOURCE_LINKS) throw new Error("The workspace has reached its 40-resource limit.");
      if (links.some(link => link.id !== editingLink?.id && link.url === input.url)) throw new Error("This resource is already saved.");
      if (editingLink && editingLink.label === input.label && editingLink.url === input.url && editingLink.visibility === input.visibility) {
        setNotice("No changes to save."); return;
      }
      const sharing = input.visibility === "shared" && (!editingLink || editingLink.visibility === "internal");
      if (sharing && !window.confirm("Share this link with everyone in this workspace? The original provider still controls file access.")) return;
      setBusy(true);
      let link: ResourceLink;
      if (demo) link = { ...input, id: editingLink?.id ?? crypto.randomUUID(), createdAt: editingLink?.createdAt ?? new Date().toISOString() };
      else {
        if (!endpoint) throw new Error("Resource management is unavailable.");
        const response = await fetch(endpoint, {
          method: editingLink ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(editingLink ? {
            id: editingLink.id,
            expected: { label: editingLink.label, url: editingLink.url, visibility: editingLink.visibility },
            resource: input,
            confirmShare: sharing,
          } : input),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "The resource could not be saved.");
        link = result.link;
      }
      if (editingLink) setLinks(current => current.map(item => item.id === editingLink.id ? link : item));
      else setLinks(current => [...current, link]);
      const wasEditing = Boolean(editingLink);
      setEditingLink(null); setEditing(false); form.reset();
      setNotice(demo ? "Preview changed only. Reloading clears edits." : wasEditing ? "Resource updated in this workspace." : "Resource saved to this workspace.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The resource could not be saved."); }
    finally { setBusy(false); }
  }
  async function remove(link: ResourceLink) {
    if (busy || !canManage || !window.confirm(`Remove “${link.label}” from this workspace? The original file will not be deleted.`)) return;
    setBusy(true); setError(""); setNotice("");
    try {
      if (!demo) {
        if (!endpoint) throw new Error("Resource management is unavailable.");
        const response = await fetch(endpoint, { method: "DELETE", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ id: link.id }) });
        if (!response.ok) { const result = await response.json(); throw new Error(result.error || "The resource could not be removed."); }
      }
      setLinks(current => current.filter(item => item.id !== link.id));
      if (editingLink?.id === link.id) { setEditingLink(null); setEditing(false); }
      setNotice("Resource removed. The original file has not been changed.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The resource could not be removed."); }
    finally { setBusy(false); }
  }
  const fieldClass = "border-border bg-background text-foreground mt-2 min-h-11 w-full min-w-0 rounded-xl border px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-offset-2";
  return (
    <section className="border-border bg-card rounded-2xl border p-5 md:p-7" aria-labelledby="resource-links-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 id="resource-links-heading" className="text-foreground text-lg font-semibold">Project resources</h2>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">Keep Drive folders, Figma designs, Notion pages, GitHub repositories, and Vercel previews together. These are links—not account connections or file imports.</p>
        </div>
        {canManage && <button type="button" onClick={() => { setEditingLink(null); setEditing(value => !value); }} aria-expanded={editing} aria-controls="resource-link-form" disabled={busy}
          className="border-border text-foreground inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60">
          <Plus className="h-4 w-4" aria-hidden="true" />{editing ? "Close form" : "Add resource"}
        </button>}
      </div>
      {demo && <p className="text-muted-foreground border-border mt-4 border-l-2 pl-3 text-sm">Preview only. Changes stay on this page and never reach a real workspace.</p>}
      {editing && canManage && <form key={editingLink?.id ?? "new"} id="resource-link-form" onSubmit={add} className="border-border mt-6 border-t pt-5">
        <fieldset disabled={busy} className="min-w-0 space-y-4">
          <legend className="sr-only">{editingLink ? "Edit project resource" : "Add a project resource"}</legend>
          <label className="text-foreground block text-sm font-medium">Name<input ref={nameRef} name="label" required maxLength={80} defaultValue={editingLink?.label} autoComplete="off" placeholder="Brand identity · Figma" className={fieldClass}/></label>
          <label className="text-foreground block text-sm font-medium">Resource URL<input name="url" type="url" required maxLength={2048} defaultValue={editingLink?.url} autoComplete="off" placeholder="https://…" aria-describedby="resource-url-help" className={fieldClass}/></label>
          <p id="resource-url-help" className="text-muted-foreground text-sm">Never paste passwords, API keys, or preview-protection bypass links. Access permissions remain controlled by the original provider.</p>
          <label className="text-foreground block text-sm font-medium">Visible to<select name="visibility" defaultValue={editingLink?.visibility ?? "internal"} className={fieldClass}><option value="internal">Studio only</option><option value="shared">Everyone in this workspace</option></select></label>
          <button type="submit" className="bg-foreground text-background min-h-11 rounded-full px-5 py-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60">{busy ? "Saving…" : editingLink ? "Save changes" : demo ? "Add to preview" : "Save resource"}</button>
        </fieldset>
      </form>}
      {error && <p role="alert" className="text-foreground mt-4 text-sm">{error}</p>}
      {notice && <p role="status" className="text-muted-foreground mt-4 text-sm">{notice}</p>}
      <ul className="mt-5 space-y-3" aria-label="Saved resources">
        {links.map(link => <li key={link.id} className="border-border flex min-w-0 items-center gap-2 rounded-xl border p-3">
          <Link2 className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true"/>
          <a href={link.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="min-w-0 flex-1 rounded-md py-1 focus-visible:outline-2 focus-visible:outline-offset-4">
            <span className="text-foreground block break-words text-sm font-medium">{link.label}<ExternalLink className="ml-2 inline h-3.5 w-3.5" aria-hidden="true"/><span className="sr-only"> (opens in a new tab)</span></span>
            <span className="text-muted-foreground mt-1 block text-xs">{link.provider}{link.visibility === "internal" ? " · Studio only" : " · Shared with workspace"}</span>
          </a>
          {link.visibility === "internal" && <LockKeyhole className="text-muted-foreground h-4 w-4 shrink-0" aria-label="Studio only"/>}
          {canManage && <button type="button" disabled={busy} onClick={() => { setEditingLink(link); setEditing(true); setError(""); setNotice(""); }} aria-label={"Edit " + link.label} className="text-muted-foreground flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"><Pencil className="h-4 w-4" aria-hidden="true"/></button>}
          {canManage && <button type="button" disabled={busy} onClick={() => remove(link)} aria-label={`Remove ${link.label}`} className="text-muted-foreground flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"><Trash2 className="h-4 w-4" aria-hidden="true"/></button>}
        </li>)}
      </ul>
      {links.length === 0 && <p className="text-muted-foreground mt-6 text-sm leading-relaxed">{canManage ? "No resources yet. Add the links your team returns to most often." : "Your studio has not shared any project resources here yet."}</p>}
    </section>
  );
}
