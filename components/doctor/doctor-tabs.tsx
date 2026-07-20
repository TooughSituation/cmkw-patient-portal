"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOCTOR_NAV } from "@/lib/doctor/nav";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function DoctorTabs() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/doctor") return pathname === "/doctor";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav
      className="border-b border-slate-200 bg-white"
      aria-label="Główne sekcje EDM"
    >
      <div className="flex gap-0 overflow-x-auto px-2 md:px-4">
        {DOCTOR_NAV.map((item) => {
          const active = isActive(item.href);
          if (item.disabled) {
            return (
              <button
                key={item.href}
                type="button"
                onClick={() =>
                  toast.info(`${item.label} — dostępne w Etapie 2`)
                }
                className={cn(
                  "relative shrink-0 border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-slate-600 md:px-4",
                  "cursor-pointer"
                )}
              >
                {item.label}
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors md:px-4",
                active
                  ? "border-[#0849b0] text-[#0849b0]"
                  : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
