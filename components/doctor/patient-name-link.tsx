import Link from "next/link";
import { cn } from "@/lib/utils";

export function PatientNameLink({
  patientId,
  firstName,
  lastName,
  className,
  showDoctorHint,
  doctorName,
}: {
  patientId?: string;
  firstName: string;
  lastName: string;
  className?: string;
  showDoctorHint?: boolean;
  doctorName?: string;
}) {
  const name = (
    <span className={cn("font-medium", className)}>
      {firstName} {lastName}
    </span>
  );

  return (
    <div>
      {patientId ? (
        <Link
          href={`/doctor/pacjenci/${patientId}`}
          className="text-brand hover:underline"
        >
          {name}
        </Link>
      ) : (
        name
      )}
      {showDoctorHint && doctorName ? (
        <div className="mt-0.5 text-xs text-slate-400">{doctorName}</div>
      ) : null}
    </div>
  );
}
