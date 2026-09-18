# Belka podsuwnicowa — Arkusz wymiarowania v3.0

## 🚀 Aplikacja online

**[Otwórz kalkulator →](https://luki-engee.github.io/belka-podsuwnicowa/)**

---

Aplikacja do wstępnego wymiarowania belek podsuwnicowych natorowych
wg **PN-EN 1991-3**, **PN-EN 1993-6** i **EC3-1-1 §6.3.2** (zwichrzenie).

## Funkcje

- Profile walcowane: HEA, HEB, IPE, IPN (po 13–15 rozmiarów od h=200 mm)
- Przekrój spawany z dowolnymi wymiarami
- Współczynniki dynamiczne φ₁–φ₅ wg klasy podnoszenia HC1–HC4
- Siły przekrojowe z formuły obwiedni 2 kół (pozycja ekstremalna)
- Automatyczny ciężar własny belki z pola przekroju (A·ρ·g)
- Sprawdzenia SGN: pasy, ścinanie, V-M interakcja §6.2.8, docisk koła EC3-1-5
- Zwichrzenie LTB §6.3.2.2 z Mcr, λ̄_LT, χ_LT, krzywymi a/b/c/d
- Zewnętrzna siła pozioma (skupiona / UDL / moment bezpośrednio)
- Ugięcie pionowe (SLS)
- **Generowanie raportu PDF** — podgląd + druk z przeglądarki

## Uruchomienie

### Wymagania
- Node.js ≥ 18
- npm ≥ 9

### Kroki

```bash
# 1. Wejdź do folderu projektu
cd belka-podsuwnicowa

# 2. Zainstaluj zależności
npm install

# 3. Uruchom serwer developerski
npm run dev
```

Aplikacja otworzy się na **http://localhost:5173**

### Build produkcyjny

```bash
npm run build
npm run preview
```

## Struktura projektu

```
belka-podsuwnicowa/
├── src/
│   ├── App.jsx        # Główny komponent — cała logika i UI
│   ├── main.jsx       # Punkt wejścia React
│   └── index.css      # Tailwind CSS
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Dalszy rozwój w Claude Code

Po otwarciu projektu w Claude Code możesz np.:

```
> dodaj eksport do Excela z wynikami obliczeń
> dodaj kolejne rodziny profili: HEM, IPO, dwuteowniki spawane typowe
> dodaj belkę wieloprzęsłową i ciągłą
> dodaj sprawdzenie zmęczenia wg EC3-1-9
> dodaj porównanie kilku wariantów przekroju obok siebie
```

## Uwagi normowe

- My obliczane z formuły obwiedni (pozycja ekstremalna 2 kół suwnicy)
- Iw z tablicy dla profili walcowanych
- Mz sprawdzane przez pełny Wz przekroju
- Nie sprawdzono: zmęczenia, nośności szyny, EC3-1-5 §7.2 (interakcja FRd+MEd)
- Wyniki wymagają weryfikacji przez uprawnionego projektanta

---
*Wygenerowano przy użyciu Claude (Anthropic)*
