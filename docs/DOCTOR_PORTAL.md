# Portal Lekarza / CMKW EDM

**Status:** Etap 0–5A + **Etap 6B (Grafiki pracy + kalendarz D/T/M)**  
**Prefix:** `/doctor/*`  
**Role:** `doctor` | `admin` | `reception`  
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

**Demo lekarz:** `jan.kiryluk@cmkw.pl` / `jankiryluk123` (admin)  
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

## Etap 7 — propozycje

1. **E-recepta / e-skierowanie** (P1)  
2. **Drag & drop** wizyt w kalendarzu tygodniowym  
3. **Historia farmakoterapii**  
4. **Prisma + Postgres** + API REST  
5. Realne SMS/IVR  
6. Integracja booking pacjenta ↔ EDM  
7. RBAC + audit log  

---

## Konta demo (Etap 7)

### Lekarze (`/doctor/login`) — hasło: `imienazwisko123`

| E-mail | Hasło | Rola |
|--------|-------|------|
| `jan.kiryluk@cmkw.pl` | `jankiryluk123` | admin |
| `tomasz.wenta@cmkw.pl` | `tomaszwenta123` | doctor |
| `pawel.frankowski@cmkw.pl` | `pawelfrankowski123` | doctor |
| `andrzej.zawadzki@cmkw.pl` | `andrzejzawadzki123` | doctor |
| `grzegorz.torba@cmkw.pl` | `grzegorztorba123` | doctor |
| `saddam.sammoudi@cmkw.pl` | `saddamsammoudi123` | doctor |
| `recepcja@cmkw.pl` | `recepcja123` | reception |

### Pacjenci (`/login`)

| E-mail | Hasło |
|--------|-------|
| `jan.kowalski@email.pl` | `jankowalski123` |
| `tomasz.nowak@email.pl` | `tomasznowak123` |
| `anna.nowicka@email.pl` | `annanowicka123` |
