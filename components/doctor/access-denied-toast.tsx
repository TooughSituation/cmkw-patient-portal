"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/** Pokazuje toast gdy middleware przekieruje z ?denied=admin */
export function AccessDeniedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const denied = searchParams.get("denied");
    if (denied === "admin") {
      toast.error("Brak dostępu do ustawień placówki", {
        description:
          "Administracja jest dostępna wyłącznie dla konta placówki (cmkw@cmkw.pl).",
      });
      const next = new URLSearchParams(searchParams.toString());
      next.delete("denied");
      const q = next.toString();
      router.replace(q ? `${pathname}?${q}` : pathname);
    }
  }, [searchParams, router, pathname]);

  return null;
}
