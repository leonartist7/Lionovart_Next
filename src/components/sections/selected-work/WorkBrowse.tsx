"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { WORK_PROJECTS, type WorkProject } from "./projects";

export const WORK_INDUSTRIES = ["Finance", "Social media"] as const;
export const WORK_STYLES = ["Editorial", "Illustrative"] as const;
type Industry = "all" | WorkProject["industry"];
type Style = "all" | WorkProject["style"];
const Context = createContext({
  industry: "all" as Industry, style: "all" as Style, projects: WORK_PROJECTS,
  setIndustry: (value: Industry) => { void value; }, setStyle: (value: Style) => { void value; },
});

export function WorkBrowseProvider({ children }: { children: ReactNode }) {
  const [industry, changeIndustry] = useState<Industry>("all");
  const [style, changeStyle] = useState<Style>("all");
  const setIndustry = useCallback((value: Industry) => {
    // Keep every selection useful: release an incompatible second filter.
    if (!WORK_PROJECTS.some(p => (value === "all" || p.industry === value) && (style === "all" || p.style === style))) changeStyle("all");
    changeIndustry(value);
  }, [style]);
  const setStyle = useCallback((value: Style) => {
    if (!WORK_PROJECTS.some(p => (industry === "all" || p.industry === industry) && (value === "all" || p.style === value))) changeIndustry("all");
    changeStyle(value);
  }, [industry]);
  const projects = useMemo(() => WORK_PROJECTS.filter(p =>
    (industry === "all" || p.industry === industry) && (style === "all" || p.style === style)
  ), [industry, style]);
  const value = useMemo(() => ({ industry, style, projects, setIndustry, setStyle }), [industry, style, projects, setIndustry, setStyle]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useWorkBrowse = () => useContext(Context);
