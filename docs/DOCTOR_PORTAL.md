# Portal Lekarza / CMKW EDM

**Status:** Etap 0–9 + **Etap 10 (Przewodnik / Product Tour)**  
**Prefix:** `/doctor/*`  
**Role:** `facility` | `doctor` | `admin` | `reception`  
**Styl:** jasny brand CMKW (`#0849b0`, white / slate-50) — spójny z patient portalem

---

## Uruchomienie

```bash
cd C:\Users\user\akwen-web\cmkw-patient-portal
npm install
npm run dev
```

- EDM: http://localhost:3000/doctor  
- Pacjenci: http://localhost:3000/doctor/pacjenci  

**Demo placówka:** `cmkw@cmkw.pl` / `cmkw123` (facility — pełny widok)  
**Demo admin:** `jan.kiryluk@cmkw.pl` / `jankiryluk123`  
**Demo lekarz + udost.:** `tomas.wenta@cmkw.pl` / `tomaswenta123` (widzi też Kiryluka)  
**Logowanie EDM:** `/doctor/login` · **Pacjent:** `/login`

---

## Testowanie krok po kroku (Etap 2)

1. Zaloguj się kontem lekarza (powyżej).
2. Upewnij się, że navbar jest **jasny** (biały), nie navy MyDr.
3. Zakładka **Pacjenci** → lista z 20 seedami (po pierwszym załadowaniu localStorage).
4. Wyszukaj po nazwisku `Kowalska` → wynik Anna Kowalska.
5. Filtry zaawansowane: status / grupa / miasto.
6. Sortuj po kolumnie (Nazwisko, Data ur., Ostatnia wizyta, Status).
7. Klik nazwisko → **karta pacjenta** (`/doctor/pacjenci/p-001`):
   - Historia wizyt, dane, notatki, grupy/RODO
   - Prawa kolumna: podsumowanie
8. **Edytuj** → zmień telefon → Zapisz → weryfikacja na karcie.
9. **Dodaj pacjenta** (`/doctor/pacjenci/nowy`):
   - PESEL poprawny (suma kontrolna) → auto data ur. + płeć
   - Duplikat PESEL → błąd
10. Z **Kalendarza**: SZYBKA WIZYTA → wybór pacjenta → wizyta pojawia się w tabeli dnia.
11. Z **Wizyty** / kalendarza: klik nazwiska pacjenta → karta.
12. PESEL na listach i karcie zawsze maskowany (`******`); pełny tylko w edycji.

### Reset danych

DevTools → Application → Local Storage:

- `cmkw-doctor-patients-v1`
- `cmkw-doctor-visits-v2`

Usuń klucze i odśwież → seed od nowa.

---

## Routing

| Ścieżka | Opis |
|---------|------|
| `/doctor` | Kalendarz |
| `/doctor/wizyty` | Lista wizyt |
| `/doctor/pacjenci` | Lista pacjentów |
| `/doctor/pacjenci/nowy` | Dodawanie |
| `/doctor/pacjenci/[id]` | Karta |
| `/doctor/pacjenci/[id]/edytuj` | Edycja |
| `/doctor/leki` | Baza leków (Etap 3) |
| `/doctor/icd10` | ICD-10 (Etap 3) |
| `/doctor/kalkulatory` | Kalkulatory medyczne (Etap 3) |
| `/doctor/wizyty/[id]` | **Karta wizyty EDM** (Etap 4) |
| `/doctor/terminy` | Wyszukiwarka wolnych terminów (Etap 5A) |
| `/doctor/admin` | Administracja placówki (Etap 5A) |
| `/doctor/admin/grafiki` | Grafiki pracy lekarzy (Etap 6B) |

### Etap 10 — Przewodnik (spotlight tour)

1. Menu EDM → **Przewodnik** (`/doctor/przewodnik`)
2. Pacjent: `/portal/przewodnik` lub przycisk na dashboardzie
3. Ścieżki: Pacjent / Lekarz / Placówka / Pełny (facility)
4. Spotlight: przyciemnienie + highlight + licznik **PRZEWODNIK n / m**
5. Sterowanie: Następny / Poprzedni / Esc / strzałki

**Komponenty:** `components/tour/*`, `lib/tour/*` · atrybuty `data-tour="..."`

