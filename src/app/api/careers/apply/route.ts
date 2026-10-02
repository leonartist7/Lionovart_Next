import { NextResponse } from "next/server";
import { sendTalentApplicationEmail, type TalentApplication } from "@/lib/careers-email";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 24_000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DISCIPLINES = new Set([
  "Brand & design",
  "Film, motion & 3D",
  "Web & product",
  "AI & automation",
  "Events & experiences",
  "Strategy & growth",
  "Production & operations",
  "Create my own role",
]);
const COLLABORATION = new Set([
  "Full-time",
  "Part-time",
  "Freelance",
  "Project-based",
  "Internship",
  "Specialist partner",
]);

function value(input: unknown, max: number) {
  return typeof input === "string" ? input.trim().slice(0, max) : "";
}

function isHttpUrl(input: string) {
  try {
    const url = new URL(input);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) {
        return NextResponse.json({ error: "Invalid application origin." }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid application origin." }, { status: 403 });
    }
  }

  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Application is too large." }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid application payload." }, { status: 400 });
  }

  // Honeypot: bots commonly fill hidden "website" fields. Respond as success so
  // the endpoint does not teach automated senders how the filter works.
  if (value(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const application: TalentApplication = {
    name: value(body.name, 120),
    email: value(body.email, 200).toLowerCase(),
    location: value(body.location, 160),
    primaryDiscipline: value(body.primaryDiscipline, 120),
    collaboration: Array.isArray(body.collaboration)
      ? body.collaboration
          .filter((item): item is string => typeof item === "string" && COLLABORATION.has(item))
          .slice(0, 6)
      : [],
    workUrl: value(body.workUrl, 500),
    secondaryUrl: value(body.secondaryUrl, 500),
    cvUrl: value(body.cvUrl, 500),
    availability: value(body.availability, 240),
    strength: value(body.strength, 700),
    project: value(body.project, 1100),
    why: value(body.why, 1100),
  };

  if (
    application.name.length < 2 ||
    !EMAIL.test(application.email) ||
    application.location.length < 2 ||
    !DISCIPLINES.has(application.primaryDiscipline) ||
    application.strength.length < 40 ||
    application.project.length < 60 ||
    application.why.length < 50
  ) {
    return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  }

  if (!isHttpUrl(application.workUrl)) {
    return NextResponse.json({ error: "Please provide a valid work or profile link." }, { status: 400 });
  }

  for (const [label, url] of [
    ["second", application.secondaryUrl],
    ["CV", application.cvUrl],
  ] as const) {
    if (url && !isHttpUrl(url)) {
      return NextResponse.json({ error: `Please provide a valid ${label} link.` }, { status: 400 });
    }
  }

  const sent = await sendTalentApplicationEmail(application);
  if (!sent) {
    return NextResponse.json(
      { error: "We could not send your application right now. Please try again shortly." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
