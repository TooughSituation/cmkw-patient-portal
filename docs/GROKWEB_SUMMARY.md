# Podsumowanie projektu — CMKW Patient Portal (dla GrokWeb)

**Data aktualizacji:** 2026-07-24  
**Status:** strona publiczna + Portal Pacjenta + **Portal Lekarza EDM (Etap 0–11)**  
**Ostatni etap:** **11 — karta wizyty single-page + komunikator personelu** (feedback lekarza)  
**Konto:** TooughSituation / toough-situation

---

## 0. Etap 11 (2026-07-24) — feedback lekarza

### Karta wizyty — jeden widok (Lux Med–style)

- **Bez zakładek** — wywiad, ICD-10, leki, skierowania, dokumenty, historia na **jednej stronie**
- Sekcje accordion (domyślnie otwarte), chip-nawigacja do sekcji
- Duże pole wywiadu; łatwe dodawanie ICD i leków (pickery)
- **Akcje góra + dół (sticky):** Zapisz · W trakcie · Zakończ · Potwierdź · Drukuj · Anuluj
- Plik: `components/doctor/visit-card.tsx`

### Komunikator personelu (wewnętrzny chat EDM)

- Panel Sheet z topbara (ikona dymka + **badge** nieprzeczytanych)
- Odbiorca: kanał **Recepcja** lub konkretna osoba (DM)
- Priorytety: zwykła / **pilne** / **do wiadomości**
- Historia wiadomości + dźwięk (Web Audio) przy nowej
- Store: `cmkw-doctor-staff-chat-v1` (localStorage demo)
- Pliki: `components/doctor/staff-chat.tsx`, `hooks/use-staff-chat.ts`, `lib/doctor/chat-*.ts`

### Admin / brand

- Zakładka **Administracja** tylko rola `facility` (`cmkw@cmkw.pl`) — lekarz **nie widzi**
- Middleware: `/doctor/admin` → redirect + toast `denied=admin`
- Jasny brand CMKW (`#0849b0`), logo, badge EDM

### Test smoke (prod)

1. https://cmkw-patient-portal.vercel.app/doctor/login  
2. `jan.kiryluk@cmkw.pl` / `jankiryluk123` → wizyta z kalendarza → karta single-page  
3. Ikona wiadomości → chat do Recepcji (pilne)  
4. Brak menu Administracja; `/doctor/admin` zablokowane  
5. `cmkw@cmkw.pl` / `cmkw123` → Administracja OK · `recepcja@cmkw.pl` / `recepcja123` → chat  

Szczegóły: `docs/DOCTOR_PORTAL.md` → **Etap 11**.

---

## 1. Cel

Aplikacja **Centrum Medycznego Kiryluk i Wenta** (Białystok):

