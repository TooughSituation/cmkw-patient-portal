import { IcdBrowser } from "@/components/doctor/icd-browser";

export default async function Icd10Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  return <IcdBrowser initialQuery={sp.q ?? ""} />;
}
