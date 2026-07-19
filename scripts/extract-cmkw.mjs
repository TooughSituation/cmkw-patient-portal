import fs from "fs";

const files = {
  home: `${process.env.TEMP}\\cmkw-home.html`,
  zespol: `${process.env.TEMP}\\cmkw-nasz-zespol.html`,
  ortopedia: `${process.env.TEMP}\\cmkw-leczenie-ortopedyczne.html`,
  fizjo: `${process.env.TEMP}\\cmkw-fizjoterapia-i-rehabilitacja.html`,
  aktualnosci: `${process.env.TEMP}\\cmkw-aktualnosci-i-baza-wiedzy.html`,
  kontakt: `${process.env.TEMP}\\cmkw-kontakt.html`,
};

function strip(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");
}

function text(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&([a-z]+);/gi, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n +/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const out = {};

for (const [k, f] of Object.entries(files)) {
  let html = fs.readFileSync(f, "utf8");
  html = strip(html);
  const headings = [...html.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi)]
    .map((m) => text(m[1]))
    .filter((t) => t.length > 2 && t.length < 250);

  const body = html.match(/sp-page-builder[\s\S]{0,80000}/)?.[0] || html;
  const paragraphs = [...body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => text(m[1]))
    .filter((t) => t.length > 20);

  const lis = [...body.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((m) => text(m[1]))
    .filter((t) => t.length > 5 && t.length < 300);

  const imgs = [
    ...new Set(
      [...html.matchAll(/src="(\/(?:images|files)\/[^"]+)"/g)].map((m) => m[1])
    ),
  ];

  // try addon text blocks
  const addons = [...body.matchAll(/sppb-addon-content[^>]*>([\s\S]*?)<\/div>/gi)]
    .map((m) => text(m[1]))
    .filter((t) => t.length > 40);

  out[k] = { headings, paragraphs: paragraphs.slice(0, 40), lis: lis.slice(0, 60), imgs, addons: addons.slice(0, 30) };
  console.log("\n=====", k, "=====");
  headings.forEach((h) => console.log("H:", h));
  paragraphs.slice(0, 20).forEach((p) => console.log("P:", p.slice(0, 400)));
  lis.slice(0, 20).forEach((l) => console.log("LI:", l.slice(0, 200)));
  imgs.forEach((i) => console.log("IMG:", i));
}

fs.writeFileSync(
  "scripts/extracted-content.json",
  JSON.stringify(out, null, 2),
  "utf8"
);
console.log("\nWrote scripts/extracted-content.json");
