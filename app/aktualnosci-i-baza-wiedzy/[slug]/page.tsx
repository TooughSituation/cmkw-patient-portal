import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  BulletList,
  ContentSection,
  Prose,
} from "@/components/layout/content-section";
import { CallBanner } from "@/components/layout/call-banner";
import { getNewsBySlug, newsArticles } from "@/lib/content/news";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return newsArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getNewsBySlug(slug);
  if (!article) return { title: "Aktualność" };
  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: `/aktualnosci-i-baza-wiedzy/${article.slug}`,
    },
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getNewsBySlug(slug);
  if (!article) notFound();

  return (
    <>
      <ContentSection className="!pt-10 !pb-6">
        <Link
          href="/aktualnosci-i-baza-wiedzy"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-black"
        >
          <ArrowLeft className="size-4" />
          Wróć do aktualności
        </Link>
        <h1 className="text-2xl font-bold leading-snug text-brand-heading md:text-3xl">
          {article.title}
        </h1>
        <div className="section-divider mt-4 ml-0" />
      </ContentSection>

      <ContentSection patterned className="!pt-0">
        <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-lg bg-muted shadow-sm">
          <Image
            src={article.image}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width:900px) 100vw, 900px"
            priority
          />
        </div>
        <Prose>
          {article.body.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
        </Prose>
        {article.items ? <BulletList items={article.items} /> : null}
        {article.slug.includes("embolizacji") ? (
          <p className="mt-6 text-[17px] leading-relaxed text-[#333]">
            Cieszymy się, że wiedza i doświadczenie zdobywane podczas tak
            pionierskich procedur bezpośrednio przekładają się na najwyższą
            jakość opieki, jaką oferujemy pacjentom w naszej poradni.
          </p>
        ) : null}
      </ContentSection>

      <CallBanner />
    </>
  );
}
