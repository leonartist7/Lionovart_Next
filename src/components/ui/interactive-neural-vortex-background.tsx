"use client";

import { useEffect, useRef } from "react";

/**
 * A full-viewport WebGL field for the AI Systems page.
 *
 * It intentionally renders only the field. Keeping page copy out of this
 * component makes it safe to use as a background behind the existing route.
 */
export default function InteractiveNeuralVortex() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const animationFrame = useRef<number | null>(null);
  const story = useRef({ opacity: 0, lionOpacity: 1, stream: 1, gold: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
    });
    if (!gl) return;

    const vertexSource = `
      precision mediump float;
      attribute vec2 a_position;
      varying vec2 vUv;

      void main() {
        vUv = 0.5 * (a_position + 1.0);
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentSource = `
      precision mediump float;
      varying vec2 vUv;
      uniform float u_time;
      uniform float u_ratio;
      uniform vec2 u_pointer_position;
      uniform float u_scroll_progress;
      uniform float u_stream;
      uniform float u_gold;

      vec2 rotate(vec2 uv, float angle) {
        return mat2(cos(angle), sin(angle), -sin(angle), cos(angle)) * uv;
      }

      float neuroShape(vec2 uv, float time, float proximity) {
        vec2 sineAccumulator = vec2(0.0);
        vec2 result = vec2(0.0);
        float scale = 8.0;

        for (int index = 0; index < 15; index++) {
          uv = rotate(uv, 1.0);
          sineAccumulator = rotate(sineAccumulator, 1.0);
          vec2 layer = uv * scale + float(index) + sineAccumulator - time;
          sineAccumulator += sin(layer) + 2.4 * proximity;
          result += (0.5 + 0.5 * cos(layer)) / scale;
          scale *= 1.2;
        }

        return result.x + result.y;
      }

      void main() {
        vec2 uv = 0.5 * vUv;
        uv.x *= u_ratio;
        uv.y += 0.00008 * u_time * u_stream;

        vec2 pointer = vUv - u_pointer_position;
        pointer.x *= u_ratio;
        float proximity = clamp(length(pointer), 0.0, 1.0);
        proximity = 0.5 * pow(1.0 - proximity, 2.0);

        float noise = neuroShape(uv, 0.001 * u_time, proximity);
        noise = 1.2 * pow(noise, 3.0) + pow(noise, 10.0);
        noise = max(0.0, noise - 0.5);
        noise *= 1.0 - length(vUv - 0.5);

        float distanceToStream = abs(vUv.x - 0.5);
        float streamMask = 1.0 - smoothstep(0.035, 0.18, distanceToStream);
        float streamPulse = 0.72 + 0.42 * sin(vUv.y * 42.0 - 0.004 * u_time);
        noise *= mix(1.0, streamMask * streamPulse, u_stream);

        vec3 color = vec3(0.5, 0.15, 0.65);
        color = mix(color, vec3(0.02, 0.7, 0.9), 0.32 + 0.16 * sin(2.0 * u_scroll_progress + 1.2));
        color += vec3(0.15, 0.0, 0.6) * sin(2.0 * u_scroll_progress + 1.5);
        color = mix(color, vec3(0.95, 0.67, 0.12), u_gold);

        gl_FragColor = vec4(color * noise, noise);
      }
    `;

    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Neural vortex shader error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    };

    const vertexShader = compileShader(vertexSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentSource, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Neural vortex program error:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return;
    }

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) return;

    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const time = gl.getUniformLocation(program, "u_time");
    const ratio = gl.getUniformLocation(program, "u_ratio");
    const pointerPosition = gl.getUniformLocation(program, "u_pointer_position");
    const scrollProgress = gl.getUniformLocation(program, "u_scroll_progress");
    const stream = gl.getUniformLocation(program, "u_stream");
    const gold = gl.getUniformLocation(program, "u_gold");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const lionCanvas = document.querySelector<HTMLCanvasElement>("[data-ai-lion-stage]");
    type SceneName = "stakes" | "flow" | "neural" | "close";
    const sceneElements: Record<SceneName, HTMLElement | null> = {
      stakes: document.querySelector<HTMLElement>('[data-ai-scene="stakes"]'),
      flow: document.querySelector<HTMLElement>('[data-ai-scene="flow"]'),
      neural: document.querySelector<HTMLElement>('[data-ai-scene="neural"]'),
      close: document.querySelector<HTMLElement>('[data-ai-scene="close"]'),
    };
    const scenePositions: Record<SceneName, { top: number; height: number }> = {
      stakes: { top: 0, height: 1 },
      flow: { top: 0, height: 1 },
      neural: { top: 0, height: 1 },
      close: { top: 0, height: 1 },
    };

    const measureScenes = () => {
      (Object.entries(sceneElements) as [SceneName, HTMLElement | null][]).forEach(([name, element]) => {
        if (!element) return;
        const rect = element.getBoundingClientRect();
        scenePositions[name] = {
          top: rect.top + window.scrollY,
          height: Math.max(rect.height, 1),
        };
      });
    };

    const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
    const between = (position: number, start: number, end: number) =>
      clamp01((position - start) / Math.max(end - start, 1));
    const mix = (start: number, end: number, progress: number) =>
      start + (end - start) * progress;

    const getStoryTargets = () => {
      const position = window.scrollY + window.innerHeight * 0.5;
      const stakesStart = scenePositions.stakes.top;
      const flowStart = scenePositions.flow.top;
      const neuralStart = scenePositions.neural.top;
      const closeStart = scenePositions.close.top;

      if (position < stakesStart) {
        return { opacity: 0, lionOpacity: 1, stream: 1, gold: 0 };
      }

      if (position < flowStart) {
        const progress = between(position, stakesStart, flowStart);
        return {
          opacity: mix(0, 0.32, progress),
          lionOpacity: mix(1, 0.52, progress),
          stream: 1,
          gold: 0,
        };
      }

      if (position < neuralStart) {
        const progress = between(position, flowStart, neuralStart);
        return {
          opacity: mix(0.32, 1, progress),
          lionOpacity: mix(0.52, 0, progress),
          stream: mix(1, 0, progress),
          gold: 0,
        };
      }

      if (position < closeStart) {
        return { opacity: 1, lionOpacity: 0, stream: 0, gold: 0 };
      }

      const progress = between(
        position,
        closeStart,
        closeStart + scenePositions.close.height * 0.78,
      );
      return {
        opacity: 1 - progress,
        lionOpacity: progress,
        stream: progress,
        gold: progress,
      };
    };

    const resizeObserver = new ResizeObserver(measureScenes);
    Object.values(sceneElements).forEach((element) => {
      if (element) resizeObserver.observe(element);
    });

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = Math.round(window.innerWidth * pixelRatio);
      canvas.height = Math.round(window.innerHeight * pixelRatio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(ratio, canvas.width / canvas.height);
    };

    const draw = (timestamp: number) => {
      gl.clear(gl.COLOR_BUFFER_BIT);

      const targets = getStoryTargets();
      story.current.opacity += (targets.opacity - story.current.opacity) * 0.08;
      story.current.lionOpacity += (targets.lionOpacity - story.current.lionOpacity) * 0.08;
      story.current.stream += (targets.stream - story.current.stream) * 0.08;
      story.current.gold += (targets.gold - story.current.gold) * 0.08;

      canvas.style.opacity = String(story.current.opacity);
      if (lionCanvas) lionCanvas.style.opacity = String(story.current.lionOpacity);
      if (story.current.opacity <= 0.003) return;

      pointer.current.x += (pointer.current.targetX - pointer.current.x) * 0.2;
      pointer.current.y += (pointer.current.targetY - pointer.current.y) * 0.2;

      gl.uniform1f(time, timestamp);
      gl.uniform2f(pointerPosition, pointer.current.x / window.innerWidth, 1 - pointer.current.y / window.innerHeight);
      gl.uniform1f(scrollProgress, window.scrollY / (2 * window.innerHeight));
      gl.uniform1f(stream, story.current.stream);
      gl.uniform1f(gold, story.current.gold);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const render = (timestamp: number) => {
      draw(timestamp);
      animationFrame.current = window.requestAnimationFrame(render);
    };

    const updatePointer = (x: number, y: number) => {
      pointer.current.targetX = x;
      pointer.current.targetY = y;
    };
    const handlePointerMove = (event: PointerEvent) => updatePointer(event.clientX, event.clientY);
    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) updatePointer(touch.clientX, touch.clientY);
    };

    pointer.current.x = pointer.current.targetX = window.innerWidth / 2;
    pointer.current.y = pointer.current.targetY = window.innerHeight / 2;
    resize();
    measureScenes();
    document.fonts?.ready.then(measureScenes);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    if (reducedMotion.matches) {
      draw(0);
    } else {
      animationFrame.current = window.requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
      resizeObserver.disconnect();
      if (lionCanvas) lionCanvas.style.opacity = "";
      if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current);
      gl.deleteBuffer(vertexBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] h-full w-full bg-transparent opacity-0 will-change-transform"
    />
  );
}
