const fs = require('fs');
const pServices = '.claude/worktrees/crazy-taussig/src/components/sections/Services.tsx';
let cServices = fs.readFileSync(pServices, 'utf-8');

// 1. Remove ShaderMount import
cServices = cServices.replace(/import \{ liquidMetalFragmentShader, ShaderMount \} from "@paper-design\/shaders";\r?\n/, '');

// 2. Remove hooks (refs, useInView, useEffects)
// The hooks are right after const [activeId, setActiveId] = useState<string>(SERVICES[0].id);
// We can just slice them out.
const startHooks = cServices.indexOf('// biome-ignore lint/suspicious/noExplicitAny: External library without types');
const endHooks = cServices.indexOf('  return (');
if (startHooks !== -1 && endHooks !== -1) {
  cServices = cServices.substring(0, startHooks) + cServices.substring(endHooks);
}

// 3. Remove the div containing the shader
const shaderContainerRegex = /\s*\{\/\* Liquid metal shader rim \*\/\}\r?\n\s*<div\r?\n\s*ref=\{panelShaderRef\}\r?\n\s*className="shader-container-card"[\s\S]*?\/>/g;
cServices = cServices.replace(shaderContainerRegex, '');

fs.writeFileSync(pServices, cServices);
console.log("Services cleaned.");