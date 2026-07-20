import { Inbox, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function EmptyState({
  title = "Brak elementów do wyświetlenia",
  description,
  className,
  icon: Icon = Inbox,
  actionHref,
  actionLabel,
}: {
  title?: string;
  description?: string;
  className?: string;
  icon?: LucideIcon;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-14 text-center animate-in fade-in-50 duration-300",
        className
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-brand shadow-inner">
        <Icon className="size-7" />
      </div>
      <div>
        <p className="text-sm font-semibold text-brand-heading">{title}</p>
        {description ? (
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Button
          asChild
          size="sm"
          className="mt-1 h-9 bg-brand text-white hover:bg-brand-deep"
        >
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
