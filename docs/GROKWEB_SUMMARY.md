# Podsumowanie projektu — CMKW Patient Portal (dla GrokWeb)

**Data aktualizacji:** 2026-07-19  
**Status:** pełny klon strony publicznej + Auth.js JWT + booking wizyt + deploy  
**Konto:** TooughSituation / toough-situation

---

## 1. Cel

Aplikacja **Centrum Medycznego Kiryluk i Wenta** (Białystok):

1. **Strona publiczna** — klon wizualny i treściowy [cmkirylukwenta.pl](https://cmkirylukwenta.pl/)  
2. **Portal pacjenta** — rejestracja, logowanie, umawianie wizyt (mock płatność)

**Dodatki względem oryginału (celowe):** przycisk **„Rejestracja / Portal Pacjenta”** w navbarze i w hero.

**Nie mylić z:** `akwen-web` (B2B Akwen) — osobne repo.

---

## 2. Linki

| Zasób | URL |
|--------|-----|
| **Production** | https://cmkw-patient-portal.vercel.app |
| **GitHub** | https://github.com/TooughSituation/cmkw-patient-portal |
| **Vercel** | https://vercel.com/toough-situation/cmkw-patient-portal |
| **Oryginał (referencja)** | https://cmkirylukwenta.pl/ |
| **Lokalnie** | `C:\Users\user\akwen-web\cmkw-patient-portal` |

Własne `.git`; parent `akwen-web` ignoruje ten folder.

---

## 3. Stack

- Next.js **15.5** App Router · React 19 · TypeScript  
- Tailwind CSS **v4** · shadcn/ui  
- **Auth.js v5** — Credentials + JWT (8 h)  
- Zod · bcryptjs · date-fns · react-day-picker · sonner  

---

## 4. Routing — pełna mapa

### Publiczne (klon CMKW)

| Ścieżka | Opis |
|---------|------|
| `/` | Home: hero + o nas + kontakt (jak oryginał) |
| `/nasz-zespol` | 6 lekarzy, zdjęcia, opisy, specjalizacje |
| `/leczenie-ortopedyczne` | Pełna treść z oryginału |
| `/fizjoterapia-i-rehabilitacja` | Rehabilitacja + CPM |
| `/aktualnosci-i-baza-wiedzy` | Lista aktualności |
| `/aktualnosci-i-baza-wiedzy/[slug]` | 2 artykuły (SSG) |
| `/kontakt` | Dane + zdjęcie + mapa + CTA portalu |

### Auth / portal

| Ścieżka | Opis |
|---------|------|
| `/login`, `/rejestracja` | Auth (PESEL + RODO przy rejestracji) |
| `/portal` | Dashboard + **Moje wizyty** |
| `/portal/umow-wizyte` | Wizard rezerwacji |
| `/portal/umow-wizyte/platnosc` | Mock płatności |
| `/portal/umow-wizyte/sukces` | Potwierdzenie |
| `/api/auth/*`, `/api/appointments` | API |

**Middleware:** całe `/portal/*` wymaga sesji → `/login?callbackUrl=…`.

### Navbar (jak oryginał + CTA)

Strona Główna · Nasz Zespół · Leczenie ortopedyczne · Fizjoterapia i rehabilitacja · Aktualności i Baza Wiedzy · Kontakt  
+ **Rejestracja / Portal Pacjenta** (prominentny, niebieski)

---

## 5. Brand / design

| Token | Hex | Użycie |
|-------|-----|--------|
| Brand | `#0849b0` | linki, CTA |
| Brand deep | `#2b2d81` | hero buttons, overlay, call banner |
| Brand heading | `#384480` | nagłówki |
| Footer | `#222222` | stopka |
| Body | `#333` | tekst 17px |

- Font: **Segoe UI** / system stack  
- Hero: `public/images/hero.webp` + gradient `rgba(43,45,129,…)`  
- Tło sekcji: `bg-pattern.webp`  
- Treści: `lib/site-config.ts`, `lib/content/*`  
- Zdjęcia: `public/images/zespol/*`, `aktualnosci/*`, `centrum-medyczne.webp`

---

## 6. Auth (skrót)

- Auth.js v5 Credentials + JWT  
- Rejestracja: imię, nazwisko, PESEL (checksum), email, telefon, hasło, RODO  
- PESEL w sesji tylko zmaskowany  
- Users: `.data/users.json` (lokal) / memory (Vercel ephemeral)  
- Env: `AUTH_SECRET` (prod/preview/dev), `AUTH_URL` (prod)

---

## 7. Booking (skrót)

- Flow: lekarz → usługa+cena → kalendarz (miesiąc/lista) → potwierdzenie → mock płatność  
- 6 lekarzy (Kiryluk najmniej slotów) · 12 usług  
- Store: `.data/appointments.json` + localStorage  
- Pliki: `lib/booking/*`, `components/booking/*`

---

## 8. Kluczowa struktura plików (public + core)

```
app/
  page.tsx                          # home klon
  nasz-zespol/page.tsx
  leczenie-ortopedyczne/page.tsx
  fizjoterapia-i-rehabilitacja/page.tsx
  aktualnosci-i-baza-wiedzy/
  kontakt/page.tsx
  login/  rejestracja/  portal/
components/
  site-header.tsx   site-footer.tsx   hero.tsx
  layout/page-hero.tsx  content-section.tsx  call-banner.tsx
  booking/*   auth/*
lib/
  site-config.ts
  content/team.ts  ortopedia.ts  fizjoterapia.ts  news.ts
  booking/*   users-store.ts  pesel.ts
auth.ts  auth.config.ts  middleware.ts
public/images/...
```

---

## 9. Git (stan)

**Branch:** `main` = `origin/main`

| Commit | Opis |
|--------|------|
| `c975981` | initial scaffold |
| `f65bfe2` | ignore .vercel / env |
| `e807c55` | feat(auth) JWT + PESEL + portal |
| `6e537a8` | feat(booking) wizyty + mock payment |
| `5b59280` | **feat(site): full public clone of cmkirylukwenta.pl pages** |

Push `main` → Vercel production.

```bash
cd cmkw-patient-portal
npm install && npm run dev   # http://localhost:3000
```

---

## 10. Weryfikacja wizualna (klon)

1. Otwórz równolegle localhost i https://cmkirylukwenta.pl/  
2. Porównaj home: hero, o nas, kontakt  
3. Przejdź wszystkie pozycje menu  
4. Mobile: hamburger + CTA  
5. **Celowe różnice:** CTA portalu w navbarze/hero; mapa na `/kontakt`; stopka z linkiem do portalu  

**Uwaga:** zdjęcia lekarzy z oryginału to małe thumbnaili — jakość przy dużym cropie ograniczona.

---

## 11. Backlog

1. Postgres EU (users + appointments)  
2. Realna bramka płatności  
3. Większe zdjęcia zespołu  
4. Anulowanie wizyt / HIS  
5. Dokumenty, profil, e-mail/SMS  
6. Strony RODO/regulamin  
7. E2E Playwright  

---

## 12. Prompt startowy (wklejka GrokWeb)

> Kontynuuj projekt **cmkw-patient-portal** (Next.js 15, CM Kiryluk i Wenta).  
> Repo: https://github.com/TooughSituation/cmkw-patient-portal  
> Prod: https://cmkw-patient-portal.vercel.app  
> Lokalnie: `C:\Users\user\akwen-web\cmkw-patient-portal`  
>  
> **Gotowe:**  
> - Pełny klon publicznej strony cmkirylukwenta.pl (/, /nasz-zespol, /leczenie-ortopedyczne, /fizjoterapia-i-rehabilitacja, /aktualnosci-i-baza-wiedzy, /kontakt)  
> - Navbar oryginalny + CTA „Rejestracja / Portal Pacjenta”  
> - Auth.js JWT (PESEL+RODO), middleware `/portal/*`  
> - Booking: `/portal/umow-wizyte` + mock płatność + moje wizyty  
> Brand: `#0849b0`, `#2b2d81`, `#384480`.  
> **Brak:** baza, realna płatność, HIS.  
> Następny krok: [tu wstaw zadanie].

---

## 13. TL;DR

CMKW Patient Portal = **klon strony publicznej** cmkirylukwenta.pl + **portal pacjenta** (auth + umawianie wizyt z mock płatnością), live na Vercel. Store tymczasowy; kolejny etap: Postgres i produkcyjna płatność.
