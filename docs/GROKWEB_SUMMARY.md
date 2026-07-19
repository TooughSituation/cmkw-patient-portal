# Podsumowanie projektu — CMKW Patient Portal (dla GrokWeb)

**Data aktualizacji:** 2026-07-19  
**Status:** UI + Auth.js v5 (JWT) + **moduł umawiania wizyt** + deploy produkcyjny  
**Konto GitHub / Vercel:** TooughSituation / toough-situation

---

## 1. Cel

Portal pacjenta **Centrum Medycznego Kiryluk i Wenta** (Białystok).  
Wizualnie w stylu [cmkirylukwenta.pl](https://cmkirylukwenta.pl/) + rejestracja/logowanie + **rezerwacja wizyt online** (mock płatności).

**Nie mylić z:** `akwen-web` (B2B Akwen) — osobny produkt, osobne repo.

---

## 2. Linki

| Zasób | URL |
|--------|-----|
| **Production** | https://cmkw-patient-portal.vercel.app |
| **GitHub** | https://github.com/TooughSituation/cmkw-patient-portal |
| **Vercel dashboard** | https://vercel.com/toough-situation/cmkw-patient-portal |
| **Referencja UI** | https://cmkirylukwenta.pl/ |
| **Zespół (źródło lekarzy)** | https://cmkirylukwenta.pl/nasz-zespol |
| **Lokalnie** | `C:\Users\user\akwen-web\cmkw-patient-portal` |

Własne `.git`; parent `akwen-web` ignoruje folder projektu.

---

## 3. Stack

- Next.js **15.5** App Router · React 19 · TypeScript  
- Tailwind CSS **v4** · shadcn/ui (Button, Card, Input, Label, Checkbox, Calendar, Tabs, Badge, Textarea, Sheet, Sonner…)  
- **Auth.js v5** (`next-auth@beta`) — Credentials + **JWT** (8 h)  
- Zod · bcryptjs · date-fns · react-day-picker  

**Auth.js zamiast Clerk** — PESEL/PII u nas (lepsze pod RODO dla placówki medycznej).

---

## 4. Routing

| Ścieżka | Opis | Auth |
|---------|------|------|
| `/` | Home: hero, o nas, oferta, kontakt | public |
| `/login` | Logowanie | public → zalogowany na `/portal` |
| `/rejestracja` | Rejestracja (imię, nazwisko, PESEL, email, telefon, hasło, RODO) | public |
| `/portal` | Dashboard + **Moje wizyty** + CTA Umów wizytę | **chronione** |
| `/portal/umow-wizyte` | Wizard rezerwacji (lekarz → usługa → termin → potwierdzenie) | **chronione** |
| `/portal/umow-wizyte/platnosc` | Mock płatności | **chronione** |
| `/portal/umow-wizyte/sukces` | Potwierdzenie rezerwacji | **chronione** |
| `/api/auth/[...nextauth]` | Auth.js | — |
| `/api/auth/register` | Rejestracja użytkownika | — |
| `/api/appointments` | GET lista / POST nowa wizyta | sesja wymagana |

**Middleware** (`middleware.ts` + `auth.config.ts`): całość `/portal/*` wymaga sesji → `/login?callbackUrl=…`.

---

## 5. Auth (skrót)

- Credentials + JWT; hasła bcrypt; PESEL tylko zmaskowany w sesji  
- Store użytkowników: `.data/users.json` (lokal) / memory (Vercel — ephemeral)  
- Env Vercel: `AUTH_SECRET` (prod/preview/dev), `AUTH_URL` (prod)

---

## 6. Moduł wizyt (booking)

### Flow
1. Wybór **lekarza**  
2. Wybór **usługi + cena**  
3. **Kalendarz**: Monthly (shadcn Calendar) ↔ Lista slotów; 8:00–17:30 / 30 min; ~40 dni; So ograniczone, Nd zamknięte  
4. Potwierdzenie danych z sesji + notatka → **Umów i zapłać**  
5. Mock płatności → **Symuluj płatność** → zapis + sukces  
6. Lista na `/portal` (**Moje wizyty**)

### Lekarze (`lib/booking/doctors.ts`)
| id | Osoba | Dostępność (factor) |
|----|--------|---------------------|
| `kiryluk` | Dr n. med. Jan Kiryluk | **0.22** (najmniej slotów) |
| `wenta` | Lek. Tomas Wenta | 0.48 |
| `frankowski` | Lek. Paweł Frankowski | 0.55 |
| `zawadzki` | Lek. Andrzej Zawadzki | 0.58 |
| `torba` | Lek. Grzegorz Torba | 0.62 |
| `sammoudi` | Lek. Saddam Sammoudi | **0.68** (najwięcej) |

Sloty: deterministyczny PRNG (seed = `doctorId:yyyy-MM-dd`) w `lib/booking/slots.ts`.

### Usługi / ceny (`lib/booking/services.ts`) — orientacyjne
| Usługa | Cena |
|--------|------|
| Konsultacja ortopedyczna | 250 zł |
| Konsultacja + USG | 380 zł |
| USG narządu ruchu | 180 zł |
| Terapia PRP | 650 zł |
| Iniekcja kwasu hialuronowego | 450 zł |
| Artroskopia diagnostyczna | 1200 zł |
| Rehabilitacja 1 sesja | 160 zł |
| Rehabilitacja pakiet 10 sesji | 1450 zł |
| Wynajem szyny CPM (tydzień) | 280 zł |
| Blokada stawowa | 320 zł |
| Kontrola pooperacyjna | 200 zł |
| Fale uderzeniowe 1 sesja | 190 zł |

### Persist rezerwacji
- Server: `.data/appointments.json` + memory (`lib/booking/appointments-store.ts`)  
- Client: draft w **sessionStorage**, backup listy w **localStorage** (`lib/booking/draft.ts`)  
- API: `GET/POST /api/appointments` (wymaga JWT)

### Kluczowe pliki booking
```
lib/booking/doctors.ts
lib/booking/services.ts
lib/booking/slots.ts
lib/booking/appointments-store.ts
lib/booking/draft.ts
components/booking/booking-wizard.tsx
components/booking/payment-mock.tsx
components/booking/my-appointments.tsx
app/portal/umow-wizyte/page.tsx
app/portal/umow-wizyte/platnosc/page.tsx
app/portal/umow-wizyte/sukces/page.tsx
app/api/appointments/route.ts
```

---

## 7. Brand

| Token | Hex |
|-------|-----|
| Brand | `#0849b0` |
| Brand deep | `#2b2d81` |
| Brand heading | `#384480` |
| Footer | `#222222` |

Font: Segoe UI. Treści marketingowe: `lib/site-config.ts`.

---

## 8. Git (stan)

**Branch:** `main` = `origin/main`

| Commit | Opis |
|--------|------|
| `c975981` | initial scaffold |
| `f65bfe2` | ignore .vercel / env |
| `e807c55` | feat(auth): Auth.js JWT, PESEL, protected portal |
| `6e537a8` | **feat(booking): appointment booking with calendar and mock payment** |

Push na `main` → Vercel production deploy (Git connected).

```bash
cd cmkw-patient-portal
npm install
cp .env.example .env.local   # AUTH_SECRET=...
npm run dev
```

---

## 9. Test E2E (manual)

1. `npm run dev` → rejestracja/login  
2. `/portal` → **Umów wizytę**  
3. Lekarz (porównaj Kiryluk vs Sammoudi) → usługa → miesiąc/lista → godzina  
4. Notatka → **Umów i zapłać** → **Symuluj płatność**  
5. Sukces → `/portal` pokazuje wizytę na liście  
6. `/portal` bez sesji → redirect login  

PESEL testowy: `44051401359`

---

## 10. Backlog

1. **Postgres EU** — użytkownicy + wizyty (zamiast file/memory)  
2. Realna bramka płatności (PayU / Przelewy24)  
3. Integracja z kalendarzem HIS / synchronizacja zajętości  
4. Anulowanie / zmiana terminu wizyty  
5. Dokumenty, profil, powiadomienia e-mail/SMS  
6. Strony RODO / regulamin  
7. E2E Playwright  

---

## 11. Prompt startowy (wklejka GrokWeb)

> Kontynuuj projekt **cmkw-patient-portal** (Next.js 15, CM Kiryluk i Wenta).  
> Repo: https://github.com/TooughSituation/cmkw-patient-portal  
> Prod: https://cmkw-patient-portal.vercel.app  
> Lokalnie: `C:\Users\user\akwen-web\cmkw-patient-portal`  
>  
> **Gotowe:** Auth.js v5 JWT; middleware na `/portal/*`; rejestracja z PESEL+RODO;  
> booking: `/portal/umow-wizyte` (lekarz → usługa → kalendarz → mock płatność);  
> lista wizyt na `/portal`; store tymczasowy (`.data/` + localStorage).  
> Brand: `#0849b0`, `#2b2d81`, `#384480`.  
> **Brak:** prawdziwa baza, realna płatność, HIS.  
> Następny krok: [tu wstaw zadanie].

---

## 12. TL;DR

Portal CMKW: Next.js 15 + Auth.js + **pełny wizard umawiania wizyt** (6 lekarzy, 12 usług, kalendarz, mock płatność, moje wizyty), live na Vercel. Store tymczasowy — kolejny etap to Postgres i realna płatność.
