import Link from "next/link";
import { PatientForm } from "@/components/doctor/patient-form";

export default function NewPatientPage() {
  return (
    <div className="p-3 md:p-4 lg:p-5">
      <div className="mb-5">
        <p className="text-sm text-muted-foreground">
          <Link href="/doctor/pacjenci" className="text-brand hover:underline">
            Pacjenci
          </Link>
          <span className="mx-1.5">/</span>
          Nowy
        </p>
        <h1 className="mt-1 text-lg font-semibold text-brand-heading md:text-xl">
          Dodaj pacjenta
        </h1>
      </div>
      <PatientForm mode="create" />
    </div>
  );
}
