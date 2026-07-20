import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#222] text-[#ccc]">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 md:grid-cols-3 md:px-6">
        <div>
          <h3 className="mb-4 text-[13px] font-bold uppercase tracking-wide text-white">
            {siteConfig.name}
          </h3>
          <p className="text-sm leading-relaxed text-[#999]">
            {siteConfig.company}
            <br />
            {siteConfig.address.street}
            <br />
            {siteConfig.address.city}
          </p>
          <p className="mt-3 text-sm text-[#999]">{siteConfig.hours}</p>
        </div>

        <div>
          <h3 className="mb-4 text-[13px] font-bold uppercase tracking-wide text-white">
            Nawigacja
          </h3>
          <ul className="space-y-2 text-sm">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[#999] transition-colors hover:text-white"
                >
                  {item.title}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                className="text-[#999] transition-colors hover:text-white"
              >
                Portal Pacjenta
              </Link>
            </li>
            <li>
              <Link
                href="/doctor/login"
                className="text-[#999] transition-colors hover:text-white"
              >
                Dla Lekarza
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-[13px] font-bold uppercase tracking-wide text-white">
            Kontakt
          </h3>
          <ul className="space-y-2 text-sm text-[#999]">
            {siteConfig.phones.map((phone) => (
              <li key={phone.href}>
                <a
                  href={phone.href}
                  className="transition-colors hover:text-white"
                >
                  {phone.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${siteConfig.email}`}
                className="transition-colors hover:text-white"
              >
                {siteConfig.email}
              </a>
            </li>
            <li>
              <a
                href={siteConfig.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                {siteConfig.address.full}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#333]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-[#666] md:flex-row md:px-6">
          <p>
            © {year} {siteConfig.company}
          </p>
          <p>
            <a
              href="https://cdx.pl"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[#999]"
              title="tworzenie stron internetowych"
            >
              Created by: cdx.pl
            </a>
            <span className="mx-2 text-[#444]">·</span>
            <span>Portal pacjenta</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
