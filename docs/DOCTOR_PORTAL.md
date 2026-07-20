# Portal Lekarza / CMKW EDM

**Status:** Etap 0–2 + **Etap 3 (Leki + ICD-10 + Kalkulatory)**  
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

**Demo:** `jan.kiryluk@cmkw.pl` / `Lekarz123!`

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

## Etap 4 — propozycje

1. **Karta wizyty EDM** — wywiad, rozpoznanie (ICD), leki, zalecenia, e-recepta placeholder  
2. **Telepotwierdzenia** + IVR  
3. **Dokumenty** w karcie pacjenta  
4. **Przypisywanie leków/ICD do wizyty/pacjenta** (historia farmakoterapii)  
5. **Prisma + Postgres**  
6. **API** doctor REST  
7. Integracja booking pacjenta ↔ EDM  

---

## Konta demo

| E-mail | Hasło | Rola |
|--------|-------|------|
| `jan.kiryluk@cmkw.pl` | `Lekarz123!` | doctor |
| `tomas.wenta@cmkw.pl` | `Lekarz123!` | doctor |
| `recepcja@cmkw.pl` | `Recep123!` | reception |
| `admin@cmkw.pl` | `Admin123!` | admin |
