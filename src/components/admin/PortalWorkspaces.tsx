"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Plus, Send } from "lucide-react";
import { PORTAL_ROLES, type PortalRole } from "@/lib/portal/types";

export interface AdminWorkspace {
  id: string;
  name: string;
  slug: string;
  clientCompany?: string | null;
  memberCount: number;
  createdAt: string;
}

export interface AdminInvite {
  id: string;
  workspaceId: string;
  email: string;
  role: PortalRole;
  expiresAt: string;
  acceptedAt?: string;
}

const INVITABLE_ROLES = PORTAL_ROLES.filter((r) => r !== "agency");

const ROLE_LABELS: Record<string, string> = {
  client_owner: "Owner — full access, can approve",
  approver: "Approver — can approve work",
  collaborator: "Collaborator — can comment and upload",
  viewer: "Viewer — read only",
};

export function PortalWorkspaces({
  workspaces,
  invites,
}: {
  workspaces: AdminWorkspace[];
  invites: AdminInvite[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function createWorkspace(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    const res = await fetch("/api/portal/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, clientCompany: company }),
    });
    setCreating(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Couldn't create the workspace.");
      return;
    }
    setName("");
    setCompany("");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-[var(--font-clash)] text-xl font-semibold text-white">
          Client portal
        </h1>
        <p className="mt-1 text-sm text-white/45">
          Create a workspace, then invite the client. They sign in with the address you invite.
        </p>
      </header>

      {/* ── Create ────────────────────────────────────────────── */}
      <form
        onSubmit={createWorkspace}
        className="rounded-xl border border-white/8 bg-[#0c0c0c] p-5"
      >
        <p className="mb-4 text-xs tracking-[0.18em] text-white/40 uppercase">New workspace</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Workspace name"
            value={name}
            onChange={setName}
            placeholder="Northwind Rebrand"
            required
          />
          <Field
            label="Client company (optional)"
            value={company}
            onChange={setCompany}
            placeholder="Northwind Coffee Co."
          />
        </div>
        <button
          type="submit"
          disabled={creating || !name.trim()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand-red)] px-4 py-2 text-sm font-medium text-white transition-opacity disabled:pointer-events-none disabled:opacity-40"
        >
          <Plus size={15} aria-hidden="true" />
          {creating ? "Creating…" : "Create workspace"}
        </button>
        {error && <p className="mt-3 text-sm text-[var(--color-brand-red)]">{error}</p>}
      </form>

      {/* ── List ──────────────────────────────────────────────── */}
      {workspaces.length === 0 ? (
        <p className="text-sm text-white/40">No client workspaces yet.</p>
      ) : (
        <ul className="space-y-4">
          {workspaces.map((ws) => (
            <WorkspaceCard
              key={ws.id}
              workspace={ws}
              invites={invites.filter((i) => i.workspaceId === ws.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function WorkspaceCard({
  workspace,
  invites,
}: {
  workspace: AdminWorkspace;
  invites: AdminInvite[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<PortalRole>("client_owner");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ emailed: boolean; joinUrl?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setSending(true);
    const res = await fetch("/api/portal/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: workspace.id, email, role }),
    });
    const body = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok) {
      setError(body.error ?? "Couldn't send the invitation.");
      return;
    }
    setResult({ emailed: body.emailed, joinUrl: body.joinUrl });
    setEmail("");
    router.refresh();
  }

  const pending = invites.filter((i) => !i.acceptedAt);

  return (
    <li className="rounded-xl border border-white/8 bg-[#0c0c0c] p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="font-medium text-white">{workspace.name}</p>
          <p className="text-xs text-white/40">
            /portal/{workspace.slug}
            {workspace.clientCompany ? ` · ${workspace.clientCompany}` : ""}
          </p>
        </div>
        <span className="text-xs text-white/35">
          {workspace.memberCount} {workspace.memberCount === 1 ? "member" : "members"}
        </span>
      </div>

      <form onSubmit={invite} className="mt-4 flex flex-wrap items-end gap-2">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-[11px] text-white/40">Invite by email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@company.com"
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/25 focus-visible:border-white/25 focus-visible:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-white/40">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as PortalRole)}
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus-visible:border-white/25 focus-visible:outline-none"
          >
            {INVITABLE_ROLES.map((r) => (
              <option key={r} value={r} className="bg-[#0c0c0c]">
                {ROLE_LABELS[r] ?? r}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={sending || !email.trim()}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2 text-sm text-white transition-colors hover:bg-white/8 disabled:pointer-events-none disabled:opacity-40"
        >
          <Send size={14} aria-hidden="true" />
          {sending ? "Sending…" : "Invite"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-[var(--color-brand-red)]">{error}</p>}

      {result && (
        <div className="mt-3 rounded-lg border border-white/8 bg-black/30 p-3">
          {result.emailed ? (
            <p className="text-sm text-white/60">Invitation emailed.</p>
          ) : (
            <>
              <p className="text-sm text-white/60">
                Email isn&apos;t configured, so send this link yourself — the invitation is
                still valid.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded bg-black/50 px-2 py-1.5 text-[11px] text-white/50">
                  {result.joinUrl}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(result.joinUrl ?? "");
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-xs text-white transition-colors hover:bg-white/8"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {pending.length > 0 && (
        <div className="mt-4 border-t border-white/8 pt-3">
          <p className="mb-2 text-[11px] tracking-[0.16em] text-white/35 uppercase">
            Pending invitations
          </p>
          <ul className="space-y-1">
            {pending.map((i) => (
              <li key={i.id} className="flex justify-between gap-3 text-xs text-white/50">
                <span className="truncate">{i.email}</span>
                <span className="shrink-0 text-white/30">
                  expires {new Date(i.expiresAt).toLocaleDateString("en-CA")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] text-white/40">{label}</label>
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/25 focus-visible:border-white/25 focus-visible:outline-none"
      />
    </div>
  );
}
