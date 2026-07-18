import { adminDb } from "@/lib/firebase-admin";
import { AGENT_CONFIG_DEFAULTS, type AgentConfig } from "@/lib/agent-config-schema";
import { StudioForm } from "@/components/admin/StudioForm";

export const dynamic = "force-dynamic";

export interface ConfigVersion extends Partial<AgentConfig> {
  id: string;
  saved_at?: string;
  saved_by?: string;
}

export default async function StudioPage() {
  let config: AgentConfig = AGENT_CONFIG_DEFAULTS;
  let versions: ConfigVersion[] = [];
  const firestoreConfigured = Boolean(adminDb);

  if (adminDb) {
    const liveDoc = await adminDb.collection("agent_config").doc("live").get();
    config = liveDoc.exists ? { ...AGENT_CONFIG_DEFAULTS, ...(liveDoc.data() as Partial<AgentConfig>) } : AGENT_CONFIG_DEFAULTS;

    const versionsSnap = await adminDb
      .collection("agent_config")
      .doc("live")
      .collection("versions")
      .orderBy("saved_at", "desc")
      .limit(10)
      .get();
    versions = versionsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as ConfigVersion);
  }

  return (
    <div>
      <h1 className="mb-1 font-[var(--font-clash)] text-xl tracking-[0.15em] text-white uppercase">
        Agent Studio
      </h1>
      <p className="mb-6 text-xs text-white/35">
        Changes reach live sessions within 60 seconds (proxy cache).
      </p>
      {!firestoreConfigured ? (
        <p className="rounded-xl border border-white/8 bg-white/[0.02] p-6 text-sm text-white/50">
          Firestore not configured — Agent Studio needs FIREBASE_* env vars to read/write agent_config.
        </p>
      ) : (
        <StudioForm initialConfig={config} initialVersions={versions} />
      )}
    </div>
  );
}
