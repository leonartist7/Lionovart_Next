const fs = require('fs');

function processFile(filePath, config) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace the aggressive mount/unmount effect with a run-once effect
  const oldEffectRegex = /useEffect\(\(\) => \{\s*if \(\!isInView\) \{[\s\S]*?\}, \[isInView\]\);/g;
  
  const newEffect = `useEffect(() => {
    const loadShader = async () => {
      try {
        if (${config.ref}.current) {
          if (${config.mount}.current?.destroy) ${config.mount}.current.destroy();
          ${config.mount}.current = new ShaderMount(
            ${config.ref}.current,
            liquidMetalFragmentShader,
            ${config.options},
            undefined,
            ${config.defaultSpeed}
          );
        }
      } catch (error) {
        console.error("Failed to load shader:", error);
      }
    };
    
    loadShader();

    return () => {
      if (${config.mount}.current?.destroy) {
        const canvas = ${config.ref}.current?.querySelector("canvas");
        if (canvas) {
          const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
          gl?.getExtension("WEBGL_lose_context")?.loseContext();
        }
        ${config.mount}.current.destroy();
        ${config.mount}.current = null;
      }
    };
  }, []);

  // Separate effect to pause animation when off-screen to save battery without recompiling
  useEffect(() => {
    if (${config.mount}.current?.setSpeed) {
      if (isInView) {
        ${config.mount}.current.setSpeed(${config.inViewSpeed});
      } else {
        ${config.mount}.current.setSpeed(0); // Pause when off-screen
      }
    }
  }, [isInView${config.extraDeps ? ', ' + config.extraDeps : ''}]);`;

  content = content.replace(oldEffectRegex, newEffect);
  fs.writeFileSync(filePath, content);
  console.log("Fixed", filePath);
}

// 1. LiquidMetalButton
processFile('.claude/worktrees/crazy-taussig/src/components/ui/liquid-metal-button.tsx', {
  ref: 'shaderRef',
  mount: 'shaderMount',
  options: `{ u_repetition: 4, u_softness: 0.5, u_shiftRed: 0.65, u_shiftBlue: 0.0, u_distortion: 0, u_contour: 0, u_angle: 45, u_scale: 8, u_shape: 1, u_offsetX: 0.1, u_offsetY: -0.1 }`,
  defaultSpeed: '0.6',
  inViewSpeed: 'isHovered ? 1 : 0.6',
  extraDeps: 'isHovered'
});

// 2. Services
processFile('.claude/worktrees/crazy-taussig/src/components/sections/Services.tsx', {
  ref: 'panelShaderRef',
  mount: 'panelShaderMount',
  options: `{ u_repetition: 3, u_softness: 0.6, u_shiftRed: 1.0, u_shiftBlue: 1.0, u_distortion: 0, u_scale: 6, u_shape: 1 }`,
  defaultSpeed: '0.15',
  inViewSpeed: '0.15'
});

// 3. Portfolio
processFile('.claude/worktrees/crazy-taussig/src/components/sections/Portfolio.tsx', {
  ref: 'shaderRef',
  mount: 'shaderMount',
  options: `{ u_repetition: 3, u_softness: 0.6, u_shiftRed: 0.65, u_shiftBlue: 0.0, u_distortion: 0, u_scale: 6, u_shape: 1 }`,
  defaultSpeed: '0.15',
  inViewSpeed: '0.15'
});

// 4. Reality
processFile('.claude/worktrees/crazy-taussig/src/components/sections/Reality.tsx', {
  ref: 'shaderRef',
  mount: 'shaderMount',
  options: `{ u_repetition: 3, u_softness: 0.6, u_shiftRed: 0.65, u_shiftBlue: 0.0, u_distortion: 0, u_scale: 6, u_shape: 1 }`,
  defaultSpeed: '0.12',
  inViewSpeed: '0.12'
});
