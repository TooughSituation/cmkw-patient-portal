"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { CalendarPlus, Users, UserRound } from "lucide-react";
import { useSession } from "next-auth/react";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";

export function Hero() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated" && !!session?.user;

  return (
    <section
      className="relative flex min-h-[560px] items-end overflow-hidden md:min-h-[680px]"
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
      {/* Overlay jak oryginał: gradient z #2b2d81 */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-[rgba(43,45,129,0.88)] via-[rgba(43,45,129,0.4)] to-transparent"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-36 text-center md:px-6 md:pb-24 md:pt-52">
        <h1
          id="hero-heading"
          className="text-[28px] font-extrabold uppercase leading-tight tracking-wide text-white drop-shadow-[0_0_40px_#000] sm:text-4xl md:text-[50px]"
        >
          {siteConfig.hero.title}
          <span className="mt-1 block text-[22px] font-normal sm:text-3xl md:text-[40px]">
            {siteConfig.hero.subtitle}
          </span>
        </h1>

        <p className="mt-4 text-xl font-bold uppercase tracking-wide text-white drop-shadow-[0_0_40px_#000] sm:text-2xl md:text-[2.5rem] md:leading-tight">
          {siteConfig.hero.heading}
        </p>

        <p className="mx-auto mt-4 max-w-2xl text-base font-bold uppercase tracking-wide text-white/95 sm:text-lg">
          {siteConfig.hero.lead}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
          {/* CTA portalu — dodatek */}
          <Button
            size="lg"
            onClick={() => router.push(isAuthed ? "/portal" : "/login")}
            className="h-12 min-w-[220px] gap-2 bg-brand px-6 text-base font-semibold text-white hover:bg-black"
          >
            <UserRound className="size-5" />
            Rejestracja / Portal Pacjenta
          </Button>
          <Button
            size="lg"
            onClick={() => router.push("/kontakt")}
            className="h-12 min-w-[200px] gap-2 bg-brand-deep px-6 text-base font-semibold text-white hover:bg-black"
          >
            <CalendarPlus className="size-5" />
            Umów wizytę
          </Button>
          <Button
            size="lg"
            onClick={() => router.push("/nasz-zespol")}
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
