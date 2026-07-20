import { Badge } from "@/components/ui/badge";
import {
  VISIT_STATUS_LABELS,
  type VisitStatus,
} from "@/lib/doctor/types";
import { VISIT_STATUS_STYLES } from "@/lib/doctor/visit-status";
import { cn } from "@/lib/utils";

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
      className={cn("font-medium", VISIT_STATUS_STYLES[status], className)}
    >
      {VISIT_STATUS_LABELS[status]}
    </Badge>
  );
}
