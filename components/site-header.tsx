"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
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
  const [open, setOpen] = useState(false);

  const goToPortal = () => {
    setOpen(false);
    router.push("/rejestracja");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* Top bar: address + logo + phones */}
      <div className="border-b border-gray-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <a
            href={siteConfig.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 text-sm text-foreground/80 hover:text-brand md:flex"
          >
            <MapPin className="size-4 shrink-0 text-brand" aria-hidden />
            <span>{siteConfig.address.full}</span>
          </a>

          <Link href="/" className="mx-auto shrink-0 md:mx-0">
            <Image
              src="/images/logo.webp"
              alt={siteConfig.name}
              width={220}
              height={64}
              className="h-12 w-auto object-contain md:h-16"
              priority
            />
          </Link>

          <div className="hidden items-center gap-3 text-sm font-medium md:flex">
            {siteConfig.phones.map((phone) => (
              <a
                key={phone.href}
                href={phone.href}
                className="inline-flex items-center gap-1.5 text-brand hover:text-foreground"
              >
                <Phone className="size-3.5" aria-hidden />
                {phone.label}
              </a>
            ))}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Otwórz menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(100%,360px)]">
                <SheetHeader>
                  <SheetTitle className="text-left text-brand-heading">
                    Menu
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1">
                  {siteConfig.nav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-2.5 text-base font-semibold text-foreground hover:bg-accent hover:text-brand"
                    >
                      {item.title}
                    </Link>
                  ))}
                  <Button
                    onClick={goToPortal}
                    className="mt-4 h-11 bg-brand text-white hover:bg-brand-deep"
                  >
                    <UserRound className="size-4" />
                    Rejestracja / Portal Pacjenta
                  </Button>
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

      {/* Main navigation */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-stretch gap-2 px-4 py-2 md:flex-row md:items-center md:justify-between md:px-6">
          <nav className="hidden items-center md:flex" aria-label="Główne menu">
            <ul className="flex flex-wrap items-center">
              {siteConfig.nav.map((item, index) => {
                const isActive =
                  pathname === item.href ||
                  (item.href.startsWith("/#") && pathname === "/");

                return (
                  <li key={item.href} className="relative flex items-center">
                    {index > 0 && (
                      <span
                        className="mx-0.5 h-5 w-px bg-gray-200"
                        aria-hidden
                      />
                    )}
                    <Link
                      href={item.href}
                      className={cn(
                        "px-3 py-2 text-sm font-bold tracking-wide transition-colors",
                        isActive
                          ? "text-brand"
                          : "text-foreground hover:text-brand"
                      )}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex justify-center md:justify-end">
            <Button
              onClick={() => router.push("/rejestracja")}
              className="h-10 w-full max-w-sm gap-2 bg-brand px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-deep md:w-auto"
            >
              <UserRound className="size-4" />
              Rejestracja / Portal Pacjenta
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
