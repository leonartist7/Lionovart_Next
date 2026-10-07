import type { ReactElement, ReactNode } from "react";

export type JellyRadioItem = { value: string; label: ReactNode; icon?: ReactNode; disabled?: boolean };
export type JellyRadioProps = {
  items?: Array<string | JellyRadioItem>;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, index: number) => void;
  chipColor?: string;
  activeColor?: string;
  textColor?: string;
  activeTextColor?: string;
  size?: "sm" | "md" | "lg";
  gap?: number;
  radius?: number;
  swell?: number;
  barge?: number;
  shrink?: number;
  jelly?: number;
  bounce?: number;
  stagger?: number;
  stiffness?: number;
  wrap?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
};
export default function JellyRadio(props: JellyRadioProps): ReactElement;
