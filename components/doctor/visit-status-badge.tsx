import { Badge } from "@/components/ui/badge";
import {
  VISIT_STATUS_LABELS,
  type VisitStatus,
} from "@/lib/doctor/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<VisitStatus, string> = {
  scheduled:
    "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50",
  confirmed:
    "border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-50",
  cancelled:
    "border-red-200 bg-red-50 text-red-700 hover:bg-red-50",
  completed:
    "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-100",
};

export function VisitStatusBadge({
  status,
  className,
}: {
  status: VisitStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", statusStyles[status], className)}
    >
      {VISIT_STATUS_LABELS[status]}
    </Badge>
  );
}
