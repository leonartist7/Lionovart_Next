"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, MessageSquare, SlidersHorizontal, BarChart3, ShieldAlert } from "lucide-react";

const NAV = [
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/conversations", label: "Conversations", icon: MessageSquare },
  { href: "/admin/objections", label: "Objections", icon: ShieldAlert },
  { href: "/admin/studio", label: "Studio", icon: SlidersHorizontal },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.replace("/admin/login");
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-full w-[220px] shrink-0 flex-col border-r border-white/8 bg-[#0c0c0c] md:flex">
        <div className="flex items-center gap-2 px-5 py-6">
          <span className="size-1.5 rounded-full bg-[var(--color-brand-red)]" />
          <span className="font-[var(--font-clash)] text-xs tracking-[0.25em] text-white uppercase">
            Nova
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  active ? "bg-white/6 text-white" : "text-white/50 hover:text-white"
                }`}
              >
                {active && (
                  <span className="absolute top-1 bottom-1 left-0 w-0.5 rounded-full bg-[var(--color-brand-red)]" />
                )}
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/8 px-3 py-4">
          <p className="truncate px-3 text-[11px] text-white/35">{email}</p>
          <button
            onClick={signOut}
            className="mt-1 w-full rounded-md px-3 py-1.5 text-left text-[11px] text-white/40 transition-colors hover:text-white/70"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/8 bg-[#0c0c0c] px-4 md:hidden">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-[var(--color-brand-red)]" />
          <span className="font-[var(--font-clash)] text-xs tracking-[0.25em] text-white uppercase">
            Nova
          </span>
        </div>
        <nav className="flex items-center gap-4">
          {NAV.map(({ href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} className={active ? "text-white" : "text-white/40"}>
                <Icon size={17} />
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
