// Adapted from the canonical homepage LiquidMetalButton; visual layers/uniforms are retained.


import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders";
import { Sparkles } from "lucide-react";
import type React from "react";
import { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useInView } from "framer-motion";
import "./LiquidMetalButton.css";

export const LiquidMetalMotionContext = createContext(true);
const subscribeVisibility = (notify: () => void) => { document.addEventListener("visibilitychange", notify); return () => document.removeEventListener("visibilitychange", notify); };
const getHidden = () => document.hidden;
const getServerHidden = () => true;
const subscribeReduced = (notify: () => void) => { const query = window.matchMedia("(prefers-reduced-motion: reduce)"); query.addEventListener("change", notify); return () => query.removeEventListener("change", notify); };
const getReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getServerReduced = () => true;

interface LiquidMetalButtonProps {
  label?: string;
  href?: string;
  target?: "_blank" | "_self";
  rel?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  /** Stack the label inside compact shapes such as a circular CTA. */
  stackedLabel?: boolean;
  onClick?: () => void;
  viewMode?: "text" | "icon";
  /** Override text-mode width (px). Default: 160 */
  width?: number;
  /** Text-mode height; icon mode remains 46px. */
  height?: number;
  /** Pause the shader and decorative click/hover animation. */
  paused?: boolean;
  /** "red" = dark-red interior + white text (default). "white" = white interior + red text. */
  variant?: "red" | "white";
  /** Tint the exposed liquid-metal edge. */
  metalTone?: "silver" | "gold";
  /** Override the text/icon color. Falls back to variant default when omitted. */
  textColor?: string;
  /** Remove the drop shadow (e.g. when placed on a dark nav bar). */
  noShadow?: boolean;
  /** Keep the shader moving even when IntersectionObserver reports it off-screen. */
  alwaysAnimate?: boolean;
}

