"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StatusPill, type LeadStatus } from "@/components/admin/StatusPill";

const STATUSES: LeadStatus[] = ["new", "contacted", "booked", "won", "lost"];

export function LeadStatusSelect({ leadId, status }: { leadId: string; status: LeadStatus }) {
  const [value, setValue] = useState(status);
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function handleChange(next: LeadStatus) {
    const prev = value;
    setValue(next); // optimistic
    const res = await fetch(`/api/admin/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      setValue(prev); // revert
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value as LeadStatus)}
        className="absolute inset-0 z-10 cursor-pointer opacity-0"
        aria-label="Lead status"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <StatusPill status={value} />
    </div>
  );
}