### Etap 9 — rola Placówka + izolacja lekarzy

1. Login `cmkw@cmkw.pl` / `cmkw123` → badge **Widok placówki**, przełącznik lekarzy + awatary (prawo)
2. Login `jan.kiryluk@cmkw.pl` → **zero** innych lekarzy w UI (admin z doctorId = izolacja kliniczna)
3. Login `tomas.wenta@cmkw.pl` → domyślnie tylko swój kalendarz; select fioletowy „Udostępnione: Kiryluk” (podgląd)
4. Admin → **tylko facility** (`cmkw@cmkw.pl`) — Udostępnianie kalendarzy, seed Wenta→Kiryluk
5. Lekarz (Kiryluk/Wenta) nie widzi zakładki Administracja; `/doctor/admin` → redirect + toast

**localStorage:** `cmkw-doctor-calendar-access-v1`, `cmkw-doctor-view-as-v1`, `cmkw-doctor-shared-preview-v1`  
**Seed użytkowników:** `DEMO_SEED_VERSION = 8` (facility user)

### Etap 8 — Drag & Drop + UX kalendarza

1. Login `jan.kiryluk@cmkw.pl` / `jankiryluk123` → `/doctor`
2. Widok **Dzień** lub **Tydzień** — przeciągnij wizytę na inny slot (ghost + highlight zielony/czerwony)
3. Drop na wolny slot w grafiku → dialog potwierdzenia → toast + zapis w store
4. Drop poza grafik / na zajęty / urlop → toast błędu, brak przeniesienia
5. Zakończona / odwołana — nie da się przeciągnąć
6. **PPM** na wizycie → Edytuj, status, Duplikuj, Anuluj, Otwórz kartę
7. **2× klik** → karta wizyty; hover → tooltip (PESEL maskowany)
8. Skróty: `N` szybka wizyta · `F` szukaj · `T` dziś · `←`/`→` · `1/2/3` widoki · `?` cheatsheet · `Esc` zamyka
9. Kafelki dashboardu filtrują kalendarz (dziś / do potwierdzenia / w trakcie)
10. Preferencje widoku i filtra lekarza w localStorage

**Zależności:** `@dnd-kit/core`, `@dnd-kit/utilities`  
**Komponenty:** `components/doctor/calendar/*`, `hooks/use-calendar-keyboard.ts`  
**localStorage:** `cmkw-doctor-cal-mode-v1`, `cmkw-doctor-cal-doctor-v1` (+ visits store)

### Etap 6B — grafiki + kalendarz

1. Admin → **Grafiki pracy** (lub `/doctor/admin/grafiki`)
2. Wybierz Kiryluk / Białystok — Pn, Śr, Pt 9–14 (krótki grafik)
3. Dodaj wyjątek urlop → podgląd 5 tyg. pokazuje amber
4. Kalendarz: przełącznik **Dzień | Tydzień | Miesiąc**, filtr lekarza, legenda dostępności
5. `/doctor/terminy` — sloty tylko z grafiku minus zajęte wizyty
6. Szybka wizyta w niedzielę / poza godzinami → toast błędu walidacji

**localStorage:** `cmkw-doctor-schedules-v1` · **JSON:** `data/schedules.json`

### Etap 5A — oddziały / terminy / admin

1. Topbar → przełącznik **Białystok / Hajnówka / Wszystkie** — filtruje kalendarz, wizyty, pacjentów
2. `/doctor/terminy` — filtry, lista lekarzy ze slotami, **Zarezerwuj** → karta wizyty
3. Dr Kiryluk ma najmniej slotów (availabilityFactor 0.22)
4. `/doctor/admin` — statystyki, dane placówki, ustawienia (switch), pracownicy, gabinety, typy wizyt
5. Nowa wizyta dziedziczy wybrany oddział (`branchId`)

**localStorage:** `cmkw-doctor-branch-v1`, `cmkw-doctor-visits-v4`, staff/settings/rooms/facility keys  
**JSON seed:** `data/departments.json`, `settings.json`, `facility.json`, `staff.json`, `rooms.json`

### Etap 4 — test flow wizyty

