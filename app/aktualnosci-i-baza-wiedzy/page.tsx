import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { ContentSection, Prose } from "@/components/layout/content-section";
import { newsArticles, newsPage } from "@/lib/content/news";

export const metadata: Metadata = {
  title: newsPage.title,
  description:
    "Aktualności i baza wiedzy Centrum Medycznego Kiryluk i Wenta — nowości, metody leczenia i osiągnięcia zespołu.",
  alternates: { canonical: "/aktualnosci-i-baza-wiedzy" },
};

export default function AktualnosciPage() {
  return (
    <>
      <PageHero title={newsPage.heading} />

      <ContentSection patterned>
        <Prose>
          {newsPage.intro.map((p) => (
            <p key={p} className="text-center">
              {p}
            </p>
          ))}
        </Prose>
      </ContentSection>

      <ContentSection>
        <div className="grid gap-10 md:gap-12">
          {newsArticles.map((article) => (
            <article
              key={article.slug}
              className="grid gap-6 border-b border-gray-100 pb-10 last:border-0 md:grid-cols-[280px_1fr] md:pb-12"
            >
              <Link
                href={`/aktualnosci-i-baza-wiedzy/${article.slug}`}
                className="relative block aspect-[16/10] overflow-hidden rounded-lg bg-muted shadow-sm"
              >
                <Image
                  src={article.image}
                  alt=""
                  fill
                  className="object-cover transition-transform hover:scale-[1.02]"
                  sizes="(max-width:768px) 100vw, 280px"
                />
              </Link>
              <div>
                <h2 className="text-lg font-bold leading-snug text-brand-heading md:text-xl">
                  <Link
                    href={`/aktualnosci-i-baza-wiedzy/${article.slug}`}
                    className="hover:text-brand"
                  >
                    {article.title}
                  </Link>
                </h2>
                <p className="mt-3 text-[17px] leading-relaxed text-[#555]">
                  {article.excerpt}
                </p>
                <Link
                  href={`/aktualnosci-i-baza-wiedzy/${article.slug}`}
                  className="mt-4 inline-block text-sm font-bold text-brand hover:text-black"
                >
                  Czytaj więcej →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </ContentSection>
    </>
  );
}
