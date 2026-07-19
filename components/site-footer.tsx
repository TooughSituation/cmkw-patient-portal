import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-footer text-gray-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3 md:px-6">
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">
            {siteConfig.shortName}
          </h3>
          <p className="text-sm leading-relaxed text-gray-400">
            {siteConfig.name}
            <br />
            {siteConfig.address.full}
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">
            Nawigacja
          </h3>
          <ul className="space-y-2 text-sm">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-gray-400 hover:text-white"
                >
                  {item.title}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/rejestracja"
                className="text-gray-400 hover:text-white"
              >
                Rejestracja / Portal Pacjenta
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">
            Kontakt
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            {siteConfig.phones.map((phone) => (
              <li key={phone.href}>
                <a href={phone.href} className="hover:text-white">
                  {phone.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${siteConfig.email}`}
                className="hover:text-white"
              >
                {siteConfig.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-700">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-gray-500 md:flex-row md:px-6">
          <p>
            © {year} {siteConfig.company}
          </p>
          <p>
            Portal pacjenta – szkielet aplikacji (Next.js)
          </p>
        </div>
      </div>
    </footer>
  );
}
