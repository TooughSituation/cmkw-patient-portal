import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  /** dark = jak oryginalny nagłówek podstron CMKW (#1b1b36) */
  variant?: "light" | "dark";
};

/** Nagłówek podstrony w stylu CMKW. */
export function PageHero({ title, subtitle, variant = "dark" }: Props) {
  const dark = variant === "dark";

  return (
    <section
      className={cn(
        "py-12 md:py-16",
        dark ? "bg-[#1b1b36] text-white" : "border-b border-gray-100 bg-white"
      )}
    >
      <div className="mx-auto max-w-4xl px-4 text-center md:px-6">
        <h1
          className={cn(
            "text-2xl font-bold uppercase tracking-wide md:text-3xl lg:text-[2rem]",
            dark ? "text-white" : "text-brand-heading"
          )}
        >
          {title}
        </h1>
        <div
          className={cn(
            "mx-auto mt-4 h-px w-[100px]",
            dark ? "bg-brand-heading" : "bg-brand-heading"
          )}
          aria-hidden
        />
        {subtitle ? (
          <p
            className={cn(
              "mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed",
              dark ? "text-white/90" : "text-foreground/90"
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
