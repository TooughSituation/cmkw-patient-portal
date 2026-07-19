# cmkw-patient-portal

Portal pacjenta i strona wizytowa **Centrum Medycznego Kiryluk i Wenta** (Białystok).

Aplikacja Next.js 15 w biało-niebieskiej kolorystyce [cmkirylukwenta.pl](https://cmkirylukwenta.pl/), z autoryzacją **Auth.js (NextAuth) v5**, sesją JWT i chronioną trasą `/portal`.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**
- **Auth.js v5** (`next-auth@beta`) — Credentials + JWT
- **Zod** — walidacja (w tym PESEL)
- **bcryptjs** — hashowanie haseł
- **sonner** — toast

## Dlaczego Auth.js, a nie Clerk?

| | **Auth.js (wybór)** | Clerk |
|--|---------------------|-------|
| Dane medyczne / PESEL | Zostają w Twojej infrastrukturze | Przetwarzane u US SaaS |
| RODO / umowa powierzenia | Prostszy model (kontroler = placówka) | Wymaga DPA + oceny transferów |
| Koszt / vendor lock-in | Open source, bez abonamentu | Płatne skale |
| Bez bazy (JWT) | Credentials + JWT + lokalny store | Wymaga konta Clerk |

**Clerk** jest szybszy w UI auth, ale dla placówki medycznej z PESEL domyślnie gorszy pod RODO. Auth.js + własne hostowanie sesji i haseł to bezpieczniejszy start; docelowo baza w EOG (np. Neon/Supabase EU).

## Wymagania

- Node.js 18.18+ (zalecane 20+)
- npm 9+

## Instalacja zależności

```bash
cd cmkw-patient-portal
npm install
```

Dodatkowe pakiety auth (już w `package.json`):

```bash
npm install next-auth@beta bcryptjs zod sonner
npm install -D @types/bcryptjs
```

## Zmienne środowiskowe

```bash
cp .env.example .env.local
```

```env
AUTH_SECRET=  # openssl rand -base64 32
AUTH_URL=http://localhost:3000
```

Na Vercel ustaw `AUTH_SECRET` (i opcjonalnie `AUTH_URL` = URL produkcji).

## Uruchomienie

```bash
npm run dev
```

Aplikacja: [http://localhost:3000](http://localhost:3000)

## Routing

| Ścieżka | Opis | Auth |
|---------|------|------|
| `/` | Strona główna | public |
| `/login` | Logowanie | public (redirect → `/portal` gdy zalogowany) |
| `/rejestracja` | Rejestracja (imię, nazwisko, PESEL, email, telefon, hasło, RODO) | public |
| `/portal` | Dashboard pacjenta | **wymaga sesji** (middleware → `/login`) |

## Magazyn użytkowników (tymczasowy)

- Plik `.data/users.json` lokalnie (ignorowany w git)
- Na Vercel: pamięć procesu (ephemeral)
- Hasła: bcrypt (cost 12)
- PESEL: pełny tylko w magazynie; w JWT / UI tylko maska `123456*****`

**Nie jest to baza produkcyjna** — kolejny krok: Postgres + szyfrowanie PII.

## Test lokalny (krok po kroku)

1. `npm run dev`
2. Wejdź na `/portal` bez logowania → redirect na `/login?callbackUrl=/portal`
3. `/rejestracja` — wypełnij formularz:
   - PESEL z poprawną sumą kontrolną, np. `44051401359`
   - hasło min. 8 znaków + litera + cyfra
   - zaznacz zgodę RODO
4. Po sukcesie → auto-login → `/portal` z powitaniem i danymi
5. Wyloguj → `/portal` znowu chronione
6. `/login` z tymi samymi danymi → `/portal`
7. Toasty (sukces / błąd) i walidacja pól (zły PESEL, brak zgody)

## Struktura (kluczowe pliki auth)

```
auth.ts                 # NextAuth + Credentials (Node)
auth.config.ts          # edge-safe config dla middleware
middleware.ts           # ochrona /portal
app/api/auth/[...nextauth]/route.ts
app/api/auth/register/route.ts
lib/users-store.ts
lib/pesel.ts
lib/validations/auth.ts
components/auth/*
```

## Deploy (Vercel)

1. Ustaw `AUTH_SECRET` w projekcie Vercel
2. Push na `main` (Git connected) lub `npx vercel --prod`

**Uwaga:** na serverless rejestracje nie przeżyją cold startu bez bazy — lokalnie plik `.data/` działa.

## Następne kroki

1. Baza (Postgres EU) + migracja z file store
2. Polityka prywatności / regulamin (osobne strony)
3. Moduły: wizyty, dokumenty, profil
4. Rate limiting logowania, 2FA opcjonalnie
5. E2E Playwright

## Licencja / treść

Teksty i materiały wizualne oparte o publiczną stronę CMKW. Do użycia produkcyjnego uzyskaj zgodę właściciela marki.
