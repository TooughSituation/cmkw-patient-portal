# Portal Lekarza / CMKW EDM — Etap 0 + 1

**Status:** fundament + kalendarz + lista wizyt  
**Prefix:** `/doctor/*`  
**Role:** `doctor` | `admin` | `reception`

---

## Uruchomienie

```bash
cd C:\Users\user\akwen-web\cmkw-patient-portal
npm install
npm run dev
```

Otwórz: [http://localhost:3000/doctor](http://localhost:3000/doctor)

Bez sesji → redirect na `/login?callbackUrl=/doctor`.

---

## Konta demo (seed przy starcie)

| E-mail | Hasło | Rola |
|--------|-------|------|
| `jan.kiryluk@cmkw.pl` | `Lekarz123!` | doctor |
| `tomas.wenta@cmkw.pl` | `Lekarz123!` | doctor |
| `recepcja@cmkw.pl` | `Recep123!` | reception |
| `admin@cmkw.pl` | `Admin123!` | admin |

Pacjent (rejestracja na `/rejestracja`) **nie** wejdzie na `/doctor` → redirect na `/portal`.

---

## Testowanie ręcznie

1. Zaloguj się jako `jan.kiryluk@cmkw.pl` / `Lekarz123!`
2. Powinien otworzyć się **Kalendarz** (`/doctor`) — dark navbar, zakładki, mini-kalendarz, tabela dnia
3. Przełącz datę w mini-kalendarzu; dni z wizytami mają niebieską kropkę
4. Filtr „Ukryj zakończone”, wyszukiwarka, akcje wiersza (potwierdź / zakończ / odwołaj) + toast
5. Zakładka **Wizyty** → filtry (pacjent, data od-do, lekarz, stan), paginacja
6. Wyloguj → zaloguj jako pacjent → `/doctor` → `/portal`
7. Personel na `/portal` → redirect na `/doctor`

### Dane

- **localStorage** klucz: `cmkw-doctor-visits-v1`
- **Serwer (dev):** `.data/doctor-visits.json` (po wywołaniach store’a serwerowego)
- Seed: 20 wizyt (`lib/doctor/seed-visits.ts`), daty względne do „dziś”

Reset wizyt w przeglądarce: DevTools → Application → Local Storage → usuń klucz.

---

## Struktura folderów

```
app/doctor/
  layout.tsx              # DoctorShell + metadata
  page.tsx                # Kalendarz
  wizyty/page.tsx         # Lista wizyt

components/doctor/
  doctor-shell.tsx
  doctor-navbar.tsx
  doctor-tabs.tsx
  doctor-sidebar.tsx
  department-switcher.tsx
  calendar-view.tsx
  visits-list.tsx
  visit-status-badge.tsx
  visit-row-actions.tsx
  patient-groups.tsx
  empty-state.tsx

lib/doctor/
  types.ts
  departments.ts
  nav.ts
  seed-visits.ts
  visits-client.ts        # localStorage (klient)
  visits-store.ts         # .data/ (serwer / API)

lib/auth/roles.ts
hooks/use-doctor-visits.ts
```

---

## Etap 2 — kolejne pliki / zadania

1. **Pacjenci CRUD** — `app/doctor/pacjenci/*`, kartoteka, PESEL, grupy, historia
2. **Formularz wizyty** — dialog Szybka wizyta / Dodaj wizytę (walidacja Zod)
3. **Karta wizyty / EDM** — wywiad, rozpoznanie, zalecenia, e-recepta placeholder
4. **Baza leków** — wyszukiwarka + mock katalog
5. **ICD-10** — wyszukiwarka kodów
6. **Kalkulatory medyczne** (BMI, eGFR, …)
7. **Telepotwierdzenia** — kolejka SMS/telefon
8. **Powiadomienia / wiadomości** w navbarze
9. **Prisma + Postgres** — migracja z localStorage / `.data`
10. **Uprawnienia granularne** — reception vs doctor vs admin
11. **API REST** — `/api/doctor/visits`, `/api/doctor/patients`
12. **Integracja z bookingiem pacjenta** — wspólny model wizyt

---

## Middleware (skrót)

- `/doctor/*` → wymaga logowania + rola staff
- pacjent na `/doctor` → `/portal`
- staff na `/portal` → `/doctor`
- zalogowany na `/login` → home wg roli
