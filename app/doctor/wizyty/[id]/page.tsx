import { VisitCard } from "@/components/doctor/visit-card";

export default async function VisitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VisitCard visitId={id} />;
}
