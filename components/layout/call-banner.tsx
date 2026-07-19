import { Phone } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function CallBanner() {
  const phone = siteConfig.phones[0]!;
  return (
    <section className="bg-brand-deep py-12 text-center text-white md:py-14">
      <div className="mx-auto max-w-3xl px-4">
        <p className="text-lg font-medium md:text-xl">
          Masz pytania lub chcesz umówić się na wizytę?
        </p>
        <p className="mt-3 text-sm font-bold uppercase tracking-[0.2em] text-white/80">
          Zadzwoń!
        </p>
        <a
          href={phone.href}
          className="mt-5 inline-flex items-center gap-2 text-2xl font-bold text-white transition-colors hover:text-white/90 md:text-3xl"
        >
          <Phone className="size-6" aria-hidden />
          {phone.label}
        </a>
      </div>
    </section>
  );
}
