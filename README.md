# cmkw-patient-portal

Portal pacjenta i strona wizytowa **Centrum Medycznego Kiryluk i Wenta** (Białystok).

Szkielet aplikacji Next.js 15 odwzorowujący biało-niebieską kolorystykę i układ [cmkirylukwenta.pl](https://cmkirylukwenta.pl/), z routingiem pod rejestrację i chroniony portal (logika auth w kolejnych etapach).

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** (Button, Card, Sheet, Separator)
- `next/navigation` do przekierowań (bez autoryzacji)

## Wymagania

- Node.js 18.18+ (zalecane 20+)
- npm 9+

## Uruchomienie

```bash
cd cmkw-patient-portal
npm install
npm run dev
```

Aplikacja: [http://localhost:3000](http://localhost:3000)

### Inne skrypty

```bash
npm run build   # produkcyjny build
npm run start   # serwer produkcyjny (po build)
npm run lint    # ESLint
```

## Routing

| Ścieżka         | Opis                                      | Status                          |
|-----------------|-------------------------------------------|---------------------------------|
| `/`             | Strona główna (hero, oferta, kontakt)     | UI gotowe                       |
| `/rejestracja`  | Rejestracja / wejście do portalu          | Szkielet + CTA                  |
| `/portal`       | Chroniona strefa pacjenta                 | Szkielet (bez auth)             |

## Struktura folderów

```
cmkw-patient-portal/
├── app/
│   ├── layout.tsx          # SEO, header, footer
│   ├── page.tsx            # Strona główna
│   ├── globals.css         # Tokeny brand (#0849b0, #2b2d81, #384480)
│   ├── rejestracja/
│   └── portal/
├── components/
│   ├── site-header.tsx     # Navbar + CTA „Rejestracja / Portal Pacjenta”
│   ├── hero.tsx
│   ├── about-section.tsx
│   ├── services-section.tsx
│   ├── contact-section.tsx
│   ├── site-footer.tsx
│   └── ui/                 # shadcn
├── lib/
│   ├── site-config.ts      # Treści i dane kontaktowe
│   └── utils.ts
└── public/
    └── images/             # logo, hero, wzór tła
```

## Kolorystyka (z oryginału)

| Token           | Hex       | Użycie                |
|-----------------|-----------|------------------------|
| Brand           | `#0849b0` | Linki, CTA, akcenty    |
| Brand deep      | `#2b2d81` | Hero buttons, overlay  |
| Brand heading   | `#384480` | Nagłówki sekcji        |
| Footer          | `#222222` | Stopka                 |

## Następne kroki

1. **Autoryzacja** – NextAuth.js (Auth.js) lub Clerk; sesja + middleware chroniący `/portal`.
2. **Rejestracja / logowanie** – formularze (email + hasło lub magiczny link), walidacja (Zod), komunikaty błędów.
3. **Portal pacjenta** – lista wizyt, rezerwacja terminów, dokumenty (integracja z HIS / API placówki).
4. **Powiadomienia** – e-mail/SMS o wizytach (np. Resend + Twilio).
5. **RODO** – polityka prywatności, zgody marketingowe, eksport/usuwanie danych.
6. **Deploy** – Vercel; zmienne środowiskowe dla providerów auth i API.
7. **Testy** – Playwright (ścieżka rejestracja → portal), testy jednostkowe formularzy.
8. **Treści podstron** – pełne treści „Leczenie ortopedyczne”, „Fizjoterapia”, „Aktualności” (obecnie anchory na `/`).

## Licencja / treść

Teksty i materiały wizualne oparte o publiczną stronę CMKW. Do użycia produkcyjnego uzyskaj zgodę właściciela marki na treści i logo.
