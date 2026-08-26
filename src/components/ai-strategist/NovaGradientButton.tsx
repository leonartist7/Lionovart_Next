"use client";

import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

export function NovaGradientButton({ label = "Talk to Nova", onClick }: { label?: string; onClick?: () => void }) {
  return (
    <LiquidMetalButton
      label={label}
      width={200}
      variant="white"
      metalTone="gold"
      textColor="#17120a"
      alwaysAnimate
      onClick={onClick}
    />
  );
}
