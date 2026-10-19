/** Authored vector art shared by the live materials and lightweight fallback. */
export const SERVICE_EXHIBITS = {
  branding: 'brand', web: 'digital', 'content-studio': 'content',
  print: 'spaces', 'smart-systems': 'systems', led: 'led',
} as const;
export type ServiceId = keyof typeof SERVICE_EXHIBITS;
export type StudioExhibit = 'brand' | 'digital' | 'spaces' | 'systems';
export const STUDIO_PALETTES: Record<StudioExhibit, { ink: string; paper: string; accent: string }> = {
  brand: { ink: '#592638', paper: '#f4e9dd', accent: '#c5a569' },
  digital: { ink: '#233b86', paper: '#eef1f9', accent: '#a5bbf1' },
  spaces: { ink: '#a34831', paper: '#f4e7d7', accent: '#d4b07b' },
  systems: { ink: '#203f3b', paper: '#eaf1eb', accent: '#bed397' },
};
export function serviceExhibit(id: string) {
  return SERVICE_EXHIBITS[id as ServiceId] ?? 'empty';
}
export function boundedVariant(value: number) { return Number.isFinite(value) ? Math.max(0, Math.min(3, Math.floor(value))) : 0; }
const rect = (x: number, y: number, w: number, h: number, fill: string, r = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
const text = (x: number, y: number, value: string, size: number, fill: string, weight = 500) => `<text x="${x}" y="${y}" fill="${fill}" font-family="Arial,sans-serif" font-size="${size}" font-weight="${weight}">${value}</text>`;
export function sceneArtwork(exhibit: StudioExhibit, rawVariant: number, detail = false): string {
  const v = boundedVariant(rawVariant), { ink, paper, accent } = STUDIO_PALETTES[exhibit];
  let art = rect(0, 0, 960, 640, paper);
  if (exhibit === 'brand') {
    art = rect(0, 0, 960, 640, v === 1 || detail ? paper : ink);
    const color = v === 1 || detail ? ink : paper;
    art += text(55, 65, 'ATELIER / A', 26, color) + text(55, 575, 'IDENTITY   /   OBJECTS   /   CULTURE', 16, color);
    if (v === 3) {
      art += text(55, 180, detail ? 'Aa Bb Cc' : 'A considered', 74, color, 600) + text(55, 265, detail ? '01 / 02 / 03' : 'point of view.', 74, color, 600);
      [ink, accent, paper, '#9a706e'].forEach((c, i) => { art += rect(55 + i * 210, 345, 190, 130, c); });
    } else {
      art += `<path d="M480 120 L660 480 H580 L480 265 L380 480 H300Z" fill="${color}"/><path d="M395 390 H565" stroke="${accent}" stroke-width="12"/>`;
      if (v === 1) art += text(680, 230, 'FORM', 38, ink, 700) + text(680, 280, 'WITH', 38, ink, 700) + text(680, 330, 'FEELING.', 38, ink, 700);
    }
  } else if (exhibit === 'digital') {
    art += rect(0, 0, 960, 62, '#ffffff') + text(35, 40, 'FORMA', 25, ink, 700) + text(690, 39, 'EXPLORE    /    CONNECT', 14, ink);
    if (v === 0) {
      art += text(55, 160, 'SPACE TO', 65, ink, 700) + text(55, 232, 'BECOME.', 65, ink, 700) + text(55, 290, 'A thoughtful digital experience.', 20, ink);
      art += rect(55, 335, 180, 48, ink, 24) + text(80, 367, 'Discover more', 18, '#ffffff');
      art += `<ellipse cx="710" cy="290" rx="160" ry="180" fill="${ink}"/><ellipse cx="740" cy="260" rx="95" ry="135" fill="${accent}"/>`;
      [55, 345, 635].forEach(x => { art += rect(x, 475, 265, 100, '#ffffff', 12); });
    } else if (v === 1) {
      art += text(55, 135, 'Your space. Connected.', 40, ink, 700);
      [0, 1, 2].forEach(i => { art += rect(55 + i * 290, 180, 265, 150, i === 0 ? ink : '#ffffff', 14) + text(80 + i * 290, 235, ['PROJECTS', 'MESSAGES', 'YOUR TEAM'][i], 18, i === 0 ? paper : ink); });
      art += rect(55, 365, 555, 210, '#ffffff', 14) + rect(640, 365, 265, 210, accent, 14);
      [0, 1, 2].forEach(i => { art += rect(85, 400 + i * 55, 420 - i * 60, 15, '#dce2ef', 7); });
    } else if (v === 2) {
      art += text(55, 140, 'Objects for everyday.', 48, ink, 700);
      [0, 1, 2].forEach(i => { art += rect(55 + i * 290, 185, 265, 300, '#ffffff', 10) + `<ellipse cx="${187 + i * 290}" cy="330" rx="65" ry="95" fill="${[ink, accent, '#c9c2b5'][i]}"/>` + rect(75 + i * 290, 510, 220, 42, ink, 21); });
    } else {
      art += text(55, 145, 'Built around people.', 45, ink, 700);
      [0, 1, 2].forEach(i => { art += rect(55 + i * 290, 210, 265, 330, '#ffffff', 16) + rect(80 + i * 290, 240, 215, 110, i === 1 ? ink : accent, 12); [0,1,2].forEach(j => { art += rect(80 + i * 290, 380 + j * 38, 210 - j * 35, 13, '#dce2ef', 6); }); });
    }
  } else if (exhibit === 'spaces') {
    art = rect(0, 0, 960, 640, detail ? paper : ink);
    const c = detail ? ink : paper;
    art += text(55, 65, 'ATELIER / LIVE', 24, c) + text(55, 240, ['COME', 'FIND YOUR', 'STEP', 'MAKE A'][v], 100, c, 700) + text(55, 350, ['TOGETHER.', 'WAY.', 'INSIDE.', 'MARK.'][v], 100, c, 700);
    art += `<path d="M680 550 V470 a130 130 0 0 1 260 0 V640 H680Z" fill="${accent}"/>` + text(55, 575, ['EXPERIENCES THAT STAY WITH YOU', 'A CLEAR SENSE OF PLACE', 'A NEW WAY TO MEET YOUR BRAND', 'DESIGNED TO BE HELD'][v], 18, c);
  } else {
    art = rect(0, 0, 960, 640, '#f3f5ef');
    art += rect(0, 0, 190, 640, ink) + text(28, 60, 'AOS / ONE', 25, paper, 700);
    ['OVERVIEW', 'CLIENTS', 'WORKFLOWS', 'INSIGHTS'].forEach((s, i) => { art += (v === i ? rect(16, 110 + i * 70, 158, 48, '#3b5b51', 8) : '') + text(28, 140 + i * 70, s, 15, paper); });
    art += text(225, 75, ['Everything, connected.', 'A shared place to work.', 'Less routine. More flow.', 'See the whole picture.'][v], 32, ink, 700);
    [0, 1, 2].forEach(i => { art += rect(225 + i * 240, 115, 215, 105, i === v % 3 ? accent : '#e1e8dc', 12) + text(245 + i * 240, 155, ['PROJECTS', 'ACTIVITY', 'NEXT UP'][i], 15, ink) + rect(245 + i * 240, 180, 145, 7, ink, 3); });
    art += rect(225, 250, 695, 330, '#ffffff', 12);
    if (v === 2) {
      [0,1,2].forEach(i => { art += rect(265 + i * 215, 350, 180, 100, i === 1 ? ink : '#e1e8dc', 12) + text(285 + i * 215, 410, ['RECEIVE', 'ORGANIZE', 'DELIVER'][i], 19, i === 1 ? paper : ink); });
      art += `<path d="M445 400H480 M660 400H695" stroke="${ink}" stroke-width="4"/>`;
    } else if (v === 3) {
      [110, 180, 130, 215, 170, 245, 220].forEach((h, i) => { art += rect(265 + i * 85, 550 - h, 48, h, i === 5 ? ink : accent, 6); });
    } else {
      [0,1,2,3].forEach(i => { art += rect(255, 285 + i * 70, 38, 38, accent, 19) + rect(315, 290 + i * 70, 325 - i * 30, 12, '#c4d1c5', 6) + rect(315, 315 + i * 70, 190, 7, '#e1e8dc', 3) + rect(795, 290 + i * 70, 90, 25, '#e1e8dc', 12); });
    }
  }
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640">${art}</svg>`)}`;
}
