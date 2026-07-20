import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone, UserRound } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { ContentSection } from "@/components/layout/content-section";
import { MapSection } from "@/components/map-section";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontakt z Centrum Medycznym Kiryluk i Wenta w Białymstoku — adres, telefony, e-mail, godziny rejestracji.",
  alternates: { canonical: "/kontakt" },
};

export default function KontaktPage() {
  return (
    <>
      <PageHero title="Kontakt" />

      <ContentSection>
        <div className="grid items-start gap-10 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted shadow-sm">
            <Image
              src="/images/centrum-medyczne.webp"
              alt="Centrum Medyczne Kiryluk i Wenta"
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 50vw"
              priority
            />
          </div>

          <div className="text-center md:text-left">
            <p className="text-lg font-semibold text-brand-heading">
              {siteConfig.company}
            </p>
            <p className="mt-2 text-[17px] leading-relaxed text-[#777]">
              {siteConfig.hours}
            </p>

            <div className="mt-8 space-y-6">
              <div className="flex flex-col items-center gap-1 md:items-start">
                <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-secondary text-brand">
                  <MapPin className="size-4" />
                </div>
                <h2 className="text-base font-bold text-brand-heading">
                  {siteConfig.address.city}
                </h2>
                <a
                  href={siteConfig.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:text-black"
                >
                  {siteConfig.address.streetAlt}
                </a>
              </div>

              <div className="flex flex-col items-center gap-1 md:items-start">
                <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-secondary text-brand">
                  <Phone className="size-4" />
                </div>
                <h2 className="text-base font-bold text-brand-heading">
                  Telefon
                </h2>
                {siteConfig.phones.map((phone) => (
                  <a
                    key={phone.href}
                    href={phone.href}
                    className="text-brand hover:text-black"
                  >
                    {phone.label}
                  </a>
                ))}
              </div>

              <div className="flex flex-col items-center gap-1 md:items-start">
                <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-secondary text-brand">
                  <Mail className="size-4" />
                </div>
                <h2 className="text-base font-bold text-brand-heading">
                  E-mail
                </h2>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-brand hover:text-black"
                >
                  {siteConfig.email}
                </a>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
              <Button
                asChild
                className="h-11 gap-2 bg-brand text-white hover:bg-brand-deep"
              >
                <Link href="/login">
                  <UserRound className="size-4" />
                  Rejestracja / Portal Pacjenta
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 border-brand/30 text-brand"
              >
                <a href={siteConfig.phones[0]!.href}>Zadzwoń do rejestracji</a>
              </Button>
            </div>
          </div>
        </div>
      </ContentSection>

      <MapSection height={450} />
    </>
  );
}
