type Props = {
  title: string;
  subtitle?: string;
};

/** Nagłówek podstrony w stylu CMKW (białe tło, heading #384480, divider). */
export function PageHero({ title, subtitle }: Props) {
  return (
    <section className="border-b border-gray-100 bg-white py-12 md:py-16">
      <div className="mx-auto max-w-4xl px-4 text-center md:px-6">
        <h1 className="text-2xl font-bold uppercase tracking-wide text-brand-heading md:text-3xl lg:text-[2rem]">
          {title}
        </h1>
        <div className="section-divider mt-4" />
        {subtitle ? (
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-foreground/90">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
