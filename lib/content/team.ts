export type TeamMember = {
  id: string;
  name: string;
  title: string;
  image: string;
  role?: string;
  paragraphs: string[];
  sections?: { heading: string; items: string[] }[];
  extraLists?: string[];
  znanyLekarzUrl?: string;
};

export const teamIntro = {
  heading: "Zespół Lekarski – Ortopedzi z pasją i doświadczeniem",
  lead: "Siłą Centrum Medycznego Kiryluk i Wenta są ludzie.",
  text: "Nasi lekarze to praktykujący specjaliści, którzy na co dzień pomagają pacjentom odzyskać pełną sprawność, stale podnosząc swoje kwalifikacje.",
};

export const teamMembers: TeamMember[] = [
  {
    id: "kiryluk",
    name: "Jan Kiryluk",
    title: "Dr n. med.",
    image: "/images/zespol/jan-kiryluk.webp",
    role: "Specjalista Ortopeda Traumatolog",
    paragraphs: [
      "Kierownik Kliniki Ortopedii Traumatologii i Chirurgii Ręki w Białymstoku. Nauczyciel Akademicki Kliniki Ortopedii i traumatologii. Operuję w ramach NFZ i prywatnie.",
      "Specjalizuje się w Chirurgii Urazowo Ortopedycznej:",
    ],
    sections: [
      {
        heading: "Staw biodrowy",
        items: [
          "Protezoplastyka pierwotna stawu biodrowego z dostępu DAA",
          "Protezoplastyki rewizyjne stawu biodrowego z odtworzeniem ubytków kostnych",
          "Protezoplastyka Custom Made",
        ],
      },
      {
        heading: "Staw kolanowy",
        items: [
          "Artroskopia",
          "Osteotomia kości piszczelowej i udowej",
          "Rekonstrukcje więzadłowe",
          "Protezoplastyka robotyczna — jednoprzedziałowa, totalna, rewizyjna, resekcyjna",
        ],
      },
      {
        heading: "Staw skokowy i stopa",
        items: [
          "Artroskopia stawu skokowego",
          "Plastyki więzadłowe",
          "Osteotomie",
          "Protezoplastyka stawu skokowego i stawu MTP I stopy",
          "Usztywnienia stawu skokowego i w obrębie stopy",
        ],
      },
    ],
    extraLists: ["Operacyjne leczenie złamań w obrębie kończyn"],
  },
  {
    id: "wenta",
    name: "Tomas Wenta",
    title: "Lek.",
    image: "/images/zespol/tomas-wenta.webp",
    paragraphs: [
      "Lekarz w trakcie specjalizacji w dziedzinie ortopedii i traumatologii narządu ruchu. Na co dzień związany z oddziałami ortopedycznymi Uniwersyteckiego Szpitala Klinicznego w Białymstoku oraz SP ZOZ w Hajnówce. Jako wykładowca dzieli się swoją wiedzą ze studentami kierunku lekarskiego Uniwersytetu Medycznego w Białymstoku, prowadząc zajęcia z anatomii, ortopedii i traumatologii.",
      "Pasję do tej dziedziny medycyny odkrył podczas studiów na WUM, a zdobyte doświadczenie rozwijał m.in. jako Przewodniczący SKN Ortopedii w Szpitalu im. prof. A. Grucy. Dziś aktywnie działa jako członek zarządu Sekcji Rezydentów PTOiT, organizując ogólnopolskie szkolenia i konferencje dla lekarzy. Jest także absolwentem licznych międzynarodowych kursów operacyjnych.",
      "Podejście do pacjenta: Pomaga pacjentom zmagającym się z bólem stawów, ograniczeniem ruchomości i urazami sportowymi. Celem każdej wizyty jest bezpieczny powrót pacjenta do pełnej aktywności i życia bez bólu. Kładzie ogromny nacisk na wywiad i dokładną diagnostykę obrazową, aby wspólnie z pacjentem – w oparciu o jego styl życia i oczekiwania – wybrać optymalną drogę leczenia, zachowawczego lub operacyjnego.",
      "Prywatnie: Szczęśliwy mąż i ojciec. Wolny czas spędza z rodziną przy grach planszowych, dobrym filmie lub czytając książki z córką. Pasjonat sportów walki.",
    ],
    sections: [
      {
        heading: "Zakres zabiegów i specjalizacji",
        items: [
          "Diagnostyka i USG: pełna diagnostyka ortopedyczna oraz zabiegi pod kontrolą USG",
          "Protezoplastyka: małoinwazyjne zabiegi stawu biodrowego (dostęp przedni), personalizowana protezoplastyka stawu kolanowego, zabiegi rewizyjne i naprawcze",
          "Medycyna sportowa i artroskopia: urazy sportowe, rekonstrukcje więzadeł (ACL), łąkotek, artroskopia kolana i stawu skokowego",
          "Chirurgia ręki i deformacje: zespół cieśni nadgarstka, korekcja deformacji kończyn dolnych",
          "Medycyna regeneracyjna: ubytki chrząstki, przeszczepy tkankowe, PRP i szpik kostny",
          "Ortopedia dziecięca: przesiewowe USG stawów biodrowych u niemowląt metodą prof. Grafa",
        ],
      },
    ],
  },
  {
    id: "frankowski",
    name: "Paweł Frankowski",
    title: "Lek.",
    image: "/images/zespol/pawel-frankowski.webp",
    paragraphs: [
      "Absolwent kierunku lekarskiego na Uniwersytecie Medycznym w Białymstoku (2016 r.). W 2024 r. uzyskał tytuł specjalisty w dziedzinie ortopedii i traumatologii narządu ruchu.",
      "Na co dzień związany jest z Kliniką Ortopedii, Traumatologii i Chirurgii Ręki Szpitala Klinicznego w Białymstoku. Doświadczenie w pracy zarówno z pacjentami pediatrycznymi, jak i dorosłymi pozwala mu skutecznie pomagać chorym w każdym wieku. Stale pogłębia swoją wiedzę i doskonali umiejętności praktyczne poprzez aktywny udział w licznych kursach oraz szkoleniach medycznych.",
      "Prywatnie mąż i ojciec dwójki dzieci.",
    ],
    znanyLekarzUrl:
      "https://www.znanylekarz.pl/pawel-frankowski/ortopeda-dzieciecy-ortopeda/wysokie-mazowieckie#profile-reviews",
  },
  {
    id: "zawadzki",
    name: "Andrzej Zawadzki",
    title: "Lek.",
    image: "/images/zespol/andrzej-zawadzki.webp",
    paragraphs: [
      "Głównym obszarem jego specjalizacji jest leczenie złamań obręczy miednicy i panewki stawu biodrowego u dorosłych i dzieci, a także leczenie następstw tych urazów. Przeprowadza zabiegi endoprotezoplastyki pierwotnej stawów biodrowych i kolanowych oraz zabiegi rewizyjne, w tym wymagające zastosowania implantów typu „custom made” (projektowanych indywidualnie dla pacjenta).",
      "W latach 2001–2023 był związany z Oddziałem Uszkodzeń i Patologii Miednicy SPSK im. prof. A. Grucy CMKP w Otwocku, pracując jako Starszy Asystent (w latach 2008–2009 pełnił również funkcję p.o. Zastępcy Kierownika Oddziału). Jako wieloletni wykładowca CMKP w Warszawie odpowiadał za kształcenie lekarzy w trakcie specjalizacji z ortopedii i traumatologii narządu ruchu.",
      "Obecnie pracuje w Klinice Ortopedii i Traumatologii Uniwersyteckiego Szpitala Klinicznego w Białymstoku oraz Klinice Ortopedii i Traumatologii Dziecięcej Dziecięcego Szpitala Klinicznego w Białymstoku. Pełni tam również funkcję wykładowcy akademickiego. Ponadto, jako członek Zespołu ds. Postępowania w Jałowej Martwicy Kości, odpowiada za wykonywanie endoprotezoplastyk stawu biodrowego u najmłodszych pacjentów.",
      "Dzieli się swoim doświadczeniem jako prelegent i wykładowca, prowadząc specjalistyczne szkolenia z zakresu leczenia złamań miednicy m.in. w Solothurn (Szwajcaria), New Delhi (Indie) oraz w ramach Poznań LAB (Instytut Medycyny Praktycznej).",
    ],
  },
  {
    id: "torba",
    name: "Grzegorz Torba",
    title: "Lek.",
    image: "/images/zespol/grzegorz-torba.webp",
    paragraphs: [
      "Specjalizuje się w nieoperacyjnym i operacyjnym leczeniu schorzeń kończyny dolnej i górnej, a w szczególności endoprotezoplastyce stawu kolanowego i biodrowego z uwzględnieniem nawigacji komputerowej i robotycznej, wykorzystując bogate doświadczenie w posługiwaniu się aparatem do ultrasonografii (USG). W czasie konsultacji przeprowadza badanie kliniczne w połączeniu z diagnostyką USG w celu potwierdzenia wstępnego rozpoznania.",
      "Obecnie lekarz Kliniki Ortopedii, Traumatologii i Chirurgii Ręki Uniwersyteckiego Szpitala Klinicznego w Białymstoku. W leczeniu wykorzystuje doświadczenie zdobyte w pracy na warszawskich oddziałach ortopedycznych m.in. szpitala bielańskiego i bródnowskiego. Specjalista chirurg stosujący artroskopową metodę operacji stawu kolanowego.",
    ],
    znanyLekarzUrl:
      "https://www.znanylekarz.pl/grzegorz-torba/ortopeda/siedlce#profile-reviews",
  },
  {
    id: "sammoudi",
    name: "Saddam Sammoudi",
    title: "Lek.",
    image: "/images/zespol/saddam-sammoudi.webp",
    paragraphs: [
      "Akademię Medyczną w Białymstoku ukończył w roku 2012, a tytuł specjalisty ortopedii i traumatologii narządu ruchu uzyskał w 2020 r. Od wielu lat jest związany z Kliniką Ortopedii i Traumatologii Uniwersyteckiego Szpitala Klinicznego w Białymstoku.",
      "Zajmuje się diagnozowaniem i leczeniem chorób oraz urazów związanych z zaburzeniami narządu ruchu. Przeprowadza artroskopowe zabiegi, zabiegi osteotomii podkolanowych, endoprotezoplastyki stawu biodrowego i kolanowego.",
    ],
    znanyLekarzUrl:
      "https://www.znanylekarz.pl/saddam-sammoudi/ortopeda/bialystok#profile-reviews",
  },
];
