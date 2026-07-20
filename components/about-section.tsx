import { siteConfig } from "@/lib/site-config";

export function AboutSection() {
  return (
    <section
      className="relative bg-[#f5f5f5] py-[75px]"
      style={{
        backgroundImage: "url(/images/bg-pattern.webp)",
        backgroundRepeat: "repeat",
        backgroundAttachment: "fixed",
      }}
      aria-label="O nas"
    >
      <div className="mx-auto max-w-[900px] px-4 text-center md:px-6">
        {siteConfig.about.paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="mb-6 text-[17px] leading-[1.7] text-[#333] last:mb-0"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
