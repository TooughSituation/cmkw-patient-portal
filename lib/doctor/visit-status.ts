import type { VisitStatus } from "@/lib/doctor/types";

export const VISIT_STATUS_STYLES: Record<VisitStatus, string> = {
  scheduled:
    "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50",
  confirmed: "border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-50",
  teleconfirmed:
    "border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-50",
  in_progress: "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-50",
  cancelled: "border-red-200 bg-red-50 text-red-700 hover:bg-red-50",
  completed: "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-100",
};

/** Statusy, przy których wizyta „czeka” na telepotwierdzenie */
export function isPendingTeleconfirm(
  status: VisitStatus,
  needsTeleconfirm: boolean
): boolean {
  if (!needsTeleconfirm) return false;
  return status === "scheduled" || status === "confirmed";
}
