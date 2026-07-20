# Podsumowanie projektu — CMKW Patient Portal (dla GrokWeb)

**Data aktualizacji:** 2026-07-20  
**Status:** strona publiczna + Portal Pacjenta + **Portal Lekarza EDM (Etap 0–1)** + deploy  
**Konto:** TooughSituation / toough-situation

---

## 1. Cel

Aplikacja **Centrum Medycznego Kiryluk i Wenta** (Białystok):

1. **Strona publiczna** — klon wizualny i treściowy [cmkirylukwenta.pl](https://cmkirylukwenta.pl/)  
2. **Portal pacjenta** — rejestracja, logowanie, umawianie wizyt (mock płatność)  
3. **Portal Lekarza / CMKW EDM** — kalendarz i lista wizyt (styl MyDr), Etap 0–1

**Dodatki względem oryginału (celowe):** przycisk **„Rejestracja / Portal Pacjenta”** w navbarze i w hero.

**Nie mylić z:** `akwen-web` (B2B Akwen) — osobne repo.

---

## 2. Linki

| Zasób | URL |
|--------|-----|
| **Production** | https://cmkw-patient-portal.vercel.app |
| **Doctor EDM (prod)** | https://cmkw-patient-portal.vercel.app/doctor |
| **GitHub** | https://github.com/TooughSituation/cmkw-patient-portal |
| **Vercel** | https://vercel.com/toough-situation/cmkw-patient-portal |
| **Oryginał (referencja)** | https://cmkirylukwenta.pl/ |
| **Lokalnie** | `C:\Users\user\akwen-web\cmkw-patient-portal` |

Własne `.git`; parent `akwen-web` ignoruje ten folder.

---

## 3. Stack

- Next.js **15.5** App Router · React 19 · TypeScript  
- Tailwind CSS **v4** · shadcn/ui (Button, Card, Table, Badge, Select, Calendar, Dialog, DropdownMenu, Tabs, Input, Avatar, …)  
- **Auth.js v5** — Credentials + JWT (8 h) + **role** w tokenie  
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

### Auth / portal pacjenta

| Ścieżka | Opis |
|---------|------|
| `/login`, `/rejestracja` | Auth (PESEL + RODO przy rejestracji); redirect home wg roli |
| `/portal` | Dashboard + **Moje wizyty** |
| `/portal/umow-wizyte` | Wizard rezerwacji |
| `/portal/umow-wizyte/platnosc` | Mock płatności |
| `/portal/umow-wizyte/sukces` | Potwierdzenie |
| `/api/auth/*`, `/api/appointments` | API |

### Portal Lekarza / CMKW EDM (Etap 0–1)

| Ścieżka | Opis |
|---------|------|
| `/doctor` | **Kalendarz** — mini-kalendarz + widok dnia + tabela wizyt |
| `/doctor/wizyty` | **Lista wizyt** — filtry, statusy, paginacja |

**Middleware:**

- `/portal/*` → sesja wymagana; staff → redirect `/doctor`
- `/doctor/*` → sesja + rola `doctor` \| `admin` \| `reception`
- niezalogowany na `/doctor` → `/login?callbackUrl=…`
- pacjent na `/doctor` → `/portal`

Role w JWT: `patient` | `doctor` | `admin` | `reception`.  
Dokumentacja EDM: `docs/DOCTOR_PORTAL.md`.

### Navbar (jak oryginał + CTA)

Strona Główna · Nasz Zespół · Leczenie ortopedyczne · Fizjoterapia i rehabilitacja · Aktualności i Baza Wiedzy · Kontakt  
+ **Rejestracja / Portal Pacjenta** (prominentny, niebieski)

Na `/doctor/*` marketingowy header/footer jest ukryty (`AppChrome`).

---

## 5. Brand / design

| Token | Hex | Użycie |
|-------|-----|--------|
| Brand | `#0849b0` | linki, CTA, EDM primary |
| Brand deep | `#2b2d81` | hero buttons, overlay, call banner |
| Brand heading | `#384480` | nagłówki |
| EDM navy | `#0f172a` / `#1e293b` | navbar / sidebar lekarza |
| Footer | `#222222` | stopka |
| Body | `#333` | tekst 17px |

- Font: **Segoe UI** / system stack  
- Hero: `public/images/hero.webp` + gradient `rgba(43,45,129,…)`  
- Treści: `lib/site-config.ts`, `lib/content/*`  
- Zdjęcia: `public/images/zespol/*`, `aktualnosci/*`, `centrum-medyczne.webp`

---

## 6. Auth (skrót)

- Auth.js v5 Credentials + JWT  
- Rejestracja pacjentów: imię, nazwisko, PESEL (checksum), email, telefon, hasło, RODO → rola `patient`  
- PESEL w sesji tylko zmaskowany  
- Users: `.data/users.json` (lokal) / memory (Vercel ephemeral)  
- **Seed personelu** przy starcie (jeśli brak w store)  
- Env: `AUTH_SECRET` (prod/preview/dev), `AUTH_URL` (prod)

### Konta demo EDM

| E-mail | Hasło | Rola |
|--------|-------|------|
| `jan.kiryluk@cmkw.pl` | `Lekarz123!` | doctor |
| `tomas.wenta@cmkw.pl` | `Lekarz123!` | doctor |
| `recepcja@cmkw.pl` | `Recep123!` | reception |
| `admin@cmkw.pl` | `Admin123!` | admin |

---

## 7. Booking pacjenta (skrót)

- Flow: lekarz → usługa+cena → kalendarz → potwierdzenie → mock płatność  
- 6 lekarzy (Kiryluk najmniej slotów) · 12 usług  
- Store: `.data/appointments.json` + localStorage  
- Pliki: `lib/booking/*`, `components/booking/*`

---

## 8. Portal Lekarza EDM (Etap 0–1) — szczegóły

### UI (klimat MyDr)

- Dark top navbar: logo CMKW EDM, badge ZnanyLekarz, przełącznik oddziałów, powiadomienia/wiadomości/ustawienia, avatar  
- Zakładki: Kalendarz | Wizyty | Pacjenci* | Baza leków* | Kalkulatory* | ICD-10* | Inne*  
- Prawy sidebar z avatarami lekarzy (xl+)  
- Toasty (sonner), loading + empty states  

\* placeholdery → Etap 2

### Kalendarz `/doctor`

- Lewy mini-kalendarz (react-day-picker / shadcn Calendar, locale PL)  
- Tabela dnia: Godzina | Pacjent | Grupy | Stan | Typ | Notatka | Akcje  
- Przyciski: SZYBKA WIZYTA, DODAJ PACJENTA, ZAKOŃCZ DZIEŃ  
- Filtr „Ukryj zakończone”, wyszukiwarka  
- Placeholder Telepotwierdzenia  

### Lista wizyt `/doctor/wizyty`

- Filtry: pacjent, data od–do, lekarz, stan  
- Kolumny + PESEL maskowany + badge statusów  
- Statusy: Zaplanowana, Potwierdzona, Odwołana, Zakończona  
- Paginacja (10/str), DODAJ WIZYTĘ  

### Dane

- Seed: **20 wizyt** (`lib/doctor/seed-visits.ts`), daty względne do „dziś”  
- Klient: `localStorage` klucz `cmkw-doctor-visits-v1`  
- Serwer (pod API): `.data/doctor-visits.json`  
- Lekarze seed: Kiryluk, Wenta, Frankowski, Zawadzki, Torba, Sammoudi  

### Pliki

```
app/doctor/layout.tsx  page.tsx  wizyty/page.tsx
components/doctor/*
lib/doctor/*   lib/auth/roles.ts
hooks/use-doctor-visits.ts
docs/DOCTOR_PORTAL.md
```

---

## 9. Kluczowa struktura plików

```
app/
  page.tsx … kontakt/ … login/ rejestracja/ portal/
  doctor/                     # EDM
components/
  site-header.tsx  site-footer.tsx  hero.tsx
  layout/app-chrome.tsx       # ukrywa chrome na /doctor
  doctor/*  booking/*  auth/*  ui/*
lib/
  site-config.ts  content/*  booking/*  users-store.ts
  auth/roles.ts  doctor/*
auth.ts  auth.config.ts  middleware.ts
docs/GROKWEB_SUMMARY.md  docs/DOCTOR_PORTAL.md
public/images/...
```

---

## 10. Git / deploy

**Branch:** `main` = `origin/main`  
Push `main` → Vercel production.

```bash
cd C:\Users\user\akwen-web\cmkw-patient-portal
npm install && npm run dev   # http://localhost:3000
# EDM: http://localhost:3000/doctor  (login staff)
```

---

## 11. Weryfikacja

### Publiczna strona

1. localhost vs https://cmkirylukwenta.pl/  
2. Menu + mobile hamburger  
3. Celowe różnice: CTA portalu  

### Portal pacjenta

1. Rejestracja → `/portal` → umów wizytę → mock płatność  

### Portal lekarza

1. Login `jan.kiryluk@cmkw.pl` / `Lekarz123!` → `/doctor`  
2. Kalendarz: zmiana dnia, filtry, zmiana statusu wizyty (toast)  
3. `/doctor/wizyty`: filtry + paginacja  
4. Pacjent nie wejdzie na `/doctor` → `/portal`  

---

## 12. Backlog

### EDM Etap 2

1. Pacjenci CRUD  
2. Formularze Szybka wizyta / Dodaj wizytę  
3. Karta wizyty EDM (wywiad, ICD, zalecenia)  
4. Baza leków, ICD-10, kalkulatory  
5. Telepotwierdzenia (pełny moduł)  
6. API REST doctor + integracja z bookingiem pacjenta  
7. RBAC granularne (reception vs doctor vs admin)  

### Platforma

1. Postgres EU (users + appointments + visits)  
2. Realna bramka płatności  
3. Większe zdjęcia zespołu  
4. Dokumenty, profil, e-mail/SMS  
5. Strony RODO/regulamin  
6. E2E Playwright  

---

## 13. Prompt startowy (wklejka GrokWeb)

> Kontynuuj projekt **cmkw-patient-portal** (Next.js 15 App Router, TypeScript, Tailwind v4, shadcn/ui, Auth.js v5 JWT + role).  
> Repo: https://github.com/TooughSituation/cmkw-patient-portal  
> Prod: https://cmkw-patient-portal.vercel.app  
> EDM: https://cmkw-patient-portal.vercel.app/doctor  
> Lokalnie: `C:\Users\user\akwen-web\cmkw-patient-portal`  
>  
> **Gotowe:**  
> - Pełny klon publicznej strony cmkirylukwenta.pl  
> - Portal pacjenta: auth (PESEL+RODO), booking + mock płatność  
> - **Portal Lekarza EDM Etap 0–1:** `/doctor` kalendarz, `/doctor/wizyty` lista; role doctor|admin|reception; seed staff; 20 mock wizyt (localStorage + .data)  
> - Brand: `#0849b0`, navy EDM `#0f172a`  
> - Docs: `docs/GROKWEB_SUMMARY.md`, `docs/DOCTOR_PORTAL.md`  
>  
> **Demo EDM:** `jan.kiryluk@cmkw.pl` / `Lekarz123!`  
> **Brak (Etap 2):** pacjenci CRUD, leki, ICD, kalkulatory, karta wizyty, Prisma, realna płatność.  
> Następny krok: [tu wstaw zadanie].

---

## 14. TL;DR

CMKW = **klon strony** cmkirylukwenta.pl + **portal pacjenta** (auth + wizyty) + **Portal Lekarza EDM** (kalendarz + lista wizyt, Etap 0–1), live na Vercel. Store tymczasowy; kolejny etap EDM: pacjenci CRUD, formularze wizyt, Prisma.
