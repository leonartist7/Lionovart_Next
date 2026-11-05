// Only registry directives and GLSL interface syntax are expanded here.
// Desktop ES 3.00 output is byte-identical to the two stages in the golden fixture.
const packedHash = 'ced9b995fd423a33c187274502404a7ab8f4e2ef635480a0bf1921776667d513';
let sourcePromise;

async function fetchBank() {
  const response = await fetch(new URL('./motion-vector.vs', import.meta.url));
  if (!response.ok) throw new Error('Could not load the 360 Motion Vector shader (' + response.status + ').');
  const bytes = await response.arrayBuffer();
  if (globalThis.crypto?.subtle) {
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
    const hex = Array.from(hash, byte => byte.toString(16).padStart(2, '0')).join('');
    if (hex !== packedHash) throw new Error('360 Motion Vector shader checksum mismatch.');
  }
  return new TextDecoder().decode(bytes);
}

export function loadBank() {
  sourcePromise ??= fetchBank().catch(error => {
    sourcePromise = undefined;
    throw error;
  });
  return sourcePromise;
}

export function assembleStages(bank, {webgl1 = false, mobile = false} = {}) {
  const parts = bank.split('{@}');
  const modules = new Map();
  for (let i = 1; i < parts.length; i += 2) modules.set(parts[i], parts[i + 1]);
  function expand(name) {
    if (!modules.has(name)) throw new Error('Missing shader module ' + name);
    return modules.get(name)
      .replace(/#test Device\.mobile\s*([\s\S]*?)#endtest/g, mobile ? '$1' : '')
      .replace(/#test !Device\.mobile\s*([\s\S]*?)#endtest/g, mobile ? '' : '$1')
      .replace(/#require\(([^)]+)\)/g, (_, dep) => expand(dep));
  }
  const [declarations, bodies] = expand('FXScrollTransition.glsl').split('#!SHADER: Vertex');
  const [vertexBody, fragmentBody] = bodies.split('#!SHADER: Fragment');
  const shared = declarations.replace(/^#!.*$/gm, '');
  const precision = 'precision highp float;\nprecision highp int;\n';
  if (webgl1) {
    return {
      vertex: precision + 'attribute vec3 position; attribute vec2 uv;\n' + shared + vertexBody,
      fragment: '#extension GL_OES_standard_derivatives : require\n' + precision
        + 'uniform vec2 resolution; uniform float time;\n' + shared + fragmentBody
    };
  }
  const header = '#version 300 es\n' + precision;
  return {
    vertex: header + 'in vec3 position; in vec2 uv;\n' + shared.replace(/\bvarying\b/g, 'out') + vertexBody,
    fragment: header + 'uniform vec2 resolution; uniform float time; out vec4 outColor;\n'
      + shared.replace(/\bvarying\b/g, 'in')
      + fragmentBody.replace(/\btexture2D\b/g, 'texture').replace(/\bgl_FragColor\b/g, 'outColor')
  };
}