export function LiquidMetalButton({
  label = "Get Started",
  href, target, rel, disabled = false, type = "button", className = "",
  stackedLabel = false,
  onClick,
  viewMode = "text",
  width = 160,
  height = 46,
  paused = false,
  variant = "red",
  metalTone = "silver",
  textColor,
  noShadow = false,
  alwaysAnimate = false,
}: LiquidMetalButtonProps) {
  const released = useContext(LiquidMetalMotionContext);
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, getServerReduced);
  const hidden = useSyncExternalStore(subscribeVisibility, getHidden, getServerHidden);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<
    Array<{ x: number; y: number; id: number }>
  >([]);
  const shaderRef = useRef<HTMLDivElement>(null);
  const shaderMount = useRef<ShaderMount | null>(null);
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  const rippleId = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rippleTimers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const metalFilter = metalTone === "gold"
    ? "sepia(1) saturate(2.5) hue-rotate(2deg) brightness(1.03) contrast(1.12)"
    : undefined;
  const contourColor = metalTone === "gold" ? "#f0c917" : "#dce7e8";

  const dimensions = useMemo(() => {
    if (viewMode === "icon") {
      return {
        width: "46px",
        height: "46px",
        innerWidth: "42px",
        innerHeight: "42px",
        shaderWidth: "46px",
        shaderHeight: "46px",
      };
    } else {
      // Sections can opt into rem sizing while every shader layer stays aligned.
      const resolvedWidth = `var(--liquid-button-width, ${width}px)`;
      const resolvedHeight = `var(--liquid-button-height, ${height}px)`;
      return {
        width: resolvedWidth,
        height: resolvedHeight,
        innerWidth: `calc(${resolvedWidth} - 4px)`,
        innerHeight: `calc(${resolvedHeight} - 4px)`,
        shaderWidth: resolvedWidth,
        shaderHeight: resolvedHeight,
      };
    }
  }, [viewMode, width, height]);

    const isInView = useInView(shaderRef, { margin: "0px" });

  const active = released && !paused && !disabled && !reduced && !hidden && (alwaysAnimate || isInView);
  useEffect(() => {
    const element = shaderRef.current;
    if (!element) return;
    element.dataset.shaderState = "fallback";
    if (!active) return;
    let mount: ShaderMount | null = null;
    try {
      mount = new ShaderMount(element, liquidMetalFragmentShader,
        { u_repetition: 4, u_softness: 0.5, u_shiftRed: 0.65, u_shiftBlue: 0.0,
          u_distortion: 0, u_contour: 0, u_angle: 45, u_scale: 8, u_shape: 1,
          u_offsetX: 0.1, u_offsetY: -0.1 }, undefined, 0.6, 0, 2, 120000);
      shaderMount.current = mount;
      element.dataset.shaderState = "active";
    } catch {
      // The fixed metallic skin remains usable without WebGL.
      const failedCanvas = element.querySelector("canvas");
      try { failedCanvas?.getContext("webgl2")?.getExtension("WEBGL_lose_context")?.loseContext(); } catch { /* Keep the static skin. */ }
      failedCanvas?.remove();
      element.dataset.shaderState = "fallback";
    }
    return () => {
      if (clickTimer.current) clearTimeout(clickTimer.current);
      if (mount) {
        const canvas = mount.canvasElement;
        mount.setSpeed(0);
        mount.dispose();
        canvas.getContext("webgl2")?.getExtension("WEBGL_lose_context")?.loseContext();
        if (shaderMount.current === mount) shaderMount.current = null;
      }
      element.dataset.shaderState = "fallback";
    };
  }, [active]);

  useEffect(() => {
    shaderMount.current?.setSpeed(active ? (isHovered ? 1 : 0.6) : 0);
  }, [active, isHovered]);
  useEffect(() => {
    const timers = rippleTimers.current;
    return () => {
      if (clickTimer.current) clearTimeout(clickTimer.current);
      for (const timer of timers) clearTimeout(timer);
      timers.clear();
    };
  }, []);

  const handleMouseEnter = () => {
    if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
      setIsHovered(true);
      if (active) shaderMount.current?.setSpeed?.(1);
    }
  };

  const handleMouseLeave = () => {
    if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
      setIsHovered(false);
      setIsPressed(false);
      if (active) shaderMount.current?.setSpeed?.(0.6);
    }
  };

  const handleTouchStart = () => setIsPressed(true);
  const handleTouchEnd = () => setIsPressed(false);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) { e.preventDefault(); return; }
    if (active && shaderMount.current?.setSpeed) {
      shaderMount.current.setSpeed(2.4);
      if (clickTimer.current) clearTimeout(clickTimer.current);
      clickTimer.current = setTimeout(() => {
        if (isHovered) {
          shaderMount.current?.setSpeed?.(1);
        } else {
          shaderMount.current?.setSpeed?.(0.6);
        }
      }, 300);
    }

    if (active && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.detail === 0 ? rect.width / 2 : e.clientX - rect.left;
      const y = e.detail === 0 ? rect.height / 2 : e.clientY - rect.top;
      const ripple = { x, y, id: rippleId.current++ };

      setRipples((prev) => [...prev, ripple]);
      const timer = setTimeout(() => {
        rippleTimers.current.delete(timer);
        setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
      }, 600);
      rippleTimers.current.add(timer);
    }

    onClick?.();
  };

  const ActionElement = href && !disabled ? "a" : "button";
  return (
    <div className="lv-metal-action" data-liquid-metal data-disabled={disabled || undefined} data-motion-active={active} style={{width:dimensions.width,height:dimensions.height}}>
      <div
        style={{
          perspective: "1000px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          style={{
            position: "relative",
            width: dimensions.width,
            height: dimensions.height,
            transformStyle: "preserve-3d",
            transition:
              "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
            transform: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: dimensions.width,
              height: dimensions.height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transformStyle: "preserve-3d",
              transition:
                "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transform: "translateZ(20px)",
              zIndex: 30,
              pointerEvents: "none",
            }}
          >
            {viewMode === "icon" && (
              <Sparkles
                size={16}
                style={{
                  color: textColor ?? (variant === "white" ? "#e5192a" : "#ffffff"),
                  filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.5))",
                  transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transform: "scale(1)",
                }}
              />
            )}
            {viewMode === "text" && (
              <span
                style={{
                  fontSize: "var(--liquid-button-label-size, 14px)",
                  color: textColor ?? (variant === "white" ? "#e5192a" : "#ffffff"),
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase" as const,
                  // No text shadow — clean crisp letters, button outer shadow is preserved
                  textShadow: "none",
                  transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transform: "scale(1)",
                  whiteSpace: stackedLabel ? "pre-line" : "var(--liquid-button-label-wrap, nowrap)",
                  lineHeight: 1.2,
                  maxWidth: stackedLabel ? "120px" : "var(--liquid-button-label-max-width, none)",
                }}
              >
                {label}
              </span>
            )}
          </div>

          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: dimensions.width,
              height: dimensions.height,
              transformStyle: "preserve-3d",
              transition:
                "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transform: `translateZ(10px) ${isPressed && !reduced ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
              zIndex: 20,
            }}
          >
            <div
              style={{
                width: dimensions.innerWidth,
                height: dimensions.innerHeight,
                margin: "2px",
                borderRadius: "100px",
                background: variant === "white"
                  ? "linear-gradient(180deg, #ffffff 0%, #f0ece8 100%)"
                  : "linear-gradient(180deg, #c01020 0%, #7a0010 50%, #3d0008 100%)",
                boxShadow: isPressed
                  ? "inset 0px 2px 4px rgba(0, 0, 0, 0.4), inset 0px 1px 2px rgba(0, 0, 0, 0.3)"
                  : "none",
                transition:
                  "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>

          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: dimensions.width,
              height: dimensions.height,
              transformStyle: "preserve-3d",
              transition:
                "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transform: `translateZ(0px) ${isPressed && !reduced ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
              zIndex: 10,
            }}
          >
            <div
              style={{
                height: dimensions.height,
                width: dimensions.width,
                borderRadius: "100px",
                boxShadow: noShadow
                  ? "none"
                  : isPressed
                    ? "0px 0px 0px 1px rgba(0, 0, 0, 0.5), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)"
                    : isHovered
                      ? "0px 0px 0px 1px rgba(0, 0, 0, 0.4), 0px 12px 6px 0px rgba(0, 0, 0, 0.05), 0px 8px 5px 0px rgba(0, 0, 0, 0.1), 0px 4px 4px 0px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.2)"
                      : "0px 0px 0px 1px rgba(0, 0, 0, 0.3), 0px 36px 14px 0px rgba(0, 0, 0, 0.02), 0px 20px 12px 0px rgba(0, 0, 0, 0.08), 0px 9px 9px 0px rgba(0, 0, 0, 0.12), 0px 2px 5px 0px rgba(0, 0, 0, 0.15)",
                transition:
                  "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                background: "rgb(0 0 0 / 0)",
              }}
            >
              <div
                ref={shaderRef}
                className="shader-container-exploded lv-metal-shader"
                style={{
                  borderRadius: "100px",
                  overflow: "hidden",
                  position: "relative",
                  width: dimensions.shaderWidth,
                  maxWidth: dimensions.shaderWidth,
                  height: dimensions.shaderHeight,
                  filter: metalFilter,
                  transition: "opacity 0.2s ease",
                }}
              />
            </div>
          </div>

          {/* The shader supplies the moving material. This fixed contour keeps
              the pill perimeter complete between highlight passes. */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: "1px",
              zIndex: 25,
              borderRadius: "100px",
              border: `1px solid ${contourColor}`,
              boxShadow: metalTone === "gold"
                ? "inset 0 1px 0 rgba(255, 249, 209, 0.95), inset 0 -1px 0 rgba(111, 61, 0, 0.75), 0 0 0 1px rgba(101, 55, 0, 0.65)"
                : "inset 0 1px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 0 rgba(72, 91, 95, 0.8), 0 0 0 1px rgba(43, 57, 60, 0.7)",
              pointerEvents: "none",
            }}
          />

          <ActionElement
            ref={(node: HTMLButtonElement | HTMLAnchorElement | null) => { buttonRef.current = node; }}
            type={ActionElement === "button" ? type : undefined}
            href={ActionElement === "a" ? href : undefined}
            target={target}
            rel={rel}
            disabled={ActionElement === "button" ? disabled : undefined}
            className={className + " lv-metal-hit"}
            data-cta-target
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: dimensions.width,
              height: dimensions.height,
              background: "transparent",
              border: "none",
              cursor: disabled ? "default" : "pointer",
              zIndex: 40,
              transformStyle: "preserve-3d",
              transform: "translateZ(25px)",
              transition:
                "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
              overflow: "hidden",
              borderRadius: "100px",
            }}
            aria-label={label.replace(/\s+/g, " ")}
          >
            <span className="lv-metal-sr">{label}</span>
            {ripples.map((ripple) => (
              <span
                key={ripple.id}
                style={{
                  position: "absolute",
                  left: `${ripple.x}px`,
                  top: `${ripple.y}px`,
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)",
                  pointerEvents: "none",
                  animation: "ripple-animation 0.6s ease-out",
                }}
              />
            ))}
          </ActionElement>
        </div>
      </div>
    </div>
  );
}