1. **Strona publiczna** — klon wizualny i treściowy [cmkirylukwenta.pl](https://cmkirylukwenta.pl/)  
2. **Portal pacjenta** — rejestracja, logowanie, umawianie wizyt (mock płatność)  
3. **Portal Lekarza / CMKW EDM** — kalendarz, wizyty, pacjenci, karta wizyty, chat personelu (Etap 0–11)

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
- Zod · bcryptjs · date-fns · react-day-picker · sonner · **@dnd-kit/core** + **@dnd-kit/utilities**  

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

### Portal Lekarza / CMKW EDM (Etap 0–2)

| Ścieżka | Opis |
|---------|------|
| `/doctor` | **Kalendarz** — mini-kalendarz + widok dnia + tabela wizyt |
| `/doctor/wizyty` | **Lista wizyt** — filtry, statusy, paginacja, szybka wizyta |
| `/doctor/pacjenci` | **Lista pacjentów** — wyszukiwanie, sort, filtry, paginacja |
| `/doctor/pacjenci/nowy` | Dodawanie (Zod + RHF) |
| `/doctor/pacjenci/[id]` | Karta pacjenta (zakładki + podsumowanie) |
| `/doctor/pacjenci/[id]/edytuj` | Edycja (pełny PESEL tylko tu) |
| `/doctor/leki` | Baza leków (42 seed, panel szczegółów) |
| `/doctor/icd10` | ICD-10 (~151 kodów, filtr rozdziałów, kopiuj) |
| `/doctor/kalkulatory` | 15 kalkulatorów medycznych |
| `/doctor/wizyty/[id]` | **Karta wizyty EDM** — single-page (Etap 11), bez zakładek |
| `/doctor/terminy` | Wyszukiwarka wolnych terminów + rezerwacja |
| `/doctor/admin` | **Tylko facility** — statystyki, placówka, ustawienia, staff |
| `/doctor/admin/grafiki` | **Grafiki pracy** (tyg. + wyjątki + podgląd) |
| `/doctor/przewodnik` | Product tour (Etap 10) |

**Styl EDM:** jasny layout CMKW (white navbar, `#0849b0`) — **nie** dark MyDr.

**Oddziały:** Białystok (Szymborskiej 2/U4) · Hajnówka · Wszystkie — filtr globalny w topbarze.  
**Grafiki:** doctor×branch, sloty z grafiku − zajęte wizyty; Kiryluk Pn/Śr/Pt 9–14.  
**Kalendarz:** Dzień | Tydzień | Miesiąc + filtr lekarza + legenda dostępności.  
**Etap 4 statusy:** Zaplanowana → Potwierdzona → Telepotwierdzona → W trakcie → Zakończona / Odwołana.  
**Etap 11:** karta single-page + komunikator personelu (badge, dźwięk, pilne/FYI).

**Middleware:**

- `/portal/*` → sesja wymagana; staff → redirect `/doctor`
- `/doctor/*` → sesja + rola `doctor` \| `admin` \| `reception` \| `facility`
- `/doctor/admin/*` → tylko `facility`
- niezalogowany na `/doctor` → `/doctor/login?callbackUrl=…`
- pacjent na `/doctor` → `/portal`

Role w JWT: `patient` | `doctor` | `admin` | `reception` | `facility`.  
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

### Konta demo

| Rola | Login | Hasło | Uwagi |
|------|-------|-------|--------|
| Placówka | `cmkw@cmkw.pl` | `cmkw123` | pełny EDM + Administracja |
| Lekarz | `jan.kiryluk@cmkw.pl` | `jankiryluk123` | **bez** Admin |
| Lekarz + udost. | `tomas.wenta@cmkw.pl` | `tomaswenta123` | widzi Kiryluka |
| Recepcja | `recepcja@cmkw.pl` | `recepcja123` | chat + multi-lekarz |
| Pacjent | `jan.kowalski@email.pl` | `jankowalski123` | `/login` |

Pozostali lekarze: `imie.nazwisko@cmkw.pl` / `imienazwisko123` (`lib/demo-accounts.ts`).

---

## 7. Booking pacjenta (skrót)

- Flow: lekarz → usługa+cena → kalendarz → potwierdzenie → mock płatność  
- 6 lekarzy (Kiryluk najmniej slotów) · 12 usług  
- Store: `.data/appointments.json` + localStorage  
- Pliki: `lib/booking/*`, `components/booking/*`

---

## 8. Portal Lekarza EDM (Etap 0–2) — szczegóły

### UI (brand CMKW — jasny)

- Biały top navbar + logo, badge EDM, oddział, **chat personelu** (badge), avatar  
- Zakładki: Kalendarz | Terminy | Wizyty | Pacjenci | Leki | ICD-10 | Kalkulatory | Przewodnik | Administracja\*  
- Prawy sidebar awatarów **tylko facility/reception** (izolacja lekarza)  
- Toasty (sonner), loading + empty states  

\* Administracja tylko `facility`

### Kalendarz / Wizyty

- Mini-kalendarz, tabela dnia, Szybka wizyta (dialog + wybór pacjenta)  
- Link z nazwiska pacjenta → karta  
- Lista wizyt: filtry, paginacja, statusy  

### Pacjenci (Etap 2)

- Lista: Nazwisko | Imię | PESEL mask | Telefon | Data ur. | Ostatnia wizyta | Status | Akcje  
- Wyszukiwanie + filtry zaawansowane + sort + paginacja  
- Formularz: Zod + react-hook-form, PESEL → auto data ur. + płeć  
- Karta: Historia wizyt | Dane | Notatki | Grupy/RODO + podsumowanie  
- Seed: **20 pacjentów** + **20 wizyt** (`patientId`), poprawne PESEL  
- Store: `cmkw-doctor-patients-v1`, `cmkw-doctor-visits-v2` + `.data/patients.json`  
- Shared state: `DoctorDataProvider`  

### Pliki

```
app/doctor/…  pacjenci/…
components/doctor/*  (list, form, card, quick-visit, data-provider)
lib/doctor/seed-patients.ts  patients-client.ts
lib/validations/patient.ts  lib/pesel.ts (build/parse)
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

### EDM Etap 8–9 (zrobione)

- Drag & drop wizyt + skróty + context menu  
- Rola **`facility`** (`cmkw@cmkw.pl` / `cmkw123`)  
- Izolacja danych zwykłych lekarzy  
- Udostępnianie kalendarzy (matryca w Admin)  
- Seed: Wenta widzi kalendarz Kiryluka (podgląd)  

### EDM Etap 10

1. E-recepta / e-skierowanie (P1)  
2. Historia farmakoterapii  
3. Prisma + API REST  
4. Realne SMS/IVR  
5. Integracja booking ↔ EDM  
6. RBAC + audit (serwerowy)  
7. Resource view (wiele kolumn lekarzy)  

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
> - **Portal Lekarza EDM Etap 0–9:** DnD kalendarz + **rola Placówka** + izolacja lekarzy + udostępnianie kalendarzy  
> - Brand: `#0849b0`, white EDM shell  
> - **Demo placówka:** `cmkw@cmkw.pl` / `cmkw123` (tylko ta rola widzi Administrację)  
> - **Demo lekarz:** `jan.kiryluk@cmkw.pl` / `jankiryluk123` · `tomas.wenta@cmkw.pl` / `tomaswenta123`  
> - **Demo pacjent:** `jan.kowalski@email.pl` / `jankowalski123`  
> - Docs: `docs/GROKWEB_SUMMARY.md`, `docs/DOCTOR_PORTAL.md`  
>  
> **Brak (Etap 10):** Prisma, e-recepta P1, realne SMS, historia farmakoterapii.  
> Następny krok: [tu wstaw zadanie].

---

## 14. TL;DR

CMKW = **klon strony** + **portal pacjenta** + **Portal Lekarza EDM** (Etap 0–9: placówka, izolacja lekarzy, DnD…). Demo placówka: `cmkw@cmkw.pl` / `cmkw123`. Kolejny etap: Prisma / e-recepta.
