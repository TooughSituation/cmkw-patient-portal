export const siteConfig = {
  name: "Centrum Medyczne Kiryluk i Wenta",
  shortName: "CMKW",
  tagline: "Twój Ortopeda w Białymstoku",
  description:
    "Kompleksowa diagnostyka, nowoczesne leczenie i fizjoterapia narządu ruchu. Centrum Medyczne Kiryluk i Wenta w Białymstoku.",
  url: "https://cmkirylukwenta.pl",
  company: "Centrum Medyczne Kiryluk & Wenta Spółka Z.O.O.",
  address: {
    street: "Wisławy Szymborskiej 2/U4",
    streetAlt: "Wisławy Szymborskiej 2-u4",
    city: "15-424 Białystok",
    full: "Wisławy Szymborskiej 2, Białystok",
  },
  phones: [
    { label: "+48 660 281 212", href: "tel:+48660281212" },
    { label: "+48 539 999 105", href: "tel:+48539999105" },
  ],
  email: "cmkirylukwenta@gmail.com",
  hours:
    "Rejestracja telefoniczna jest czynna od poniedziałku do piątku w godzinach 8:00 – 18:00",
  mapsUrl:
    "https://www.google.pl/maps/dir//Wisławy+Szymborskiej+2,+15-424+Białystok/@53.1322934,23.1477863,16.13z/data=!4m8!4m7!1m0!1m5!1m1!1s0x471ffdda04cbb265:0xc000984c54a7f971!2m2!1d23.1493531!2d53.132977",
  /** Embed Google Maps jak na cmkirylukwenta.pl (homepage / kontakt) */
  mapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d18074.919315415536!2d23.13603835238804!3d53.13328105352336!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471ffd6b34080ced%3A0xee895a75fb49e39a!2sCentrum%20Medyczne%20Kiryluk%20%26%20Wenta!5e0!3m2!1spl!2spl!4v1782712999473!5m2!1spl!2spl",
  /** Menu jak na cmkirylukwenta.pl + CTA portalu w UI */
  nav: [
    { title: "Strona Główna", href: "/" },
    { title: "Nasz Zespół", href: "/nasz-zespol" },
    { title: "Leczenie ortopedyczne", href: "/leczenie-ortopedyczne" },
    {
      title: "Fizjoterapia i rehabilitacja",
      href: "/fizjoterapia-i-rehabilitacja",
    },
    {
      title: "Aktualności i Baza Wiedzy",
      href: "/aktualnosci-i-baza-wiedzy",
    },
    { title: "Kontakt", href: "/kontakt" },
  ],
  hero: {
    title: "Centrum Medyczne",
    subtitle: "Kiryluk i Wenta",
    heading: "Twój Ortopeda w Białymstoku",
    lead: "Kompleksowa diagnostyka, nowoczesne leczenie i fizjoterapia narządu ruchu.",
  },
  about: {
    paragraphs: [
      "Witamy w Centrum Medycznym Kiryluk i Wenta. Jesteśmy zespołem doświadczonych lekarzy specjalistów w dziedzinie ortopedii i traumatologii narządu ruchu. W naszej nowoczesnej placówce w Białymstoku przy ul. Szymborskiej 2/U4 zapewniamy pacjentom najwyższy standard opieki medycznej – od wnikliwej diagnozy, przez dobór odpowiedniej metody leczenia, aż po profesjonalną rehabilitację.",
      "Łączymy wiedzę kliniczną z innowacyjnymi metodami terapeutycznymi. Oferujemy m.in. leczenie operacyjne, terapie osoczem bogatopłytkowym (PRP), iniekcje z kwasu hialuronowego oraz wsparcie wykwalifikowanych fizjoterapeutów. Twoja sprawność jest naszym priorytetem.",
    ],
  },
} as const;