1. Login `jan.kiryluk@cmkw.pl` / `Lekarz123!`
2. Kalendarz → klik godzinę wizyty (np. 08:00) → karta `/doctor/wizyty/v-001`
3. Zakładki: wywiad, ICD (picker), leki (picker), skierowania, dokumenty, historia
4. Autosave notatki · Zapisz / W trakcie / Zakończ / Potwierdź / Anuluj
5. Kalendarz dół → **Telepotwierdzenia** → Potwierdź / SMS / Odwołaj
6. Szybka wizyta → „Zapisz i otwórz kartę”
7. Karta pacjenta → Dokumenty (upload mock)

**localStorage:** `cmkw-doctor-visits-v3`, `cmkw-doctor-documents-v1`

### Etap 3 — test

1. Menu: **Leki | ICD-10 | Kalkulatory**
2. `/doctor/leki` — szukaj „ketoprofen” / „Ketonal” → panel szczegółów
3. `/doctor/icd10` — filtr rozdział M, kod M17.1, **Kopiuj**, powiązane leki
4. `/doctor/kalkulatory` — BMI, eGFR, BASDAI, HOMA, CHA₂DS₂-VASc…
5. Karta pacjenta → „Dodaj lek” / „Dodaj kod ICD”
6. Menu wizyty → akcje → Dodaj lek / ICD

**Seed:** 42 leki (`data/drugs.json`), 151 kodów ICD (`data/icd10.json`), 15 kalkulatorów.  
**localStorage:** `cmkw-doctor-drugs-v1`, `cmkw-doctor-icd10-v1`

---

## Struktura (Etap 2–3)

```
app/doctor/pacjenci/
  page.tsx
  nowy/page.tsx
  [id]/page.tsx
  [id]/edytuj/page.tsx

components/doctor/
  doctor-data-provider.tsx   # wspólny state patients+visits
  patients-list.tsx
  patient-form.tsx
  patient-card.tsx
  patient-edit-client.tsx
  patient-name-link.tsx
  quick-visit-dialog.tsx
  … (shell light CMKW)

lib/doctor/
  seed-patients.ts           # 20 pacjentów, poprawne PESEL
  seed-visits.ts             # patientId powiązany
  patients-client.ts / patients-store.ts
  visits-client.ts (v2)

lib/validations/patient.ts
lib/pesel.ts                 # buildPesel, parsePesel, isValidPesel
```

---

## Konta demo (Etap 9)

### Placówka (`/doctor/login`)

| E-mail | Hasło | Rola |
|--------|-------|------|
| `cmkw@cmkw.pl` | `cmkw123` | facility |

### Lekarze — hasło: `imienazwisko123`

| E-mail | Hasło | Rola | Uwagi |
|--------|-------|------|--------|
| `jan.kiryluk@cmkw.pl` | `jankiryluk123` | admin | pełny widok |
| `tomas.wenta@cmkw.pl` | `tomaswenta123` | doctor | + podgląd Kiryluka |
| `pawel.frankowski@cmkw.pl` | `pawelfrankowski123` | doctor | tylko własne |
| `andrzej.zawadzki@cmkw.pl` | `andrzejzawadzki123` | doctor | |
| `grzegorz.torba@cmkw.pl` | `grzegorztorba123` | doctor | |
| `saddam.sammoudi@cmkw.pl` | `saddamsammoudi123` | doctor | |
| `recepcja@cmkw.pl` | `recepcja123` | reception | pełny widok operacyjny |

### Pacjenci (`/login`)

| E-mail | Hasło |
|--------|-------|
| `jan.kowalski@email.pl` | `jankowalski123` |
| `tomasz.nowak@email.pl` | `tomasznowak123` |
| `anna.nowicka@email.pl` | `annanowicka123` |

---

## Etap 10 — propozycje

1. **E-recepta / e-skierowanie** (P1) + szablony dokumentów  
2. **Historia farmakoterapii** na karcie pacjenta  
3. **Prisma + Postgres** + API REST (zamiast localStorage)  
4. Realne SMS/IVR telepotwierdzeń  
5. Integracja booking pacjenta ↔ EDM  
6. RBAC + audit log (serwerowy)  
7. Kolumny wielu lekarzy w tygodniu (resource view)  
8. Recurring visits / serie wizyt  

---


