import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { PaymentMock } from "@/components/booking/payment-mock";

export const metadata: Metadata = {
  title: "Płatność",
  robots: { index: false, follow: false },
};

export default async function PlatnoscPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/portal/umow-wizyte/platnosc");
  }

  return (
    <div className="bg-muted/40 py-10 md:py-14">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <Link
          href="/portal/umow-wizyte"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-deep"
        >
          <ArrowLeft className="size-4" />
          Wróć do rezerwacji
        </Link>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-brand-heading">
            Płatność
          </h1>
          <div className="section-divider mt-3" />
        </div>
        <PaymentMock />
      </div>
    </div>
  );
}
