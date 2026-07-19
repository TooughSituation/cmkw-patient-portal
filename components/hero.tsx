"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { CalendarPlus, Users } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";

export function Hero() {
  const router = useRouter();

  return (
    <section
      className="relative flex min-h-[520px] items-end overflow-hidden md:min-h-[640px]"
      aria-labelledby="hero-heading"
    >
      <Image
        src="/images/hero.webp"
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      {/* Overlay matching original: gradient from brand-deep */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-[rgba(43,45,129,0.85)] via-[rgba(43,45,129,0.35)] to-transparent"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-32 text-center md:px-6 md:pb-24 md:pt-48">
        <h1
          id="hero-heading"
          className="text-3xl font-extrabold uppercase tracking-wide text-white drop-shadow-[0_0_40px_#000] sm:text-4xl md:text-5xl"
        >
          {siteConfig.hero.title}
          <span className="mt-1 block text-2xl font-normal sm:text-3xl md:text-4xl">
            {siteConfig.hero.subtitle}
          </span>
        </h1>

        <p className="mt-4 text-xl font-bold uppercase tracking-wide text-white drop-shadow-[0_0_40px_#000] sm:text-2xl md:text-[2.5rem] md:leading-tight">
          {siteConfig.hero.heading}
        </p>

        <p className="mx-auto mt-4 max-w-2xl text-base font-bold uppercase tracking-wide text-white/95 sm:text-lg">
          {siteConfig.hero.lead}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={() => router.push("/login")}
            className="h-12 min-w-[200px] gap-2 bg-brand-deep px-6 text-base font-semibold text-white hover:bg-black"
          >
            <CalendarPlus className="size-5" />
            Portal / Rejestracja
          </Button>
          <Button
            size="lg"
            onClick={() => router.push("/#o-nas")}
            className="h-12 min-w-[200px] gap-2 bg-brand-deep px-6 text-base font-semibold text-white hover:bg-black"
          >
            <Users className="size-5" />
            Zobacz nasz zespół
          </Button>
        </div>
      </div>
    </section>
  );
}
