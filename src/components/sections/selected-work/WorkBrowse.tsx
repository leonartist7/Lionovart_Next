"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { WORK_PROJECTS } from "./projects";
import { GALLERY_WORK } from "./gallery";

export const WORK_INDUSTRIES = [...new Set(GALLERY_WORK.map(p => p.industry).filter(Boolean))];
export const WORK_STYLES = [...new Set(GALLERY_WORK.flatMap(p => p.styles))];
const matches = (p: (typeof GALLERY_WORK)[number], industry: string, style: string) =>
  (industry === "all" || p.industry === industry) && (style === "all" || p.styles.includes(style));
const Context = createContext({
  industry: "all", style: "all", projects: WORK_PROJECTS, galleryProjects: GALLERY_WORK,
  setIndustry: (value: string) => { void value; }, setStyle: (value: string) => { void value; },
});

export function WorkBrowseProvider({ children }: { children: ReactNode }) {
  const [industry, changeIndustry] = useState("all");
  const [style, changeStyle] = useState("all");
  const setIndustry = useCallback((value: string) => {
    if (!GALLERY_WORK.some(p => matches(p, value, style))) changeStyle("all");
    changeIndustry(value);
  }, [style]);
  const setStyle = useCallback((value: string) => {
    if (!GALLERY_WORK.some(p => matches(p, industry, value))) changeIndustry("all");
    changeStyle(value);
  }, [industry]);
  const galleryProjects = useMemo(() => GALLERY_WORK.filter(p => matches(p, industry, style)), [industry, style]);
  // Preserve the standalone film demos; homepage browsing uses the curated gallery.
  const value = useMemo(() => ({ industry, style, projects: WORK_PROJECTS, galleryProjects, setIndustry, setStyle }),
    [industry, style, galleryProjects, setIndustry, setStyle]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useWorkBrowse = () => useContext(Context);
