import { CalculatorsPanel } from "@/components/doctor/calculators-panel";

export default async function CalculatorsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const sp = await searchParams;
  return <CalculatorsPanel initialId={sp.id} />;
}
