const fs = require('fs');

const pAbout = '.claude/worktrees/crazy-taussig/src/components/sections/AboutUsHalf.tsx';
let cAbout = fs.readFileSync(pAbout, 'utf-8');

// 1. Change section background
cAbout = cAbout.replace(
  'bg-bg-dark text-center h-[35vh] sm:h-[42vh] md:h-[50vh]',
  'bg-[#181818] text-center h-auto min-h-[35vh] sm:min-h-[42vh] md:min-h-[50vh] pb-20'
);

// 2. Replace the cards container
const cardsRegex = /\{\/\* ── 2 "Mini-Video" Style Cards Underneath ── \*\/\}[\s\S]*?<\/div>\r?\n\s*<\/div>\r?\n\s*<\/section>/;

const newCards = `{/* ── 2 Neumorphic Text Cards Underneath ── */}
        <div className="flex w-full max-w-[800px] gap-6 md:gap-10 mt-10 md:mt-16">
          
          {/* Card 1 — 10 Years */}
          <div className="relative flex-1 flex flex-col justify-center items-center rounded-[20px] bg-[#181818] shadow-[12px_12px_24px_rgba(0,0,0,0.6),-6px_-6px_20px_rgba(255,255,255,0.03)] ring-1 ring-white/[0.02] p-6 md:p-10 text-center h-auto min-h-[160px] md:min-h-[220px]">
            <h3 className="text-[20px] sm:text-[24px] md:text-[36px] font-bold text-[#e5192a] uppercase tracking-widest font-clash leading-none mb-3">
              10 Years
            </h3>
            <h4 className="text-white font-bold text-[13px] md:text-[16px] mb-1.5 uppercase tracking-wider">Creative Experience</h4>
            <p className="text-white/50 text-[11px] md:text-[13px] leading-[1.6] max-w-[95%] mx-auto">
              Expertise across digital innovation, audiovisual production and printed media.
            </p>
          </div>

          {/* Card 2 — 9 Languages */}
          <div className="relative flex-1 flex flex-col justify-center items-center rounded-[20px] bg-[#181818] shadow-[12px_12px_24px_rgba(0,0,0,0.6),-6px_-6px_20px_rgba(255,255,255,0.03)] ring-1 ring-white/[0.02] p-6 md:p-10 text-center h-auto min-h-[160px] md:min-h-[220px]">
            <h3 className="text-[20px] sm:text-[24px] md:text-[36px] font-bold text-[#e5192a] uppercase tracking-widest font-clash leading-none mb-3">
              9 Languages
            </h3>
            <h4 className="text-white font-bold text-[13px] md:text-[16px] mb-1.5 uppercase tracking-wider">Global Reach</h4>
            <p className="text-white/50 text-[11px] md:text-[13px] leading-[1.6] max-w-[95%] mx-auto">
              A multilingual team serving clients across 4 continents.
            </p>
          </div>

        </div>
      </div>
    </section>`;

cAbout = cAbout.replace(cardsRegex, newCards);

fs.writeFileSync(pAbout, cAbout);
console.log("AboutUsHalf.tsx updated with text-only dark neumorphism.");
