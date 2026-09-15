"use client";

import { useDeferredValue, useState } from "react";
import {
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Copy,
  MessageCircle,
  Palette,
  RefreshCw,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Target,
  WandSparkles,
} from "lucide-react";
import {
  type WhatsAppAppearance,
  type WhatsAppAppearanceStyle,
  WHATSAPP_APPEARANCE_STYLES,
} from "@/lib/whatsapp-appearance";
import {
  AUTOMATION_MODES,
  LEAD_STAGES,
  type AutomationMode,
  type LeadStage,
  type WhatsAppIntelligence,
} from "@/lib/whatsapp-intelligence-shared";

type InboxMessage = {
  role: "user" | "agent";
  text: string;
};

export type InboxConversation = {
  id: string;
  name: string;
  phone: string;
  messages: InboxMessage[];
  lastMessageAt?: string;
  replyWindowOpen: boolean;
  followUpAt?: string;
  intelligenceAnalyzedAt?: string;
  intelligence: WhatsAppIntelligence | null;
  leadStage: LeadStage;
  automationMode: AutomationMode;
  notes: string;
};

type Props = {
  conversations: InboxConversation[];
  initialAppearance: WhatsAppAppearance;
  canPersistAppearance: boolean;
  connectionReady: boolean;
};

const STYLE_LABELS: Record<WhatsAppAppearanceStyle, string> = {
  solid: "Solid",
  gradient: "Gradient",
  mesh: "Mesh",
};

const STAGE_LABELS: Record<LeadStage, string> = {
  new: "New",
  qualifying: "Qualifying",
  discovery: "Discovery",
  proposal: "Proposal",
  negotiating: "Negotiating",
  won: "Won",
  lost: "Lost",
  nurture: "Nurture",
};

const MODE_LABELS: Record<AutomationMode, string> = {
  human: "Human",
  assisted: "Assisted",
  autopilot: "Auto",
};

const COMPOSER_PRESETS = [
  { label: "Discovery question", idea: "Thank them and ask one focused question about their most important outcome and timing." },
  { label: "FAST first step", idea: "Suggest the smallest useful first step that can create momentum quickly, without overpromising." },
  { label: "Lead magnet follow-up", idea: "Follow up warmly on the resource they received, ask what stood out, and invite a simple reply." },
  { label: "Book a call", idea: "Invite them to a short discovery call in a relaxed way and explain why it would be useful for their situation." },
] as const;

function backgroundFor(appearance: WhatsAppAppearance) {
  if (appearance.style === "solid") return appearance.background;
  if (appearance.style === "gradient") {
    return `linear-gradient(135deg, ${appearance.background}, ${appearance.secondary})`;
  }
  return `radial-gradient(circle at 12% 8%, ${appearance.accent}55, transparent 26%), radial-gradient(circle at 92% 2%, ${appearance.secondary}, transparent 36%), linear-gradient(145deg, ${appearance.background}, #05070d 76%)`;
}

function relativeTime(value?: string) {
  if (!value) return "No timestamp";
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60_000);
  if (minutes < 2) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 24 * 60) return `${Math.round(minutes / 60)}h ago`;
  return `${Math.round(minutes / (24 * 60))}d ago`;
}

function toLocalDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function AppearanceControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-[11px] text-white/55">
      {label}
      <span className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-2 py-1">
        <input
          aria-label={`${label} color`}
          className="size-5 cursor-pointer rounded border-0 bg-transparent p-0"
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="font-mono text-[10px] uppercase text-white/70">{value}</span>
      </span>
    </label>
  );
}

