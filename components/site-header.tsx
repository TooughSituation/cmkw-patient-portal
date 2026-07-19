"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { MapPin, Menu, Phone, UserRound } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const isAuthed = status === "authenticated" && !!session?.user;
  const ctaHref = isAuthed ? "/portal" : "/login";
  const ctaLabel = isAuthed
    ? `Portal · ${session.user.firstName}`
    : "Rejestracja / Portal Pacjenta";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-[0_1px_0_0_#eee]">
      {/* Top bar — logo + telefony (jak oryginał) */}
      <div className="border-b border-[#eee]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-3 md:px-6">
          <a
            href={siteConfig.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden max-w-[220px] items-start gap-2 text-[13px] leading-snug text-[#333] hover:text-brand lg:flex"
          >
            <MapPin className="mt-0.5 size-4 shrink-0 text-brand" />
            <span>{siteConfig.address.full}</span>
          </a>

          <Link href="/" className="mx-auto shrink-0 lg:mx-0">
            <Image
              src="/images/logo.webp"
              alt="Centrum Medyczne Kiryluk & Wenta"
              width={240}
              height={72}
              className="h-[52px] w-auto object-contain md:h-[72px]"
              priority
            />
          </Link>

          <div className="hidden flex-col items-end gap-1 text-[14px] font-medium lg:flex">
            {siteConfig.phones.map((phone) => (
              <a
                key={phone.href}
                href={phone.href}
                className="inline-flex items-center gap-1.5 text-brand hover:text-black"
              >
                <Phone className="size-3.5" />
                {phone.label}
              </a>
            ))}
          </div>

          <div className="lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Otwórz menu"
                  className="border-[#ddd]"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(100%,360px)]">
                <SheetHeader>
                  <SheetTitle className="text-left text-brand-heading">
                    Menu
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-4 flex flex-col">
                  {siteConfig.nav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "border-b border-[#eee] px-1 py-3 text-[15px] font-bold",
                        isActive(item.href)
                          ? "text-brand"
                          : "text-[#000] hover:text-brand"
                      )}
                    >
                      {item.title}
                    </Link>
                  ))}
                  <Button
                    onClick={() => {
                      setOpen(false);
                      router.push(ctaHref);
                    }}
                    className="mt-5 h-11 bg-brand font-semibold text-white hover:bg-brand-deep"
                  >
                    <UserRound className="size-4" />
                    {ctaLabel}
                  </Button>
                  {!isAuthed && (
                    <Link
                      href="/rejestracja"
                      onClick={() => setOpen(false)}
                      className="mt-3 text-center text-sm font-semibold text-brand"
                    >
                      Załóż konto pacjenta
                    </Link>
                  )}
                  <div className="mt-6 space-y-2 border-t pt-4 text-sm">
                    {siteConfig.phones.map((phone) => (
                      <a
                        key={phone.href}
                        href={phone.href}
                        className="flex items-center gap-2 text-brand"
                      >
                        <Phone className="size-3.5" />
                        {phone.label}
                      </a>
                    ))}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Główne menu — bold, separators jak oryginał */}
      <div className="border-b border-[#eee] bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-col items-stretch gap-2 px-2 py-1.5 md:px-4 lg:flex-row lg:items-center lg:justify-between">
          <nav
            className="hidden flex-1 justify-center lg:flex"
            aria-label="Główne menu"
          >
            <ul className="flex flex-wrap items-center justify-center">
              {siteConfig.nav.map((item, index) => (
                <li key={item.href} className="relative flex items-center">
                  {index > 0 && (
                    <span
                      className="mx-0 h-5 w-px bg-[#eee]"
                      aria-hidden
                    />
                  )}
                  <Link
                    href={item.href}
                    className={cn(
                      "px-2.5 py-2.5 text-[13px] font-bold tracking-wide transition-colors xl:px-3.5 xl:text-[14px]",
                      isActive(item.href)
                        ? "text-brand"
                        : "text-[#000] hover:text-brand"
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Prominent CTA — dodatek do klona */}
          <div className="flex shrink-0 justify-center px-2 pb-1.5 lg:justify-end lg:pb-0">
            <Button
              onClick={() => router.push(ctaHref)}
              className="h-10 w-full max-w-xs gap-2 bg-brand px-4 text-[13px] font-bold text-white shadow-sm hover:bg-brand-deep lg:w-auto"
            >
              <UserRound className="size-4" />
              {status === "loading" ? "…" : ctaLabel}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
