const fs = require('fs');
const pReality = '.claude/worktrees/crazy-taussig/src/components/sections/Reality.tsx';
let cReality = fs.readFileSync(pReality, 'utf-8');

// add useInView
cReality = cReality.replace(
  'import { motion } from "framer-motion";',
  'import { motion, useInView } from "framer-motion";'
);

const oldEffect = /useEffect\(\(\) => \{\s*const styleId = "shader-canvas-style-card";[\s\S]*?\}, \[\]\);/;

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
        0.12
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

cReality = cReality.replace(oldEffect, newEffect);

// Add touch support to the card container
cReality = cReality.replace(/onMouseEnter=\{handleMouseEnter\}/, "onMouseEnter={handleMouseEnter}\n      onTouchStart={() => setIsFlipped(!isFlipped)}");

fs.writeFileSync(pReality, cReality);
console.log("Updated Reality.tsx");
