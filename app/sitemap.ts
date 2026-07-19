import type { MetadataRoute } from "next";
import { newsArticles } from "@/lib/content/news";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = "https://cmkw-patient-portal.vercel.app";

  const staticRoutes = [
    "",
    "/nasz-zespol",
    "/leczenie-ortopedyczne",
    "/fizjoterapia-i-rehabilitacja",
    "/aktualnosci-i-baza-wiedzy",
    "/kontakt",
    "/login",
    "/rejestracja",
  ];

  const pages: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${origin}${path || "/"}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));

  for (const article of newsArticles) {
    pages.push({
      url: `${origin}/aktualnosci-i-baza-wiedzy/${article.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return pages;
}
