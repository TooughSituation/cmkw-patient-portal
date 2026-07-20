import { Hero } from "@/components/hero";
import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";

/**
 * Strona główna — odwzorowanie cmkirylukwenta.pl:
 * Hero → O nas → Kontakt → Mapa.
 * Dozwolone różnice: CTA Portal Pacjenta / Dla Lekarza.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutSection />
      <ContactSection />
    </>
  );
}
