import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  patterned?: boolean;
  id?: string;
};

export function ContentSection({
  children,
  className,
  patterned = false,
  id,
}: Props) {
  return (
    <section
      id={id}
      className={cn(
        "py-12 md:py-16",
        patterned ? "bg-[#f5f5f5]" : "bg-white",
        className
      )}
      style={
        patterned
          ? {
              backgroundImage: "url(/images/bg-pattern.webp)",
              backgroundRepeat: "repeat",
              backgroundAttachment: "fixed",
            }
          : undefined
      }
    >
      <div className="mx-auto max-w-4xl px-4 md:px-6">{children}</div>
    </section>
  );
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 text-center">
      <h2 className="text-xl font-bold uppercase tracking-wide text-brand-heading md:text-2xl">
        {children}
      </h2>
      <div className="section-divider mt-3" />
    </div>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 text-[17px] leading-relaxed text-foreground/90">
      {children}
    </div>
  );
}

export function BulletList({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-4 list-none space-y-2.5 pl-0">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[17px] leading-relaxed">
          <span
            className="mt-2 size-1.5 shrink-0 rounded-full bg-brand"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
