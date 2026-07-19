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
    "https://www.google.pl/maps/dir//Wisławy+Szymborskiej+2,+15-424+Białystok",
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
