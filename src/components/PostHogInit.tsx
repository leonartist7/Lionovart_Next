"use client";

import { useEffect } from "react";
import { initPostHog } from "@/lib/posthog-client";

export function PostHogInit() {
  useEffect(() => {
    initPostHog();
  }, []);
  return null;
}
