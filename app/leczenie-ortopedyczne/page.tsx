import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import {
  BulletList,
  ContentSection,
  Prose,
  SectionHeading,
} from "@/components/layout/content-section";
import { CallBanner } from "@/components/layout/call-banner";
import { ortopediaPage } from "@/lib/content/ortopedia";

export const metadata: Metadata = {
  title: ortopediaPage.title,
  description:
    "Kompleksowe leczenie bólu i urazów narządu ruchu — diagnostyka, leczenie operacyjne i zachowawcze, PRP, USG bioderek.",
  alternates: { canonical: "/leczenie-ortopedyczne" },
};

export default function LeczenieOrtopedycznePage() {
  return (
    <>
      <PageHero title={ortopediaPage.heading} />

      <ContentSection patterned>
        <Prose>
          {ortopediaPage.intro.map((p) => (
            <p key={p.slice(0, 48)} className="text-center">
              {p}
            </p>
          ))}
        </Prose>
      </ContentSection>

      {ortopediaPage.sections.map((section, i) => (
        <ContentSection key={section.heading} patterned={i % 2 === 1}>
          <SectionHeading>{section.heading}</SectionHeading>
          <Prose>
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </Prose>
          <BulletList items={[...section.items]} />
        </ContentSection>
      ))}

      <CallBanner />
    </>
  );
}
