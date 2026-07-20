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
          "Ta sekcja jest dostępna dla konta placówki, administratora lub recepcji.",
      });
      const next = new URLSearchParams(searchParams.toString());
      next.delete("denied");
      const q = next.toString();
      router.replace(q ? `${pathname}?${q}` : pathname);
    }
  }, [searchParams, router, pathname]);

  return null;
}
