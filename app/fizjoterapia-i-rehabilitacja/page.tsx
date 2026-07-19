import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import {
  BulletList,
  ContentSection,
  Prose,
  SectionHeading,
} from "@/components/layout/content-section";
import { CallBanner } from "@/components/layout/call-banner";
import { fizjoterapiaPage } from "@/lib/content/fizjoterapia";

export const metadata: Metadata = {
  title: fizjoterapiaPage.title,
  description:
    "Fizjoterapia i rehabilitacja narządu ruchu — rehabilitacja pooperacyjna, leczenie zachowawcze, wynajem szyn CPM.",
  alternates: { canonical: "/fizjoterapia-i-rehabilitacja" },
};

export default function FizjoterapiaPage() {
  return (
    <>
      <PageHero title={fizjoterapiaPage.heading} />

      <ContentSection patterned>
        <Prose>
          {fizjoterapiaPage.intro.map((p) => (
            <p key={p.slice(0, 48)} className="text-center">
              {p}
            </p>
          ))}
        </Prose>
      </ContentSection>

      {fizjoterapiaPage.sections.map((section, i) => (
        <ContentSection key={section.heading} patterned={i % 2 === 0}>
          <SectionHeading>{section.heading}</SectionHeading>
          <Prose>
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </Prose>
          <BulletList items={[...section.items]} />
          {"after" in section && section.after
            ? section.after.map((p) => (
                <p
                  key={p.slice(0, 40)}
                  className="mt-4 text-[17px] leading-relaxed text-[#333]"
                >
                  {p}
                </p>
              ))
            : null}
        </ContentSection>
      ))}

      <CallBanner />
    </>
  );
}
