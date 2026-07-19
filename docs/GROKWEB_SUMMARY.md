# Podsumowanie projektu — CMKW Patient Portal (dla GrokWeb)

**Data:** 2026-07-19  
**Status:** szkielet UI + deploy produkcyjny (bez auth)  
**Właściciel konta:** TooughSituation

---

## 1. Cel

Oddzielna aplikacja **portalu pacjenta** dla **Centrum Medycznego Kiryluk i Wenta** (Białystok).  
Wizualnie ma oddawać stronę [cmkirylukwenta.pl](https://cmkirylukwenta.pl/) (biało-niebieska kolorystyka, układ sekcji, treści), a jednocześnie wprowadza nowy CTA **„Rejestracja / Portal Pacjenta”** i routing pod przyszłą autoryzację.

**Nie mylić z:** `akwen-web` (portal B2B Akwen) — to osobny produkt, osobne repo.

---

## 2. Linki

| Zasób | URL |
|--------|-----|
| **Production (Vercel)** | https://cmkw-patient-portal.vercel.app |
| **GitHub** | https://github.com/TooughSituation/cmkw-patient-portal |
| **Vercel dashboard** | https://vercel.com/toough-situation/cmkw-patient-portal |
| **Oryginał (referencja UI)** | https://cmkirylukwenta.pl/ |
| **Lokalnie** | `C:\Users\user\akwen-web\cmkw-patient-portal` |

> Folder leży fizycznie obok/wewnątrz `akwen-web`, ale ma **własne `.git`**. Parent `akwen-web` ignoruje `cmkw-patient-portal/` w `.gitignore`.

---

## 3. Stack

- **Next.js 15.5** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (radix-nova: Button, Card, Sheet, Separator)
- **lucide-react** (ikony)
- Przekierowania: `next/navigation` (`useRouter`)
- **Bez** logiki auth, bazy, API (celowo — tylko szkielet)

---

## 4. Routing (aktualny)

| Ścieżka | Co robi | Auth |
|---------|---------|------|
| `/` | Strona główna: Hero, O nas, Oferta (3 karty), Kontakt | public |
| `/rejestracja` | Szkielet rejestracji / wejścia do portalu | public |
| `/portal` | Szkielet „chronionej” strefy pacjenta (wizyty, dokumenty, profil — placeholdery) | **brak** (do zrobienia) |
| `/robots.txt`, `/sitemap.xml` | SEO | public; `/portal` w disallow |

CTA „Rejestracja / Portal Pacjenta” → `router.push("/rejestracja")`.  
Z rejestracji „Przejdź do portalu” → `/portal`.

---

## 5. Brand / design tokens

Z oryginalnej strony:

| Token | Hex | Użycie |
|-------|-----|--------|
| Brand | `#0849b0` | linki, CTA, akcenty |
| Brand deep | `#2b2d81` | przyciski hero, overlay |
| Brand heading | `#384480` | nagłówki |
| Footer | `#222222` | stopka |
| Body | `#333` | tekst |

- Font: **Segoe UI** / system stack (jak oryginał)
- Assety w `public/images/`: `logo.webp`, `hero.webp`, `bg-pattern.webp` (pobrane z cmkirylukwenta.pl)
- Treści i kontakt: `lib/site-config.ts`

**Kontakt placówki (z oryginału):**  
Wisławy Szymborskiej 2/U4, 15-424 Białystok · +48 660 281 212 · +48 539 999 105 · cmkirylukwenta@gmail.com

---

## 6. Struktura kodu

```
cmkw-patient-portal/
├── app/
│   ├── layout.tsx          # SEO metadata, SiteHeader, SiteFooter, lang=pl
│   ├── page.tsx            # home
│   ├── globals.css         # tokeny brand + shadcn
│   ├── rejestracja/        # skeleton rejestracji
│   ├── portal/             # skeleton portalu (noindex)
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── site-header.tsx     # navbar + mobile Sheet + CTA
│   ├── hero.tsx
│   ├── about-section.tsx
│   ├── services-section.tsx
│   ├── contact-section.tsx
│   ├── site-footer.tsx
│   └── ui/                 # shadcn
├── lib/
│   ├── site-config.ts      # single source of truth dla treści
│   └── utils.ts            # cn()
├── public/images/
├── next.config.ts          # turbopack.root = ten folder (izolacja od parenta)
└── README.md
```

**Ważne:** `next.config.ts` ustawia `turbopack.root` na katalog projektu — bez tego Next.js łapał middleware z parenta `akwen-web`.

---

## 7. Git / deploy (stan)

**Branch:** `main` (tracking `origin/main`)

| Commit | Opis |
|--------|------|
| `c975981` | `feat: initial CMKW patient portal scaffold` |
| `f65bfe2` | `chore: ignore .vercel and env files from local link` |

- Vercel team: **toough-situation** (`team_ndhDPoJZDsVja8WiJjqE2puZ`)
- GitHub ↔ Vercel: **połączone** — push na `main` powinien triggerować production deploy
- Production alias: **https://cmkw-patient-portal.vercel.app** (HTTP 200 potwierdzone)

```bash
cd cmkw-patient-portal
npm install && npm run dev    # localhost:3000
git push origin main          # deploy via Vercel Git
```

---

## 8. Co NIE jest zrobione (kolejka)

1. **Autoryzacja** — Auth.js / Clerk; sesja; middleware chroniący `/portal`
2. **Formularze** rejestracji i logowania (Zod + shadcn Form)
3. **Portal** — prawdziwe wizyty, dokumenty, profil + integracja API/HIS
4. **Powiadomienia** — e-mail/SMS o wizytach
5. **RODO** — polityka, zgody, usuwanie danych
6. **Podstrony treści** — obecnie menu to anchory `#leczenie-ortopedyczne`, `#fizjoterapia`, `#aktualnosci`, `#kontakt` (nie pełne trasy jak na oryginale)
7. **Testy** — Playwright E2E (rejestracja → portal)
8. **Domena własna** — opcjonalnie podpiąć pod CMKW

---

## 9. Kontekst dla kontynuacji w GrokWeb / CLI

Przy kolejnej sesji:

- Pracuj w **`cmkw-patient-portal`**, nie w `akwen-web` (chyba że użytkownik prosi o Akwen).
- Nie wdrażaj auth „na pół gwizdka” — middleware + provider + strona logowania razem.
- Zachowaj kolory/tokeny z `globals.css` i treści z `site-config.ts`.
- Deploy: push `main` albo `npx vercel --prod --scope toough-situation`.
- Nie commituj `.vercel/`, `.env*`, `node_modules/`.

**Prompt startowy (wklejka):**

> Kontynuuj projekt **cmkw-patient-portal** (Next.js 15, CM Kiryluk i Wenta).  
> Repo: https://github.com/TooughSituation/cmkw-patient-portal  
> Prod: https://cmkw-patient-portal.vercel.app  
> Lokalnie: `C:\Users\user\akwen-web\cmkw-patient-portal`  
> Szkielet UI gotowy; brak auth. Następny krok: [tu wstaw zadanie].

---

## 10. Jednozdaniowe TL;DR

Szkielet portalu pacjenta CMKW w Next.js 15 z UI w stylu cmkirylukwenta.pl, routingiem `/` · `/rejestracja` · `/portal`, osobnym repo GitHub i live deploy na Vercel — bez autoryzacji, gotowy pod kolejne etapy (auth → wizyty → API).
