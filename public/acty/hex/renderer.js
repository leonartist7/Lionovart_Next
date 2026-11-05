import {assembleStages, loadBank} from './shaders.js';
import {createMediaSlot} from './media.js';

function link(gl, stages) {
  const program = gl.createProgram();
  const shaders = [];
  try {
    for (const [type, source] of [[gl.VERTEX_SHADER, stages.vertex], [gl.FRAGMENT_SHADER, stages.fragment]]) {
      const shader = gl.createShader(type);
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error('Hex shader compilation failed: ' + gl.getShaderInfoLog(shader));
      }
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error('Hex shader linking failed: ' + gl.getProgramInfoLog(program));
    }
    return program;
  } catch (error) {
    gl.deleteProgram(program);
    throw error;
  } finally {
    for (const shader of shaders) gl.deleteShader(shader);
  }
}

/** A two-scene compositor. The caller owns playback, input, and the rendering clock. */
export async function createHexRenderer(canvas, {
  webgl1 = false, mobile = globalThis.matchMedia?.('(pointer: coarse)').matches ?? false,
  preserveDrawingBuffer = false, fit = 'stretch', onError, onRestore
} = {}) {
  const bank = await loadBank();
  const attributes = {antialias: false, alpha: false, depth: false, stencil: false, preserveDrawingBuffer};
  let gl = webgl1 ? null : canvas.getContext('webgl2', attributes);
  const backend = gl ? 'webgl2' : 'webgl1';
  gl ??= canvas.getContext('webgl', attributes);
  if (!gl) throw new Error('This device could not open a WebGL context.');
  const stages = assembleStages(bank, {webgl1: backend === 'webgl1', mobile});
  const slots = [createMediaSlot(), createMediaSlot()];
  let program, buffer, uniforms, maxTextureSize, viewportLimit;
  let textures = [], disposed = false, paused = false;
  const names = ['uTransition', 'time', 'resolution', 'uAngle', 'uRatio', 'uVelocity', 'uAngleVelocity'];

  function initialize() {
    if (backend === 'webgl1' && !gl.getExtension('OES_standard_derivatives')) {
      throw new Error('The hex edge needs standard derivatives on WebGL 1.');
    }
    program = link(gl, stages);
    gl.useProgram(program);
    gl.disable(gl.BLEND);
    gl.disable(gl.DITHER);
    // DOM media is top-left first. The original two scene targets are bottom-left first.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1,-1,0, 0,0,   1,-1,0, 1,0,   -1,1,0, 0,1,   1,1,0, 1,1
    ]), gl.STATIC_DRAW);
    for (const [name, size, offset] of [['position', 3, 0], ['uv', 2, 12]]) {
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 20, offset);
    }
    uniforms = Object.fromEntries(names.map(name => [name, gl.getUniformLocation(program, name)]));
    for (let unit = 0; unit < slots.length; unit++) {
      textures[unit] = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, textures[unit]);
      for (const param of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, param, gl.CLAMP_TO_EDGE);
      for (const param of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, param, gl.LINEAR);
      gl.uniform1i(gl.getUniformLocation(program, 'tMap' + (unit + 1)), unit);
      slots[unit].invalidateTexture();
    }
    maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    viewportLimit = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
  }
  function releaseResources() {
    for (const texture of textures) gl.deleteTexture(texture);
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    program = buffer = null;
    textures = [];
  }
  function contextLost(event) {
    event.preventDefault();
    paused = true;
    onError?.(new Error('WebGL context lost. Restore or restart the preview.'));
  }
  function contextRestored() {
    if (disposed) return;
    try {
      initialize();
      paused = false;
      onRestore?.();
    } catch (error) {
      paused = true;
      releaseResources();
      onError?.(error);
    }
  }
  try { initialize(); }
  catch (error) { releaseResources(); throw error; }
  canvas.addEventListener('webglcontextlost', contextLost);
  canvas.addEventListener('webglcontextrestored', contextRestored);

  return {
    backend,
    setSource(slot, source, {fit: sourceFit = fit} = {}) {
      if (disposed) throw new Error('This compositor has been disposed.');
      if (slot !== 0 && slot !== 1) throw new RangeError('Choose scene slot 0 or 1.');
      if (sourceFit !== 'stretch' && sourceFit !== 'cover') throw new RangeError('Choose cover or stretch.');
      slots[slot].set(source, sourceFit);
    },
    resize(width, height) {
      if (disposed || paused) return;
      if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;
      const scale = Math.min(1, viewportLimit[0] / width, viewportLimit[1] / height);
      const w = Math.max(1, Math.round(width * scale)), h = Math.max(1, Math.round(height * scale));
      if (canvas.width === w && canvas.height === h) return;
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      for (const slot of slots) slot.markDirty();
    },
    draw(progress, timeSeconds, {angle = 0.8, ratio = gl.drawingBufferWidth / gl.drawingBufferHeight,
      velocity = 0, angleVelocity = 0} = {}) {
      if (disposed || paused || gl.isContextLost()) return false;
      try {
        const readyA = slots[0].upload(gl, textures[0], 0, maxTextureSize);
        const readyB = slots[1].upload(gl, textures[1], 1, maxTextureSize);
        if (!readyA || !readyB) return false;
        const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uniforms.resolution, w, h);
        gl.uniform1f(uniforms.uTransition, progress);
        gl.uniform1f(uniforms.time, timeSeconds);
        gl.uniform1f(uniforms.uAngle, angle);
        gl.uniform1f(uniforms.uRatio, ratio);
        gl.uniform1f(uniforms.uVelocity, velocity);
        gl.uniform1f(uniforms.uAngleVelocity, angleVelocity);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        return true;
      } catch (error) {
        if (!onError) throw error;
        paused = true;
        onError(error);
        return false;
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      canvas.removeEventListener('webglcontextlost', contextLost);
      canvas.removeEventListener('webglcontextrestored', contextRestored);
      for (const slot of slots) slot.reset();
      releaseResources();
    }
  };
}
