"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useMotionValueEvent, useTransform } from "framer-motion";
import { Popover } from "@base-ui/react/popover";
import { ChevronDown, Check } from "lucide-react";
import { usePublicCopy } from "@/hooks/usePublicCopy";
import { useWorkBrowse, WORK_INDUSTRIES, WORK_STYLES } from "./selected-work/WorkBrowse";
import styles from "./ServicesWorkNavigation.module.css";

const subscribeClient = () => () => {};
const clamp = (value: number) => Math.min(1, Math.max(0, value));

function WorkControls() {
  const tr = usePublicCopy();
  const browse = useWorkBrowse();
  const [open, setOpen] = useState<"industry" | "style" | null>(null);
  return <div className={styles.workControls} data-work-browse-controls>
    {(["industry", "style"] as const).map(kind => {
      const industry = kind === "industry";
      const label = industry ? "Industries" : "Styles";
      const current = industry ? browse.industry : browse.style;
      const options = industry ? WORK_INDUSTRIES : WORK_STYLES;
      return <Popover.Root key={kind} open={open === kind} onOpenChange={value => setOpen(value ? kind : null)}>
        <Popover.Trigger className={styles.browseButton} data-work-filter={kind}
          aria-label={tr(industry ? "Browse industries" : "Browse styles")}>
          {tr(label)}<ChevronDown aria-hidden="true" />
          {current !== "all" && <span className={styles.activeDot} aria-hidden="true" />}
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner className={styles.positioner} side="top" sideOffset={12} collisionPadding={16}>
            <Popover.Popup className={styles.popup}>
              <Popover.Title className={styles.filterTitle}>{tr(label)}</Popover.Title>
              {["all", ...options].map(value => <button key={value} type="button" className={styles.filterOption}
                aria-pressed={current === value} onClick={() => {
                  if (industry) browse.setIndustry(value as Parameters<typeof browse.setIndustry>[0]);
                  else browse.setStyle(value as Parameters<typeof browse.setStyle>[0]);
                  setOpen(null);
                }}>
                <span>{tr(value === "all" ? industry ? "All industries" : "All styles" : value)}</span>
                {current === value && <Check aria-hidden="true" />}
              </button>)}
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>;
    })}
  </div>;
}

/** One viewport-anchored pill bridges the services and the work beneath them. */
export default function ServicesWorkNavigation({ services, activeIndex, onSelect }: {
  services: readonly { id: string; number: string; short: string }[];
  activeIndex: number; onSelect: (index: number) => void;
}) {
  const tr = usePublicCopy();
  const browse = useWorkBrowse();
  const client = useSyncExternalStore(subscribeClient, () => true, () => false);
  const visibility = useMotionValue(0);
  const handoff = useMotionValue(0);
  const [workMode, setWorkMode] = useState(false);
  const [visible, setVisible] = useState(false);
  useMotionValueEvent(handoff, "change", value => setWorkMode(value >= .5));
  useMotionValueEvent(visibility, "change", value => setVisible(value > .01));
  const serviceOpacity = useTransform(handoff, [0, .4, .5, 1], [1, 0, 0, 0]);
  const workOpacity = useTransform(handoff, [0, .5, .7, 1], [0, 0, 1, 1]);

  useEffect(() => {
    if (!client) return;
    let frame = 0;
    const services = document.querySelector<HTMLElement>("[data-services-runway], [data-services-static]");
    const work = document.getElementById("selected-work");
    if (!services) return;
    const sync = () => {
      frame = 0;
      const h = window.innerHeight;
      const rect = services.getBoundingClientRect();
      const workRect = work?.getBoundingClientRect();
      visibility.set(clamp(1 - rect.top / (h * .2)) *
        clamp(((workRect?.bottom ?? rect.bottom) - h * .12) / (h * .15)));
      handoff.set(workRect ? clamp((h * .75 - workRect.top) / (h * .45)) : 0);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    const observer = new ResizeObserver(schedule);
    observer.observe(services);
    if (work) observer.observe(work);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("lionovart:splash-complete", schedule);
    sync();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("lionovart:splash-complete", schedule);
    };
  }, [client, browse.industry, browse.style, visibility, handoff]);

  if (!client) return null;
  return createPortal(<motion.nav className={styles.frame} data-services-work-navigation data-browse-mode={workMode ? "work" : "services"}
    aria-label={tr(workMode ? "Browse selected work" : "Our services")}
    aria-hidden={!visible} inert={!visible}
    style={{ opacity: visibility, visibility: visible ? "visible" : "hidden" }}>
    <div className={styles.pill}>
      <motion.div className={styles.serviceControls} style={{ opacity: serviceOpacity }} aria-hidden={workMode} inert={workMode}>
        {services.map((service, index) => <button key={service.id} type="button" className={styles.serviceButton}
          data-service-option aria-pressed={index === activeIndex} onClick={() => onSelect(index)}>
          <span className={styles.serviceLabel}>{tr(service.short)}</span>
          <span className={styles.serviceNumber}>{service.number}</span>
        </button>)}
      </motion.div>
      <motion.div className={styles.workLayer} style={{ opacity: workOpacity }} aria-hidden={!workMode} inert={!workMode}>
        {workMode && visible && <WorkControls />}
      </motion.div>
    </div>
  </motion.nav>, document.body);
}