export function WhatsAppWorkspace({
  conversations,
  initialAppearance,
  canPersistAppearance,
  connectionReady,
}: Props) {
  const [appearance, setAppearance] = useState(initialAppearance);
  const [conversationState, setConversationState] = useState(conversations);
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const [inboxFilter, setInboxFilter] = useState<"all" | "reply" | "follow-up">("all");
  const [optimisticMessages, setOptimisticMessages] = useState<Record<string, InboxMessage[]>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [savingTheme, setSavingTheme] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [savingConversation, setSavingConversation] = useState(false);
  const [sending, setSending] = useState(false);

  const active = conversationState.find((conversation) => conversation.id === activeId);
  const messages = active ? [...active.messages, ...(optimisticMessages[active.id] ?? [])] : [];
  const filteredConversations = conversationState.filter((conversation) => {
    const matchesSearch = !deferredSearch || `${conversation.name} ${conversation.phone} ${conversation.messages.at(-1)?.text ?? ""}`.toLowerCase().includes(deferredSearch);
    const matchesFilter = inboxFilter === "all" || (inboxFilter === "reply" && conversation.replyWindowOpen) || (inboxFilter === "follow-up" && Boolean(conversation.followUpAt));
    return matchesSearch && matchesFilter;
  });

  function updateLocalConversation(id: string, update: Partial<InboxConversation>) {
    setConversationState((current) => current.map((conversation) => conversation.id === id ? { ...conversation, ...update } : conversation));
  }

  async function analyzeConversation() {
    if (!active) return;
    setAnalyzing(true);
    setStatus(null);
    try {
      const response = await fetch("/api/admin/whatsapp/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: active.id }),
      });
      const data = (await response.json()) as { intelligence?: WhatsAppIntelligence; analyzedAt?: string; provider?: string; error?: string };
      if (!response.ok || !data.intelligence) throw new Error(data.error ?? "Could not analyze the conversation.");
      updateLocalConversation(active.id, {
        intelligence: data.intelligence,
        intelligenceAnalyzedAt: data.analyzedAt,
        leadStage: data.intelligence.stage,
      });
      setStatus(data.provider === "local" ? "Analysis created with the local fallback. Add GEMINI_API_KEY for deeper intelligence." : "Conversation intelligence refreshed.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not analyze the conversation.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function saveConversation(update: { leadStage?: LeadStage; automationMode?: AutomationMode; followUpAt?: string | null; notes?: string }) {
    if (!active) return;
    setSavingConversation(true);
    setStatus(null);
    try {
      const response = await fetch("/api/admin/whatsapp/conversation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: active.id, ...update }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not update the conversation.");
      updateLocalConversation(active.id, {
        ...(update.leadStage ? { leadStage: update.leadStage } : {}),
        ...(update.automationMode ? { automationMode: update.automationMode } : {}),
        ...(update.followUpAt !== undefined ? { followUpAt: update.followUpAt || undefined } : {}),
        ...(update.notes !== undefined ? { notes: update.notes } : {}),
      });
      setStatus("Conversation updated.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not update the conversation.");
    } finally {
      setSavingConversation(false);
    }
  }

  function applySuggestedReply(text: string) {
    setMessage(text);
    setStatus("Suggestion moved into the composer for your approval.");
  }

  async function rewriteInMyVoice() {
    if (!active || !message.trim()) return;
    setRewriting(true);
    setStatus(null);
    try {
      const response = await fetch("/api/admin/whatsapp/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: active.id, roughIdea: message }),
      });
      const data = (await response.json()) as { text?: string; provider?: string; error?: string };
      if (!response.ok || !data.text) throw new Error(data.error ?? "Could not rewrite the message.");
      setMessage(data.text);
      setStatus(data.provider === "local" ? "Cleaned locally. Add GEMINI_API_KEY for Leonardo voice rewriting." : "Rewritten in Leonardo’s voice. Review it before sending.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not rewrite the message.");
    } finally {
      setRewriting(false);
    }
  }

  async function copySummary() {
    if (!active?.intelligence) return;
    await navigator.clipboard.writeText(active.intelligence.summary);
    setStatus("Summary copied.");
  }

  async function saveAppearance() {
    if (!canPersistAppearance) return;
    setSavingTheme(true);
    setStatus(null);
    try {
      const response = await fetch("/api/admin/whatsapp/appearance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appearance),
      });
      const data = (await response.json()) as { appearance?: WhatsAppAppearance; error?: string };
      if (!response.ok || !data.appearance) throw new Error(data.error ?? "Could not save the theme.");
      setAppearance(data.appearance);
      setStatus("Theme saved for this CRM workspace.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save the theme.");
    } finally {
      setSavingTheme(false);
    }
  }

  async function sendMessage() {
    if (!active || !message.trim() || !active.replyWindowOpen) return;
    const text = message.trim();
    setSending(true);
    setStatus(null);
    try {
      const response = await fetch("/api/admin/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: active.phone, text }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Message could not be sent.");
      setOptimisticMessages((previous) => ({
        ...previous,
        [active.id]: [...(previous[active.id] ?? []), { role: "agent", text }],
      }));
      setMessage("");
      setStatus("Message accepted by WhatsApp Cloud API.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Message could not be sent.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="relative isolate min-h-[calc(100vh-3rem)] overflow-hidden rounded-[28px] border border-white/10 p-3 shadow-2xl shadow-black/30 md:p-5"
      style={{ background: backgroundFor(appearance) }}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:34px_34px] [mask-image:linear-gradient(to_bottom,black,transparent_72%)]" />

      <header className="mb-4 flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-emerald-400 text-[#07150f] shadow-lg shadow-emerald-400/20">
            <MessageCircle size={20} strokeWidth={2.5} />
          </span>
          <div>
            <p className="text-[10px] font-semibold tracking-[.2em] text-emerald-200/65 uppercase">LIONOVART engagement desk</p>
            <h1 className="mt-0.5 font-[var(--font-clash)] text-xl tracking-[.08em] text-white uppercase">WhatsApp Inbox</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-white/55">
          <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 ${connectionReady ? "border-emerald-300/15 bg-emerald-300/10 text-emerald-100" : "border-amber-300/15 bg-amber-300/10 text-amber-100"}`}><CheckCircle2 size={13} /> {connectionReady ? "Cloud API ready" : "Cloud API setup needed"}</span>
          <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1.5">{conversationState.length} active threads</span>
        </div>
      </header>

      <div className="grid min-h-[650px] gap-3 xl:grid-cols-[280px_minmax(0,1fr)_260px]">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#070a12]/80 backdrop-blur-xl">
          <div className="border-b border-white/10 p-4">
            <p className="text-sm font-medium text-white">Conversations</p>
            <p className="mt-1 text-[11px] text-white/40">Replies are ordered by their newest activity.</p>
            <label className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 focus-within:border-emerald-300/30">
              <Search size={13} className="text-white/35" />
              <span className="sr-only">Search conversations</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, number, message…" className="min-w-0 flex-1 bg-transparent text-[11px] text-white outline-none placeholder:text-white/25" />
            </label>
            <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-white/[0.04] p-1">
              {([['all', 'All'], ['reply', 'Open'], ['follow-up', 'Follow-up']] as const).map(([value, label]) => (
                <button key={value} type="button" onClick={() => setInboxFilter(value)} className={`rounded-md px-1 py-1 text-[9px] transition ${inboxFilter === value ? "bg-white/10 text-white" : "text-white/35 hover:text-white/60"}`}>{label}</button>
              ))}
            </div>
          </div>
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto p-2">
            {filteredConversations.length === 0 ? (
              <div className="px-3 py-8 text-center text-xs text-white/40">{conversationState.length === 0 ? "New WhatsApp conversations will arrive here after the first webhook." : "No conversations match this view."}</div>
            ) : (
              filteredConversations.map((conversation) => {
                const selected = conversation.id === activeId;
                const preview = conversation.messages.at(-1)?.text ?? "Conversation started";
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setActiveId(conversation.id)}
                    className={`mb-1 w-full rounded-xl border p-3 text-left transition ${selected ? "border-emerald-300/25 bg-emerald-300/10" : "border-transparent hover:border-white/10 hover:bg-white/5"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-medium text-white">{conversation.name}</p>
                      <span className="shrink-0 text-[10px] text-white/35">{relativeTime(conversation.lastMessageAt)}</span>
                    </div>
                    <p className="mt-1 truncate text-[11px] text-white/45">{preview}</p>
                    <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[9px] ${conversation.replyWindowOpen ? "bg-emerald-400/10 text-emerald-200" : "bg-amber-300/10 text-amber-100"}`}>
                      {conversation.replyWindowOpen ? "Reply window open" : "Template required"}
                    </span>
                    <span className="mt-2 ml-1 inline-flex rounded-full bg-white/[0.06] px-2 py-0.5 text-[9px] text-white/45">{STAGE_LABELS[conversation.leadStage]}</span>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#080b14]/85 backdrop-blur-xl">
          {active ? (
            <>
              <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{active.name}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-white/40">+{active.phone}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-[10px] text-white/45">
                    <span className="sr-only">Lead stage</span>
                    <select value={active.leadStage} onChange={(event) => saveConversation({ leadStage: event.target.value as LeadStage })} disabled={savingConversation} className="bg-transparent text-[10px] text-white outline-none">
                      {LEAD_STAGES.map((stage) => <option key={stage} value={stage} className="bg-[#101622]">{STAGE_LABELS[stage]}</option>)}
                    </select>
                  </label>
                  <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] ${active.replyWindowOpen ? "bg-emerald-300/10 text-emerald-100" : "bg-amber-300/10 text-amber-100"}`}>
                    <Clock3 size={12} /> {active.replyWindowOpen ? "24h service window" : "Use approved template"}
                  </span>
                </div>
              </div>
              <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((entry, index) => (
                  <div key={`${entry.role}-${index}-${entry.text.slice(0, 16)}`} className={`flex ${entry.role === "agent" ? "justify-end" : "justify-start"}`}>
                    <p className={`max-w-[82%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${entry.role === "agent" ? "rounded-br-md bg-emerald-300 text-[#07150f]" : "rounded-bl-md bg-white/10 text-white/85"}`}>{entry.text}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 p-3">
                {!active.replyWindowOpen && <p className="mb-2 text-[11px] text-amber-100/80">This contact is outside the 24-hour service window. Send an approved Meta template from the campaign library.</p>}
                {active.intelligence?.suggestedReplies?.length ? (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {active.intelligence.suggestedReplies.map((reply) => (
                      <button key={reply.label} type="button" onClick={() => applySuggestedReply(reply.text)} className="flex items-center gap-1 rounded-full border border-violet-300/15 bg-violet-300/[0.07] px-2.5 py-1 text-[10px] text-violet-100 transition hover:bg-violet-300/15"><WandSparkles size={11} /> {reply.label}</button>
                    ))}
                  </div>
                ) : null}
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[9px] tracking-[.12em] text-white/25 uppercase">Preset</span>
                  <select defaultValue="" onChange={(event) => { const preset = COMPOSER_PRESETS.find((item) => item.label === event.target.value); if (preset) setMessage(preset.idea); event.currentTarget.value = ""; }} className="rounded-lg border border-white/10 bg-[#101622] px-2 py-1 text-[10px] text-white/50 outline-none">
                    <option value="" disabled>Choose a playbook…</option>
                    {COMPOSER_PRESETS.map((preset) => <option key={preset.label} value={preset.label}>{preset.label}</option>)}
                  </select>
                  <span className="text-[9px] text-white/20">then use My voice</span>
                </div>
                <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-black/20 p-2 focus-within:border-emerald-300/35">
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    disabled={!active.replyWindowOpen || sending}
                    rows={2}
                    placeholder={active.replyWindowOpen ? "Write a helpful reply…" : "An approved template is required"}
                    className="min-h-12 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-white outline-none placeholder:text-white/25 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={rewriteInMyVoice}
                    disabled={!message.trim() || rewriting || sending}
                    className="mb-0.5 flex h-9 items-center gap-1.5 rounded-lg border border-violet-300/15 bg-violet-300/[0.07] px-2.5 text-[10px] text-violet-100 transition hover:bg-violet-300/15 disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Rewrite in Leonardo's voice"
                  >
                    <WandSparkles size={13} /> {rewriting ? "Rewriting…" : "My voice"}
                  </button>
                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={!message.trim() || !active.replyWindowOpen || sending}
                    className="grid size-10 place-items-center rounded-lg bg-emerald-300 text-[#07150f] transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Send WhatsApp message"
                  >
                    <Send size={17} />
                  </button>
                </div>
                <p className="mt-1.5 px-1 text-[9px] text-white/25">AI suggestions always enter the composer first. Nothing is sent without your Send action.</p>
              </div>
            </>
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-center">
              <div><MessageCircle className="mx-auto mb-3 text-white/20" size={34} /><p className="text-sm text-white/60">Your Cloud API inbox is waiting for its first conversation.</p></div>
            </div>
          )}
        </section>

        <aside className="space-y-3">
          <section className="rounded-2xl border border-white/10 bg-[#080b14]/80 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2"><BrainCircuit size={16} className="text-violet-200" /><p className="text-sm font-medium text-white">AI awareness</p></div>
              <button type="button" onClick={analyzeConversation} disabled={!active || analyzing} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-[9px] text-white/60 transition hover:text-white disabled:opacity-40"><RefreshCw size={11} className={analyzing ? "animate-spin" : ""} /> {analyzing ? "Reading…" : active?.intelligence ? "Refresh" : "Analyze"}</button>
            </div>
            {active?.intelligence ? (
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-violet-300/15 bg-violet-300/[0.06] p-3">
                  <div><p className="text-[9px] tracking-[.15em] text-violet-200/60 uppercase">Qualification</p><p className="mt-0.5 text-xl font-semibold text-white">{active.intelligence.qualificationScore}<span className="text-xs font-normal text-white/35">/100</span></p></div>
                  <div className="text-right"><p className="text-[9px] tracking-[.15em] text-violet-200/60 uppercase">Intent</p><p className="mt-1 max-w-32 text-[10px] text-white/75">{active.intelligence.intent}</p></div>
                </div>
                <div>
                  <div className="flex items-center justify-between"><p className="text-[9px] tracking-[.14em] text-white/35 uppercase">Live summary</p><button type="button" onClick={copySummary} aria-label="Copy conversation summary" className="text-white/30 transition hover:text-white/70"><Copy size={12} /></button></div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-white/65">{active.intelligence.summary}</p>
                </div>
                <div className="rounded-xl border border-emerald-300/15 bg-emerald-300/[0.06] p-3">
                  <div className="flex items-center gap-1.5 text-[9px] tracking-[.14em] text-emerald-200/60 uppercase"><Target size={11} /> Next best action</div>
                  <p className="mt-1.5 text-[11px] font-medium text-emerald-50/90">{active.intelligence.nextBestAction}</p>
                  <p className="mt-1 text-[10px] leading-relaxed text-emerald-50/50">{active.intelligence.actionReason}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="rounded-lg bg-white/[0.04] p-2"><p className="text-white/30">Objection</p><p className="mt-1 text-white/65">{active.intelligence.objection}</p></div>
                  <div className="rounded-lg bg-white/[0.04] p-2"><p className="text-white/30">Urgency</p><p className="mt-1 capitalize text-white/65">{active.intelligence.urgency} · {active.intelligence.sentiment}</p></div>
                </div>
                <div className="flex flex-wrap gap-1">{active.intelligence.tags.map((tag) => <span key={tag} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[9px] text-white/45">#{tag}</span>)}</div>
                <p className="text-[9px] text-white/25">Analyzed {relativeTime(active.intelligenceAnalyzedAt)}</p>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-white/10 p-3 text-[11px] leading-relaxed text-white/45">Analyze this thread to identify the prospect’s stage, intent, objections, opportunity, and best next message.</div>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#080b14]/80 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2"><CalendarClock size={15} className="text-amber-200" /><p className="text-sm font-medium text-white">Follow-up & control</p></div>
            <p className="mt-3 text-[9px] tracking-[.14em] text-white/30 uppercase">Agent mode</p>
            <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-xl bg-white/[0.04] p-1">
              {AUTOMATION_MODES.map((mode) => (
                <button key={mode} type="button" disabled={!active || savingConversation} onClick={() => saveConversation({ automationMode: mode })} className={`rounded-lg px-1 py-1.5 text-[9px] transition ${active?.automationMode === mode ? "bg-emerald-300/15 text-emerald-100" : "text-white/35 hover:text-white/65"}`}>{MODE_LABELS[mode]}</button>
              ))}
            </div>
            <p className="mt-1.5 text-[9px] leading-relaxed text-white/25">Auto is recorded for future rules; outbound messages still require explicit approval in this MVP.</p>
            <label className="mt-3 block text-[9px] tracking-[.14em] text-white/30 uppercase">Next follow-up
              <input type="datetime-local" value={toLocalDateTime(active?.followUpAt)} disabled={!active || savingConversation} onChange={(event) => saveConversation({ followUpAt: event.target.value ? new Date(event.target.value).toISOString() : null })} className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/20 px-2.5 py-2 text-[10px] tracking-normal text-white/70 outline-none [color-scheme:dark]" />
            </label>
            <label className="mt-3 block text-[9px] tracking-[.14em] text-white/30 uppercase">Private notes
              <textarea value={active?.notes ?? ""} disabled={!active || savingConversation} onChange={(event) => active && updateLocalConversation(active.id, { notes: event.target.value })} rows={3} placeholder="Context Leonardo should remember…" className="mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-2.5 py-2 text-[10px] leading-relaxed tracking-normal text-white/70 outline-none placeholder:text-white/20" />
            </label>
            <button type="button" disabled={!active || savingConversation} onClick={() => active && saveConversation({ notes: active.notes })} className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1.5 text-[10px] text-white/55 transition hover:text-white disabled:opacity-40">{savingConversation ? "Saving…" : "Save contact controls"}</button>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#080b14]/80 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><Palette size={16} className="text-violet-200" /><p className="text-sm font-medium text-white">Workspace background</p></div><Settings2 size={15} className="text-white/35" /></div>
            <p className="mt-1 text-[11px] leading-relaxed text-white/45">Customize the WhatsApp desk and save it for every admin.</p>
            <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-white/5 p-1">
              {WHATSAPP_APPEARANCE_STYLES.map((style) => (
                <button key={style} type="button" onClick={() => setAppearance((current) => ({ ...current, style }))} className={`rounded-lg px-1 py-1.5 text-[10px] transition ${appearance.style === style ? "bg-white/12 text-white" : "text-white/40 hover:text-white/70"}`}>{STYLE_LABELS[style]}</button>
              ))}
            </div>
            <div className="mt-3 space-y-2.5">
              <AppearanceControl label="Base" value={appearance.background} onChange={(background) => setAppearance((current) => ({ ...current, background }))} />
              <AppearanceControl label="Depth" value={appearance.secondary} onChange={(secondary) => setAppearance((current) => ({ ...current, secondary }))} />
              <AppearanceControl label="Accent" value={appearance.accent} onChange={(accent) => setAppearance((current) => ({ ...current, accent }))} />
            </div>
            <button type="button" onClick={saveAppearance} disabled={!canPersistAppearance || savingTheme} className="mt-4 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40">
              {savingTheme ? "Saving…" : canPersistAppearance ? "Save workspace theme" : "Connect Firestore to save"}
            </button>
          </section>

          <section className="flex gap-2 rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.06] p-3 text-[11px] leading-relaxed text-emerald-50/75"><ShieldCheck className="mt-0.5 shrink-0" size={14} /> Meta delivery checks and customer-service window protections remain enforced when a message is sent.</section>
        </aside>
      </div>
      {status && <div className="fixed right-5 bottom-5 z-20 max-w-sm rounded-xl border border-white/10 bg-[#101622] px-4 py-3 text-xs text-white shadow-xl">{status}</div>}
    </div>
  );
}
