"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOCTOR_NAV, doctorNavTourId } from "@/lib/doctor/nav";
import { useDoctorData } from "@/components/doctor/doctor-data-provider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function DoctorTabs() {
  const pathname = usePathname();
  const { canAccessAdmin } = useDoctorData();

  function isActive(href: string) {
    if (href === "/doctor") return pathname === "/doctor";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const items = DOCTOR_NAV.filter((item) => {
    if (item.href === "/doctor/admin") return canAccessAdmin;
    return true;
  });

  return (
    <nav
      className="border-b border-slate-200 bg-white"
      aria-label="Główne sekcje EDM"
      data-tour="doctor-tabs"
    >
      <div className="flex gap-0 overflow-x-auto px-2 md:px-5">
        {items.map((item) => {
          const active = isActive(item.href);
          const tourId = doctorNavTourId(item.href);
          if (item.disabled) {
            return (
              <button
                key={item.href}
                type="button"
                data-tour={tourId}
                onClick={() =>
                  toast.info(`${item.label} — wkrótce`)
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
              data-tour={tourId}
              className={cn(
                "relative shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors md:px-4",
                active
                  ? "border-brand text-brand"
                  : "border-transparent text-slate-600 hover:border-slate-300 hover:text-brand-heading"
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
