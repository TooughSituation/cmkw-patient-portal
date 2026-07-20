import { siteConfig } from "@/lib/site-config";

/** Mapa Google — ten sam embed co na cmkirylukwenta.pl */
export function MapSection({
  className,
  height = 450,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <section
      className={className}
      aria-label="Lokalizacja na mapie"
    >
      <div className="w-full overflow-hidden bg-[#e8e8e8]">
        <iframe
          title="Mapa — Centrum Medyczne Kiryluk i Wenta"
          src={siteConfig.mapsEmbedUrl}
          width="100%"
          height={height}
          style={{ border: 0, display: "block" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </section>
  );
}
