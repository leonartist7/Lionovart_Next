"use client";

import type { ReactNode } from "react";
import SmoothScrollProvider from "./SmoothScrollProvider";
import { IntroProvider } from "@/components/ui/IntroLifecycle";
import SplashScreen from "@/components/ui/SplashScreen";
import SiteTitleReveal from "@/components/ui/SiteTitleReveal";
import { NovaPortalMount } from "@/components/ai-strategist/NovaPortalMount";
import { StickyCTA } from "@/components/ai-strategist/StickyCTA";
import TubesCursor from "@/components/ui/TubesCursor";
import CustomCursor from "@/components/ui/CustomCursor";
import BottomBlur from "@/components/ui/BottomBlur";

export default function CinematicExperience({ children }: { children: ReactNode }) {
  return <IntroProvider>
    <SmoothScrollProvider><SplashScreen /><SiteTitleReveal />{children}</SmoothScrollProvider>
    <NovaPortalMount /><StickyCTA /><TubesCursor /><CustomCursor /><BottomBlur />
  </IntroProvider>;
}
