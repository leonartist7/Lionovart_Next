"use client";

import { useEffect, useRef, useState } from "react";
import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

const SHADER_UNIFORMS = {
  // Denser repetition + lower scale so the metal tiles around the WHOLE ring
  // (a single sweep only lit part of a long thin contour).
  u_repetition: 14,
  u_softness: 0.5,
  u_shiftRed: 0.65,
  u_shiftBlue: 0.0,
  u_distortion: 0,
  u_contour: 0,
  u_angle: 90,
  u_scale: 3,
  u_shape: 1,
  u_offsetX: 0.0,
  u_offsetY: 0.0,
};

/**
 * HeroEmailCapture — a GLASS (transparent) pill whose OUTLINE is the live
 * liquid-metal shader (masked to a ring so only the border moves). Email input
 * + the real liquid-metal "Start" button. Saves the lead to /api/strategist/lead.
 */
export default function HeroEmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  // Live liquid-metal outline (masked to a ring).
  const shaderRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mount = useRef<any>(null);
  useEffect(() => {
    if (!shaderRef.current) return;
    try {
      mount.current = new ShaderMount(
        shaderRef.current,
        liquidMetalFragmentShader,
        SHADER_UNIFORMS,
        undefined,
        0.6
      );
    } catch {
      /* shader unsupported — ring just won't animate */
    }
    return () => {
      try {
        mount.current?.destroy?.();
      } catch {
        /* noop */
      }
      mount.current = null;
    };
  }, []);

  const doSubmit = async () => {
    if (status === "loading" || status === "done") return;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      await fetch("/api/strategist/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: email,
          contact: email,
          contact_type: "email",
          source: "hero_audit",
          project_summary: "Requested a free brand audit from the hero.",
        }),
      });
      setStatus("done");
    } catch {
      setStatus("done");
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void doSubmit();
  };

  // Border-only mask: shows the shader as a ~2px ring, interior stays glass.
  const ringMask: React.CSSProperties = {
    padding: 2,
    WebkitMask:
      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
  };

  return (
    <div className="w-full max-w-[540px] mx-auto">
      {status === "done" ? (
        <div className="relative rounded-full">
          <div
            ref={shaderRef}
            aria-hidden
            className="absolute inset-0 overflow-hidden rounded-full pointer-events-none [&_canvas]:!absolute [&_canvas]:!inset-0 [&_canvas]:!h-full [&_canvas]:!w-full"
            style={ringMask}
          />
          <div className="relative rounded-full bg-white/5 backdrop-blur-md px-6 py-4 text-center text-[14px] font-semibold text-white">
            Thanks — your free audit is on its way. ✦
          </div>
        </div>
      ) : (
        <form onSubmit={onFormSubmit} noValidate>
          <div className="relative rounded-full">
            {/* Live liquid-metal outline */}
            <div
              ref={shaderRef}
              aria-hidden
              className="absolute inset-0 z-10 overflow-hidden rounded-full pointer-events-none [&_canvas]:!absolute [&_canvas]:!inset-0 [&_canvas]:!h-full [&_canvas]:!w-full"
              style={ringMask}
            />
            {/* Glass (transparent) interior */}
            <div className="relative flex items-center gap-2 rounded-full bg-white/5 backdrop-blur-md pl-5 pr-1.5 py-1.5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="Enter your email — we'll send your audit"
                aria-label="Email"
                className="min-w-0 flex-1 bg-transparent text-[14px] md:text-[15px] text-white placeholder:text-white/45 outline-none"
              />
              <div className="shrink-0">
                <LiquidMetalButton
                  label={status === "loading" ? "…" : "Start"}
                  onClick={() => void doSubmit()}
                  variant="red"
                  width={120}
                  noShadow
                />
              </div>
            </div>
          </div>
        </form>
      )}

      <p
        className={`mt-3 text-center text-[12px] md:text-[13px] tracking-wide ${
          status === "error" ? "text-brand-red" : "text-white/45"
        }`}
      >
        {status === "error"
          ? "Please enter a valid email."
          : "Get your free brand audit"}
      </p>
    </div>
  );
}
