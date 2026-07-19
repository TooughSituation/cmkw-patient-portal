import { Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function ContactSection() {
  return (
    <section
      id="kontakt"
      className="scroll-mt-28 bg-white py-16 md:py-20"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto max-w-4xl px-4 text-center md:px-6">
        <h2
          id="contact-heading"
          className="text-2xl font-bold uppercase tracking-wide text-brand-heading md:text-3xl"
        >
          Kontakt
        </h2>
        <div className="section-divider mt-3 mb-8" />

        <p className="text-lg font-semibold text-brand-heading">
          {siteConfig.company}
        </p>
        <p className="mt-2 text-muted-foreground">{siteConfig.hours}</p>

        <div className="mt-10 grid gap-8 sm:grid-cols-3">
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
              className="text-sm text-brand hover:text-foreground"
            >
              {siteConfig.address.street}
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
                className="text-sm text-brand hover:text-foreground"
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
              className="text-sm text-brand hover:text-foreground"
            >
              {siteConfig.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
