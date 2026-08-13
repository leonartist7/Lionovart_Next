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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: true, antialias: false });
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

        vec2 pointer = vUv - u_pointer_position;
        pointer.x *= u_ratio;
        float proximity = clamp(length(pointer), 0.0, 1.0);
        proximity = 0.5 * pow(1.0 - proximity, 2.0);

        float noise = neuroShape(uv, 0.001 * u_time, proximity);
        noise = 1.2 * pow(noise, 3.0) + pow(noise, 10.0);
        noise = max(0.0, noise - 0.5);
        noise *= 1.0 - length(vUv - 0.5);

        vec3 color = vec3(0.5, 0.15, 0.65);
        color = mix(color, vec3(0.02, 0.7, 0.9), 0.32 + 0.16 * sin(2.0 * u_scroll_progress + 1.2));
        color += vec3(0.15, 0.0, 0.6) * sin(2.0 * u_scroll_progress + 1.5);

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
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const time = gl.getUniformLocation(program, "u_time");
    const ratio = gl.getUniformLocation(program, "u_ratio");
    const pointerPosition = gl.getUniformLocation(program, "u_pointer_position");
    const scrollProgress = gl.getUniformLocation(program, "u_scroll_progress");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = Math.round(window.innerWidth * pixelRatio);
      canvas.height = Math.round(window.innerHeight * pixelRatio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(ratio, canvas.width / canvas.height);
    };

    const draw = (timestamp: number) => {
      pointer.current.x += (pointer.current.targetX - pointer.current.x) * 0.2;
      pointer.current.y += (pointer.current.targetY - pointer.current.y) * 0.2;

      gl.uniform1f(time, timestamp);
      gl.uniform2f(pointerPosition, pointer.current.x / window.innerWidth, 1 - pointer.current.y / window.innerHeight);
      gl.uniform1f(scrollProgress, window.scrollY / (2 * window.innerHeight));
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
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-95 will-change-transform"
    />
  );
}
