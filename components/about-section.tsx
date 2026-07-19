import { siteConfig } from "@/lib/site-config";

export function AboutSection() {
  return (
    <section
      id="o-nas"
      className="relative bg-[#f5f5f5] py-16 md:py-20"
      style={{
        backgroundImage: "url(/images/bg-pattern.webp)",
        backgroundRepeat: "repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="mx-auto max-w-4xl px-4 text-center md:px-6">
        {siteConfig.about.paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="mb-6 text-base leading-relaxed text-foreground last:mb-0 md:text-[17px]"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
