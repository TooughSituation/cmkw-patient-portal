import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/layout/page-hero";
import {
  BulletList,
  ContentSection,
  Prose,
} from "@/components/layout/content-section";
import { CallBanner } from "@/components/layout/call-banner";
import { teamIntro, teamMembers } from "@/lib/content/team";

export const metadata: Metadata = {
  title: "Nasz Zespół",
  description:
    "Zespół lekarski Centrum Medycznego Kiryluk i Wenta – ortopedzi z pasją i doświadczeniem w Białymstoku.",
  alternates: { canonical: "/nasz-zespol" },
};

export default function NaszZespolPage() {
  return (
    <>
      <PageHero title={teamIntro.heading} />

      <ContentSection patterned>
        <Prose>
          <p className="text-center text-lg font-medium text-brand-heading">
            {teamIntro.lead}
          </p>
          <p className="text-center">{teamIntro.text}</p>
        </Prose>
      </ContentSection>

      {teamMembers.map((member, index) => (
        <ContentSection
          key={member.id}
          patterned={index % 2 === 1}
          id={member.id}
        >
          <div className="grid items-start gap-8 md:grid-cols-[220px_1fr]">
            <div className="mx-auto w-full max-w-[220px]">
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-gray-100 bg-secondary shadow-sm">
                <Image
                  src={member.image}
                  alt={`${member.title} ${member.name}`}
                  fill
                  className="object-cover object-top"
                  sizes="220px"
                />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-heading md:text-2xl">
                {member.title} {member.name}
              </h2>
              {member.role ? (
                <p className="mt-1 text-sm font-semibold text-brand">
                  {member.role}
                </p>
              ) : null}
              <div className="mt-4 space-y-3 text-[17px] leading-relaxed text-[#333]">
                {member.paragraphs.map((p) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
              </div>

              {member.sections?.map((sec) => (
                <div key={sec.heading} className="mt-5">
                  <h3 className="text-base font-bold text-brand-heading">
                    {sec.heading}
                  </h3>
                  <BulletList items={sec.items} />
                </div>
              ))}

              {member.extraLists?.length ? (
                <BulletList items={member.extraLists} />
              ) : null}

              {member.znanyLekarzUrl ? (
                <a
                  href={member.znanyLekarzUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm font-semibold text-brand hover:text-black"
                >
                  Zobacz komentarze na ZnanyLekarz →
                </a>
              ) : null}
            </div>
          </div>
        </ContentSection>
      ))}

      <CallBanner />
    </>
  );
}
