import { PatientCard } from "@/components/doctor/patient-card";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PatientCard patientId={id} />;
}
