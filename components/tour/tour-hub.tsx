"use client";

import { BookOpen, Play, RotateCcw, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTour } from "@/components/tour/tour-context";
import { toursForRole } from "@/lib/tour/paths";
import { clearTourSeen, hasSeenTour } from "@/lib/tour/storage";
import type { TourPathId } from "@/lib/tour/types";
import { cn } from "@/lib/utils";

export function TourHub({
  variant,
}: {
  variant: "doctor" | "patient";
}) {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const userId = session?.user?.id;
  const { startTour, isActive } = useTour();

  const paths = toursForRole(role);

  function launch(id: TourPathId) {
    if (isActive) {
      toast.message("Przewodnik już trwa — zakończ go lub dokończ kroki.");
      return;
    }
    startTour(id);
    toast.success("Uruchomiono przewodnik", {
      description: "Użyj Następny / Poprzedni lub strzałek klawiatury.",
    });
  }

  function reset(id: TourPathId) {
    clearTourSeen(id, userId);
    toast.message("Zresetowano status przewodnika");
  }

  return (
    <div
      className={cn(
        "p-4 md:p-6",
        variant === "patient" && "mx-auto max-w-4xl py-10"
      )}
      data-tour={
        variant === "patient" ? "patient-tour-hub" : "doctor-tour-hub"
      }
    >
      <div className="mb-6 flex flex-wrap items-start gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-brand text-white shadow-md">
          <BookOpen className="size-6" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-brand-heading md:text-2xl">
            Przewodnik po systemie
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Interaktywny tour ze spotlightem — przyciemnienie ekranu i
            podświetlenie elementów. Przejdź przez wszystkie kluczowe
            funkcje krok po kroku.
          </p>
        </div>
      </div>

      {paths.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Zaloguj się, aby zobaczyć dostępne ścieżki przewodnika.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {paths.map((path) => {
            const seen = hasSeenTour(path.id, userId);
            return (
              <Card
                key={path.id}
                className="border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base text-brand-heading">
                      {path.title}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 text-[10px]",
                        seen
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-brand/30 bg-secondary text-brand-deep"
                      )}
                    >
                      {seen ? "ukończony" : "nowy"} · {path.steps.length}{" "}
                      kroków
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {path.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    className="gap-2 bg-brand text-white hover:bg-brand-deep"
                    onClick={() => launch(path.id)}
                    disabled={isActive}
                  >
                    <Play className="size-4" />
                    Uruchom
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="default"
                    className="gap-2"
                    onClick={() => reset(path.id)}
                  >
                    <RotateCcw className="size-3.5" />
                    Reset statusu
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="mt-6 border-brand/15 bg-secondary/40">
        <CardContent className="flex gap-3 py-4 text-sm text-slate-700">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-brand" />
          <div>
            <p className="font-medium text-brand-heading">Sterowanie</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-muted-foreground">
              <li>
                <kbd className="rounded border bg-white px-1 font-mono text-xs">
                  →
                </kbd>{" "}
                Następny ·{" "}
                <kbd className="rounded border bg-white px-1 font-mono text-xs">
                  ←
                </kbd>{" "}
                Poprzedni
              </li>
              <li>
                <kbd className="rounded border bg-white px-1 font-mono text-xs">
                  Esc
                </kbd>{" "}
                Zakończ przewodnik
              </li>
              <li>Tour przełącza strony automatycznie między krokami</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
