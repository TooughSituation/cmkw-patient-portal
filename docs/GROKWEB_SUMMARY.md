# Podsumowanie projektu — CMKW Patient Portal (dla GrokWeb)

**Data aktualizacji:** 2026-07-19  
**Status:** UI + **Auth.js v5 (JWT)** + deploy produkcyjny  
**Konto GitHub / Vercel:** TooughSituation / toough-situation

---

## 1. Cel

Portal pacjenta **Centrum Medycznego Kiryluk i Wenta** (Białystok).  
Wizualnie w stylu [cmkirylukwenta.pl](https://cmkirylukwenta.pl/) (biało-niebieska kolorystyka, sekcje, treści) + **Rejestracja / logowanie / chroniony portal**.

**Nie mylić z:** `akwen-web` (B2B Akwen) — osobny produkt, osobne repo.

---

## 2. Linki

| Zasób | URL |
|--------|-----|
| **Production** | https://cmkw-patient-portal.vercel.app |
| **GitHub** | https://github.com/TooughSituation/cmkw-patient-portal |
| **Vercel dashboard** | https://vercel.com/toough-situation/cmkw-patient-portal |
| **Referencja UI** | https://cmkirylukwenta.pl/ |
| **Lokalnie** | `C:\Users\user\akwen-web\cmkw-patient-portal` |

Folder leży przy `akwen-web`, ma **własne `.git`**. Parent ignoruje `cmkw-patient-portal/`.

---

## 3. Stack

- Next.js **15.5** App Router · React 19 · TypeScript  
- Tailwind CSS **v4** · shadcn/ui (Button, Card, Input, Label, Checkbox, Sheet, Separator, Sonner)  
- **Auth.js v5** (`next-auth@5.0.0-beta.31`) — Credentials + **JWT**  
- Zod (walidacja, PESEL) · bcryptjs · sonner  

### Dlaczego Auth.js, nie Clerk?

| | Auth.js (wybrane) | Clerk |
|--|-------------------|-------|
| PESEL / PII | U nas (store + JWT bez pełnego PESEL) | U zewnętrznego SaaS |
| RODO | Prostszy model (placówka = administrator) | DPA + transfery |
| Bez bazy | Credentials + JWT + file/memory | Wymaga konta Clerk |

---

## 4. Routing

| Ścieżka | Opis | Auth |
|---------|------|------|
| `/` | Home: hero, o nas, oferta, kontakt | public |
| `/login` | Logowanie | public; zalogowany → `/portal` |
| `/rejestracja` | Rejestracja (imię, nazwisko, PESEL, email, telefon, hasło, RODO) | public; zalogowany → `/portal` |
| `/portal` | Dashboard pacjenta | **wymaga sesji** → redirect `/login?callbackUrl=…` |
| `/api/auth/[...nextauth]` | Auth.js handlers | — |
| `/api/auth/register` | API rejestracji | — |

**Middleware** (`middleware.ts` + `auth.config.ts` edge-safe): chroni `/portal`, przekierowuje zalogowanych z `/login` i `/rejestracja`.

---

## 5. Auth — jak działa

1. **Rejestracja** → `POST /api/auth/register` → user w store (bcrypt) → `signIn("credentials")` → JWT cookie → `/portal`  
2. **Logowanie** → Auth.js Credentials → JWT (maxAge **8 h**)  
3. **Sesja JWT** zawiera: id, email, firstName, lastName, phone, **peselMasked** (nie pełny PESEL)  
4. **Wylogowanie** → `signOut` → `/`  

### Magazyn użytkowników (tymczasowy — NIE baza)

- Lokalnie: `.data/users.json` (w `.gitignore`, zawiera PII)  
- Vercel serverless: **pamięć procesu (ephemeral)** — cold start czyści konta  
- Docelowo: Postgres w EOG + szyfrowanie PII  

### Env (Vercel + lokalnie)

| Zmienna | Środowiska |
|---------|------------|
| `AUTH_SECRET` | Production · Preview · Development |
| `AUTH_URL` | Production = `https://cmkw-patient-portal.vercel.app` |

Lokalnie: `.env.local` (nie w git). Wzór: `.env.example`.

---

## 6. Brand / design

| Token | Hex | Użycie |
|-------|-----|--------|
| Brand | `#0849b0` | linki, CTA |
| Brand deep | `#2b2d81` | hero buttons, overlay |
| Brand heading | `#384480` | nagłówki |
| Footer | `#222222` | stopka |

Font: Segoe UI / system. Treści: `lib/site-config.ts`. Assety: `public/images/`.

---

## 7. Kluczowa struktura plików

```
auth.ts                 # NextAuth + Credentials (Node: bcrypt, store)
auth.config.ts          # edge-safe (middleware) — bez Node APIs
middleware.ts           # ochrona /portal
app/api/auth/[...nextauth]/route.ts
app/api/auth/register/route.ts
app/login/page.tsx
app/rejestracja/page.tsx
app/portal/page.tsx     # dashboard (server: auth())
lib/users-store.ts
lib/pesel.ts            # walidacja sumy kontrolnej PESEL
lib/validations/auth.ts # Zod
components/auth/login-form.tsx
components/auth/register-form.tsx
components/auth/logout-button.tsx
components/providers.tsx  # SessionProvider
types/next-auth.d.ts
```

---

## 8. Git / deploy (stan)

**Branch:** `main` = `origin/main`

| Commit | Opis |
|--------|------|
| `c975981` | initial scaffold |
| `f65bfe2` | ignore .vercel / env |
| `e807c55` | **feat(auth): Auth.js JWT, PESEL registration, protected portal** |

- Vercel Git connected — push `main` → production deploy  
- Smoke (po deploy auth): `/login` 200 · `/portal` **307** (redirect na login)

```bash
cd cmkw-patient-portal
npm install
cp .env.example .env.local   # AUTH_SECRET=...
npm run dev
git push origin main         # deploy
```

---

## 9. Test lokalny (quick)

1. `npm run dev`  
2. `/portal` bez sesji → `/login?callbackUrl=/portal`  
3. `/rejestracja`: PESEL np. **`44051401359`**, hasło `Haslo1234`, telefon `500600700`, RODO ✓  
4. Auto-login → `/portal` (powitanie + dane + placeholdery)  
5. Wyloguj → `/portal` znowu chronione  

---

## 10. Co NIE jest zrobione (kolejka)

1. **Baza** (Postgres EU) zamiast file/memory store  
2. Polityka prywatności / regulamin (osobne strony RODO)  
3. Moduły: wizyty, dokumenty, profil (dziś placeholdery)  
4. Rate limiting logowania, ewent. 2FA  
5. Pełne podstrony treści (dziś anchory `#…` na home)  
6. E2E Playwright  
7. Szyfrowanie PESEL at-rest  

---

## 11. Prompt startowy (wklejka do GrokWeb)

> Kontynuuj projekt **cmkw-patient-portal** (Next.js 15, CM Kiryluk i Wenta).  
> Repo: https://github.com/TooughSituation/cmkw-patient-portal  
> Prod: https://cmkw-patient-portal.vercel.app  
> Lokalnie: `C:\Users\user\akwen-web\cmkw-patient-portal`  
>  
> Auth.js v5 (Credentials + JWT) działa; middleware chroni `/portal`.  
> Rejestracja: imię, nazwisko, PESEL, email, telefon, hasło, RODO.  
> Magazyn użytkowników tymczasowy (`.data/` lokalnie / memory na Vercel) — **bez prawdziwej bazy**.  
> Brand: `#0849b0`, `#2b2d81`, `#384480`.  
> Następny krok: [tu wstaw zadanie, np. Postgres / wizyty / RODO pages].

---

## 12. TL;DR

Portal CMKW na Next.js 15 z UI w stylu cmkirylukwenta.pl, **Auth.js JWT**, chronionym `/portal`, formularzami login/rejestracja (PESEL + RODO), live na Vercel z `AUTH_SECRET`. Brak trwałej bazy — gotowe pod kolejny etap (Postgres + wizyty).
