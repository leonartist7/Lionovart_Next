const fs = require('fs');

const pButton = '.claude/worktrees/crazy-taussig/src/components/ui/liquid-metal-button.tsx';
let cButton = fs.readFileSync(pButton, 'utf-8');

// Replace useEffect
const oldEffect = /useEffect\(\(\) => \{\s*const styleId[\s\S]*?\}, \[\]\);/;
const newEffect = `  const isInView = useInView(shaderRef, { margin: "200px" });

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

    const loadShader = async () => {
      try {
        if (shaderRef.current) {
          if (shaderMount.current?.destroy) {
            shaderMount.current.destroy();
          }

          shaderMount.current = new ShaderMount(
            shaderRef.current,
            liquidMetalFragmentShader,
            {
              u_repetition: 4,
              u_softness: 0.5,
              u_shiftRed: 0.65,
              u_shiftBlue: 0.0,
              u_distortion: 0,
              u_contour: 0,
              u_angle: 45,
              u_scale: 8,
              u_shape: 1,
              u_offsetX: 0.1,
              u_offsetY: -0.1,
            },
            undefined,
            0.6
          );
        }
      } catch (error) {
        console.error("[v0] Failed to load shader:", error);
      }
    };

    loadShader();

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

cButton = cButton.replace(oldEffect, newEffect);

// Replace mouse handlers
const oldHandlers = /const handleMouseEnter = \(\) => \{[\s\S]*?const handleClick/m;
const newHandlers = `const handleMouseEnter = () => {
    if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
      setIsHovered(true);
      shaderMount.current?.setSpeed?.(1);
    }
  };

  const handleMouseLeave = () => {
    if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
      setIsHovered(false);
      setIsPressed(false);
      shaderMount.current?.setSpeed?.(0.6);
    }
  };

  const handleTouchStart = () => setIsPressed(true);
  const handleTouchEnd = () => setIsPressed(false);

  const handleClick`;

cButton = cButton.replace(oldHandlers, newHandlers);

// Add touch handlers to button
cButton = cButton.replace(/onMouseDown\{\(\) => setIsPressed\(true\)\}/g, "onMouseDown={() => setIsPressed(true)}\n            onTouchStart={handleTouchStart}\n            onTouchEnd={handleTouchEnd}");
cButton = cButton.replace(/onMouseUp=\{\(\) => setIsPressed\(false\)\}/g, "onMouseUp={() => setIsPressed(false)}\n            onTouchStart={handleTouchStart}\n            onTouchEnd={handleTouchEnd}");

fs.writeFileSync(pButton, cButton);
console.log("Updated liquid-metal-button.tsx");
