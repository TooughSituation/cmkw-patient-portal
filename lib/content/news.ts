export type NewsArticle = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  body: string[];
  items?: string[];
};

export const newsPage = {
  title: "Aktualności i Baza Wiedzy",
  heading: "Aktualności i Baza Wiedzy",
  intro: [
    "Witamy w sekcji aktualności Centrum Medycznego Kiryluk i Wenta.",
    "Informujemy tu na bieżąco o nowościach w naszej poradni, wdrażanych metodach leczenia oraz osiągnięciach naukowych i klinicznych naszego zespołu.",
  ],
};

export const newsArticles: NewsArticle[] = [
  {
    slug: "przelom-w-leczeniu-bolu-pierwszy-w-polsce-zabieg-embolizacji-naczyn-okolokolankowych",
    title:
      "Przełom w leczeniu bólu: Pierwszy w Polsce zabieg embolizacji naczyń okołokolankowych",
    excerpt:
      "Z dumą informujemy o historycznym sukcesie, w którym ogromny udział miał nasz specjalista, lek. Jan Kiryluk.",
    image: "/images/aktualnosci/a1.webp",
    body: [
      "Z dumą informujemy o historycznym sukcesie, w którym ogromny udział miał nasz specjalista, lek. Jan Kiryluk.",
      "W Uniwersyteckim Szpitalu Klinicznym w Białymstoku, przy ścisłej współpracy ortopedów i radiologów inwazyjnych, wykonano pierwszy w Polsce zabieg embolizacji naczyń okołokolankowych.",
      "Jest to innowacyjna i potencjalnie mało ryzykowna procedura o wysokiej skuteczności w leczeniu przewlekłego bólu. Działanie zabiegu polega na precyzyjnym zmniejszeniu przekrwienia żylnego w obrębie narządu ruchu.",
      "Dla kogo przeznaczony jest zabieg? Metoda ta przynosi wysoce satysfakcjonujące efekty w leczeniu:",
    ],
    items: [
      "Przewlekłych bólów u sportowców,",
      "Dolegliwości bólowych wynikających z zaawansowanych zwyrodnień stawowych,",
      "Bólów utrzymujących się po zabiegach protezoplastyki.",
    ],
  },
  {
    slug: "nowosc-w-ofercie-wypozyczalnia-zmotoryzowanych-szyn-cpm",
    title: "Nowość w ofercie: Wypożyczalnia zmotoryzowanych szyn CPM",
    excerpt:
      "Dobra wiadomość dla pacjentów przygotowujących się do operacji stawu kolanowego i biodrowego.",
    image: "/images/aktualnosci/a3.webp",
    body: [
      "Dobra wiadomość dla pacjentów przygotowujących się do operacji stawu kolanowego i biodrowego.",
      "Aby ułatwić i przyspieszyć proces rehabilitacji w warunkach domowych, uruchomiliśmy wypożyczalnię zmotoryzowanych szyn CPM (Continuous Passive Motion).",
      "Zastosowanie szyny CPM tuż po zabiegach operacyjnych, takich jak artroskopia, szycie łąkotki czy rekonstrukcja więzadła krzyżowego (ACL), to złoty standard nowoczesnej rehabilitacji. Urządzenie zapobiega zrostom, zmniejsza obrzęk i stymuluje regenerację chrząstki. O szczegóły wynajmu i dobór parametrów można zapytać naszych lekarzy podczas wizyty kwalifikującej.",
    ],
  },
];

export function getNewsBySlug(slug: string): NewsArticle | undefined {
  return newsArticles.find((a) => a.slug === slug);
}
