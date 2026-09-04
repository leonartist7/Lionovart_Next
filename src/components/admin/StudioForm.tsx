"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  LOCALES,
  MODEL_PRESETS,
  ORB_ENGINES,
  BOOKING_MODES,
  START_SENSITIVITIES,
  END_SENSITIVITIES,
  THINKING_LEVELS,
  VOICE_OPTIONS,
  modelSupportsAffectiveProactive,
  type AgentConfig,
  type Locale,
} from "@/lib/agent-config-schema";
import { NOVA_SKILLS } from "@/lib/nova-skills";
import type { ConfigVersion } from "@/app/(app)/admin/(console)/studio/page";

const THINKING_HINTS: Record<string, string> = {
  MINIMAL: "Fastest response — least reasoning overhead.",
  LOW: "Slightly deeper reasoning, still snappy.",
  MEDIUM: "Balanced — noticeable extra latency.",
  HIGH: "Deepest reasoning, slowest to first token.",
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-surface mb-5 rounded-xl p-5">
      <h2 className="mb-4 text-sm font-medium text-white">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <label className="mb-1.5 block text-xs text-white/50">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-white/30">{hint}</p>}
    </div>
  );
}

export function StudioForm({
  initialConfig,
  initialVersions,
}: {
  initialConfig: AgentConfig;
  initialVersions: ConfigVersion[];
}) {
  const [config, setConfig] = useState<AgentConfig>(initialConfig);
  const [versions, setVersions] = useState<ConfigVersion[]>(initialVersions);
  const [customModel, setCustomModel] = useState(
    MODEL_PRESETS.some((m) => m.value === initialConfig.model) ? "" : initialConfig.model,
  );
  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rollbackTarget, setRollbackTarget] = useState<string | null>(null);

  const dirty = useMemo(() => JSON.stringify(config) !== JSON.stringify(initialConfig), [config, initialConfig]);

  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (!dirty) return;
      e.preventDefault();
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function update<K extends keyof AgentConfig>(key: K, value: AgentConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function updateVad<K extends keyof AgentConfig["vad"]>(key: K, value: AgentConfig["vad"][K]) {
    setConfig((prev) => ({ ...prev, vad: { ...prev.vad, [key]: value } }));
  }

  const affectiveSupported = modelSupportsAffectiveProactive(config.model);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      const refreshed = await fetch("/api/admin/config").then((r) => r.json());
      setVersions(refreshed.versions ?? []);
      window.location.reload();
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDraftAndTest() {
    setSavingDraft(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, draft: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Draft save failed");
        return;
      }
      window.open("/?novaDraft=1", "_blank");
    } finally {
      setSavingDraft(false);
    }
  }

  async function handleRollback(versionId: string) {
    setError(null);
    const res = await fetch("/api/admin/config/rollback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Rollback failed");
      return;
    }
    window.location.reload();
  }

  return (
    <div className="pb-24">
      {/* 1. Model & Voice */}
      <Card title="Model & Voice">
        <Field label="Model">
          <div className="space-y-2">
            {MODEL_PRESETS.map((m) => (
              <label key={m.value} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={config.model === m.value}
                  onChange={() => {
                    update("model", m.value);
                    setCustomModel("");
                  }}
                />
                <span className="text-white/80">{m.label}</span>
              </label>
            ))}
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                checked={!MODEL_PRESETS.some((m) => m.value === config.model)}
                onChange={() => update("model", customModel || "")}
              />
              <span className="text-white/80">Custom:</span>
              <input
                type="text"
                value={customModel}
                onChange={(e) => {
                  setCustomModel(e.target.value);
                  update("model", e.target.value);
                }}
                placeholder="models/..."
                className="flex-1 rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none"
              />
            </label>
          </div>
        </Field>

        <Field label="Voice">
          <select
            value={config.voice}
            onChange={(e) => update("voice", e.target.value)}
            className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white outline-none"
          >
            {VOICE_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Thinking level" hint={THINKING_HINTS[config.thinkingLevel]}>
          <select
            value={config.thinkingLevel}
            onChange={(e) => update("thinkingLevel", e.target.value as AgentConfig["thinkingLevel"])}
            className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white outline-none"
          >
            {THINKING_LEVELS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <div className="mb-4 border-t border-white/[0.06] pt-4">
          <label className="flex items-center gap-2 text-xs text-white/50">
            <input
              type="checkbox"
              checked={config.voice_experiment.enabled}
              onChange={(e) => {
                const enabled = e.target.checked;
                update("voice_experiment", {
                  enabled,
                  variants: enabled && config.voice_experiment.variants.length < 2
                    ? [config.voice, VOICE_OPTIONS.find((v) => v !== config.voice) ?? VOICE_OPTIONS[1]]
                    : config.voice_experiment.variants,
                  split: enabled && config.voice_experiment.split.length < 2 ? [0.5, 0.5] : config.voice_experiment.split,
                });
              }}
            />
            A/B test a voice
          </label>
          {config.voice_experiment.enabled && (
            <div className="mt-2 space-y-2 pl-5">
              {config.voice_experiment.variants.map((variant, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={variant}
                    onChange={(e) => {
                      const next = [...config.voice_experiment.variants];
                      next[i] = e.target.value;
                      update("voice_experiment", { ...config.voice_experiment, variants: next });
                    }}
                    className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70 outline-none"
                  >
                    {VOICE_OPTIONS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  <span className="text-[11px] text-white/30">{Math.round((config.voice_experiment.split[i] ?? 0) * 100)}%</span>
                </div>
              ))}
              <p className="text-[10px] text-white/25">
                Split evenly across variants (50/50 for two). Same visitor always gets the same variant.
              </p>
            </div>
          )}
        </div>

        <Field label={`Temperature: ${config.temperature.toFixed(1)}`}>
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={config.temperature}
            onChange={(e) => update("temperature", Number(e.target.value))}
            className="w-full"
          />
        </Field>
      </Card>

      {/* Presence — orb engine */}
      <Card title="Presence">
        <Field
          label="Orb engine"
          hint="Auto probes for WebGPU support and upgrades to the ember-particle orb when available. Force a lower tier live during a demo on flaky hardware — no code change needed."
        >
          <select
            value={config.orb_engine}
            onChange={(e) => update("orb_engine", e.target.value as AgentConfig["orb_engine"])}
            className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white outline-none"
          >
            {ORB_ENGINES.map((e) => (
              <option key={e} value={e}>
                {e === "auto" ? "Auto (probe WebGPU)" : e === "webgpu" ? "Force WebGPU" : e === "webgl" ? "Force WebGL silk" : "Force CSS"}
              </option>
            ))}
          </select>
        </Field>
      </Card>

      {/* 2. Turn-taking (VAD) */}
      <Card title="Turn-taking (VAD)">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Start-of-speech sensitivity">
            <select
              value={config.vad.startOfSpeechSensitivity}
              onChange={(e) => updateVad("startOfSpeechSensitivity", e.target.value as AgentConfig["vad"]["startOfSpeechSensitivity"])}
              className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white outline-none"
            >
              {START_SENSITIVITIES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("START_SENSITIVITY_", "")}
                </option>
              ))}
            </select>
          </Field>
          <Field label="End-of-speech sensitivity">
            <select
              value={config.vad.endOfSpeechSensitivity}
              onChange={(e) => updateVad("endOfSpeechSensitivity", e.target.value as AgentConfig["vad"]["endOfSpeechSensitivity"])}
              className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white outline-none"
            >
              {END_SENSITIVITIES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("END_SENSITIVITY_", "")}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label={`Prefix padding: ${config.vad.prefixPaddingMs}ms`} hint="Audio captured just before speech is detected — avoids clipping the first syllable.">
          <input
            type="range"
            min={0}
            max={500}
            step={10}
            value={config.vad.prefixPaddingMs}
            onChange={(e) => updateVad("prefixPaddingMs", Number(e.target.value))}
            className="w-full"
          />
        </Field>

        <Field label={`Silence duration: ${config.vad.silenceDurationMs}ms`} hint="Lower silence = snappier turns, more false cuts. Higher = safer, slower to respond.">
          <input
            type="range"
            min={100}
            max={2000}
            step={50}
            value={config.vad.silenceDurationMs}
            onChange={(e) => updateVad("silenceDurationMs", Number(e.target.value))}
            className="w-full"
          />
        </Field>
      </Card>

      {/* 3. Capabilities */}
      <Card title="Capabilities">
        <label className={`mb-3 flex items-center gap-2 text-sm ${affectiveSupported ? "text-white/80" : "cursor-not-allowed text-white/30"}`}>
          <input
            type="checkbox"
            checked={config.enableAffectiveDialog}
            disabled={!affectiveSupported}
            onChange={(e) => update("enableAffectiveDialog", e.target.checked)}
          />
          Affective dialog
        </label>
        <label className={`flex items-center gap-2 text-sm ${affectiveSupported ? "text-white/80" : "cursor-not-allowed text-white/30"}`}>
          <input
            type="checkbox"
            checked={config.proactiveAudio}
            disabled={!affectiveSupported}
            onChange={(e) => update("proactiveAudio", e.target.checked)}
          />
          Proactive audio
        </label>
        {!affectiveSupported && (
          <p className="mt-2 text-[11px] text-white/30">
            Not supported by 3.1 Flash Live — switch to a native-audio model.
          </p>
        )}
      </Card>

      {/* Booking */}
      <Card title="Booking">
        <Field
          label="Booking mode"
          hint={
            config.booking_mode === "calcom"
              ? "Nova checks real availability and books directly via Cal.com. Requires CALCOM_API_KEY and CALCOM_EVENT_TYPE_ID to be set — falls back to the link handoff automatically if they aren't."
              : "Nova hands off with the booking-page link — the safe default, no calendar integration required."
          }
        >
          <div className="flex gap-4">
            {BOOKING_MODES.map((m) => (
              <label key={m} className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
                <input
                  type="radio"
                  checked={config.booking_mode === m}
                  onChange={() => update("booking_mode", m)}
                />
                {m === "calcom" ? "Cal.com (real booking)" : "Link handoff"}
              </label>
            ))}
          </div>
        </Field>
      </Card>

      {/* Lead enrichment */}
      <Card title="Lead Enrichment">
        <label className="flex items-start gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={config.enrichment.social_scraping}
            onChange={(e) => update("enrichment", { ...config.enrichment, social_scraping: e.target.checked })}
          />
          <span>
            Social scraping
            <span className="block text-[11px] text-white/30">
              Off by default — most platforms rate-limit/ban scraping and it&apos;s legally grayer than public
              GMB data. Only enable once a compliant provider is wired in. GMB/Places lookups run regardless
              (public data, no toggle needed).
            </span>
          </span>
        </label>
      </Card>

      {/* 4. Skills */}
      <Card title="Skills">
        <div className="space-y-3">
          {Object.values(NOVA_SKILLS).map((skill) => {
            const checked = config.skills_enabled.includes(skill.id);
            return (
              <label key={skill.id} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={checked}
                  onChange={(e) =>
                    update(
                      "skills_enabled",
                      e.target.checked
                        ? [...config.skills_enabled, skill.id]
                        : config.skills_enabled.filter((id) => id !== skill.id),
                    )
                  }
                />
                <span>
                  <span className="text-white/85">{skill.title}</span>
                  <span className="block text-[11px] text-white/30">{skill.triggers}</span>
                </span>
              </label>
            );
          })}
        </div>
      </Card>

      {/* 5. Prompts */}
      <Card title="Prompts">
        <Accordion multiple>
          {LOCALES.map((locale) => (
            <AccordionItem key={locale} value={locale}>
              <AccordionTrigger>{localeName(locale)}</AccordionTrigger>
              <AccordionContent>
                <textarea
                  value={config.prompt_overrides[locale] ?? ""}
                  onChange={(e) =>
                    update("prompt_overrides", { ...config.prompt_overrides, [locale]: e.target.value })
                  }
                  placeholder="Empty = built-in prompt"
                  rows={6}
                  className="w-full rounded border border-white/10 bg-white/5 p-2 text-xs text-white/80 outline-none"
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>

      {/* 6. Version history */}
      <Card title="Version history">
        {versions.length === 0 ? (
          <p className="text-sm text-white/30">No saved versions yet.</p>
        ) : (
          <div className="space-y-2">
            {versions.map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-lg border border-white/8 px-3 py-2 text-sm">
                <div>
                  <p className="text-white/70">
                    {v.model} · {v.voice}
                  </p>
                  <p className="text-[11px] text-white/30">
                    {v.saved_at ? new Date(v.saved_at).toLocaleString() : "—"} · {v.saved_by || "unknown"}
                  </p>
                </div>
                {rollbackTarget === v.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-white/40">Restore this version?</span>
                    <Button size="sm" variant="destructive" onClick={() => handleRollback(v.id)}>
                      Confirm
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setRollbackTarget(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setRollbackTarget(v.id)}>
                    Rollback
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {error && <p className="mb-4 text-sm text-[var(--color-brand-red)]">{error}</p>}

      {dirty && (
        <div className="fixed right-0 bottom-0 left-0 z-20 border-t border-white/10 bg-[#0c0c0c]/95 px-8 py-3 backdrop-blur md:left-[220px]">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <p className="text-xs text-white/40">Unsaved changes</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveDraftAndTest} disabled={savingDraft}>
                {savingDraft ? "Saving draft…" : "Save as draft & test"}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Publishing…" : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function localeName(locale: Locale): string {
  const names: Record<Locale, string> = { en: "English", es: "Spanish", fr: "French", it: "Italian", ko: "Korean" };
  return names[locale];
}
