const fs = require('fs');
const pServices = '.claude/worktrees/crazy-taussig/src/components/sections/Services.tsx';
let cServices = fs.readFileSync(pServices, 'utf-8');

const targetRegex = /\{\/\* ── The Premium Floating Glass Panel ── \*\/\}[\s\S]*?onClick=\{\(\) => setActiveId\(service\.id\)\}/;

const replacement = `{/* ── The Premium Floating Glass Panel ── */}
        <motion.div
          className="relative rounded-[28px] bg-gradient-to-br from-[#e6e9ef] via-[#ffffff] to-[#d5d9e2]"
          style={{ padding: "1px" }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >

          {/* Inner glass panel */}
          <div
            className="
              relative
              rounded-[27px]
              border border-white/70
              bg-white/85
              backdrop-blur-xl
              shadow-[0_12px_32px_-8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_2px_8px_rgba(255,255,255,0.4)]
              p-6 md:p-12 lg:p-16
            "
          >
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 lg:gap-20 lg:items-start">

            {/* ── Left: Accordion ── */}
            <div>
              <Accordion
                className="flex flex-col"
                defaultValue={[SERVICES[0].id]}
              >
                {SERVICES.map((service) => (
                  <AccordionItem
                    key={service.id}
                    value={service.id}
                    className={\`transition-all duration-500 ease-out border-b border-black/[0.07] last:border-b-0 \${activeId === service.id ? 'bg-[#fcfdff] shadow-[0_4px_16px_rgba(0,0,0,0.03),0_-4px_16px_rgba(255,255,255,0.8)] relative z-10 px-4 -mx-4' : 'px-4 -mx-4'}\`}
                  >
                    <AccordionTrigger
                      className="group flex w-full items-center justify-between py-6 md:py-7 text-left hover:no-underline"
                      onClick={() => setActiveId(service.id)}`;

cServices = cServices.replace(targetRegex, replacement);

fs.writeFileSync(pServices, cServices);
console.log("Replaced panel successfully.");
