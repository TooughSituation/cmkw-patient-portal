import { DrugsBrowser } from "@/components/doctor/drugs-browser";

export default async function DrugsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; id?: string }>;
}) {
  const sp = await searchParams;
  return (
    <DrugsBrowser initialQuery={sp.q ?? ""} highlightId={sp.id} />
  );
}
