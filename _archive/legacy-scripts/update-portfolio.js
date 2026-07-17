const fs = require('fs');
const pPortfolio = '.claude/worktrees/crazy-taussig/src/components/sections/Portfolio.tsx';
let cPortfolio = fs.readFileSync(pPortfolio, 'utf-8');

// add useInView
cPortfolio = cPortfolio.replace(
  'AnimatePresence,',
  'AnimatePresence,\n  useInView,'
);

// replace both useEffect instances
const oldEffect = /useEffect\(\(\) => \{\s*const styleId = "shader-canvas-style-card";[\s\S]*?\}, \[\]\);/g;

const newEffect = `  const isInView = useInView(shaderRef, { margin: "300px" });

  useEffect(() => {
    if (!isInView) {
      if (shaderMount.current?.destroy) {
        const canvas = shaderRef.current?.querySelector("canvas");
        if (canvas) {
          const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
          gl?.getExtension("WEBGL_lose_context")?.loseContext();
        }
        shaderMount.current.destroy();
        shaderMount.current = null;
      }
      return;
    }

    if (shaderRef.current) {
      if (shaderMount.current?.destroy) shaderMount.current.destroy();
      shaderMount.current = new ShaderMount(
        shaderRef.current,
        liquidMetalFragmentShader,
        { u_repetition: 3, u_softness: 0.6, u_shiftRed: 0.65, u_shiftBlue: 0.0, u_distortion: 0, u_scale: 6, u_shape: 1 },
        undefined,
        0.15
      );
    }
    return () => { 
      if (shaderMount.current?.destroy) {
        const canvas = shaderRef.current?.querySelector("canvas");
        if (canvas) {
          const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
          gl?.getExtension("WEBGL_lose_context")?.loseContext();
        }
        shaderMount.current.destroy(); 
        shaderMount.current = null; 
      }
    };
  }, [isInView]);`;

cPortfolio = cPortfolio.replace(oldEffect, newEffect);
fs.writeFileSync(pPortfolio, cPortfolio);
console.log("Updated Portfolio.tsx");
