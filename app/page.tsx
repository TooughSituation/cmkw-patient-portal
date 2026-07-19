import { Hero } from "@/components/hero";
import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";

/** Strona główna — układ jak cmkirylukwenta.pl (+ CTA portalu w hero/navbar). */
export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutSection />
      <ContactSection />
    </>
  );
}
