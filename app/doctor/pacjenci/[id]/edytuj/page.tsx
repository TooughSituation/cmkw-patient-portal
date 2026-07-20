import { PatientEditClient } from "@/components/doctor/patient-edit-client";

export default async function PatientEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PatientEditClient patientId={id} />;
}
