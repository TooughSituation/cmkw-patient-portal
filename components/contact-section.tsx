import { Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { MapSection } from "@/components/map-section";

export function ContactSection() {
  return (
    <>
      <section
        id="kontakt"
        className="scroll-mt-28 bg-white py-[75px]"
        aria-labelledby="contact-heading"
      >
        <div className="mx-auto max-w-[900px] px-4 text-center md:px-6">
          <h2
            id="contact-heading"
            className="text-2xl font-bold uppercase tracking-wide text-brand-heading md:text-3xl"
          >
            Kontakt
          </h2>
          {/* Divider jak na oryginale — 100px, #384480 */}
          <div
            className="mx-auto mt-3 mb-8 h-px w-[100px] bg-brand-heading"
            aria-hidden
          />

          <p className="text-lg font-semibold text-brand-heading">
            {siteConfig.company}
          </p>
          <p className="mt-2 text-[17px] text-[#777]">{siteConfig.hours}</p>

          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2">
              <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-brand">
                <MapPin className="size-5" aria-hidden />
              </div>
              <h3 className="text-base font-bold text-brand-heading">
                {siteConfig.address.city}
              </h3>
              <a
                href={siteConfig.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[15px] text-brand transition-colors hover:text-black"
              >
                {siteConfig.address.streetAlt}
              </a>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-brand">
                <Phone className="size-5" aria-hidden />
              </div>
              <h3 className="text-base font-bold text-brand-heading">Telefon</h3>
              {siteConfig.phones.map((phone) => (
                <a
                  key={phone.href}
                  href={phone.href}
                  className="text-[15px] text-brand transition-colors hover:text-black"
                >
                  {phone.label}
                </a>
              ))}
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-brand">
                <Mail className="size-5" aria-hidden />
              </div>
              <h3 className="text-base font-bold text-brand-heading">E-mail</h3>
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-[15px] text-brand transition-colors hover:text-black"
              >
                {siteConfig.email}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Mapa na dole strony głównej — jak oryginał */}
      <MapSection height={450} />
    </>
  );
}
