# Modul-Split-Analyse: `frontend/js/app.js`

> **Status-Quo:** 2829 LoC, 101 Funktionen, Cohesion 0.05 (graphify).
> **Constraint:** Kein Build-Schritt. Module via `<script>`-Tag, alle Funktionen leben im globalen Namespace.
> **Konsumenten:** `forderungsaufstellung.html` (35 onclick-Handler), Service-Worker-Cache (`fordify-v199`), DOMContentLoaded-Bootstrap.

---

## 1. Sub-Cluster (semantische Gruppen)

| # | Cluster | Funktionen (Hauptvertreter) | LoC | Globale Abhängigkeiten | Cohesion (intern) |
|---|---|---|---|---|---|
| **A** | **State + Storage-Layer (Fall-Persistenz)** | `leerFall`, `neuId`, `neuGruppeId`, `ladeRegistry`, `speichereRegistry`, `aktuellenFallInRegistry`, `speichern`, `speichernMitFeedback`, `migratePositionen`, `laden`, `neueFallId`, `fallAnzeigename` | ~145 (L8-189) | `StorageBackend`, `STORAGE_KEY_*`, `state` (mutiert), DOM (`save-indicator`) | hoch |
| **B** | **Fallverwaltung (CRUD + Modal)** | `fallWechseln`, `neuenFallAnlegen`, `fallLoeschen`, `fallLoeschenBestaetigen`, `zeigeFallModal`, `fallModalSchliessen`, `aktualisiereNaechsteFallListe`, `fallZuruecksetzen`, `fallStatusSpeichern`, `fallNotizenSpeichern` | ~110 (L193-243, 357-428, 2569-2576, 2817-2829) | A (state, registry), F (Vorschau), J (Modal-Confirm), bootstrap.Modal | mittel |
| **C** | **Import / Export (JSON, CSV/Excel, Share)** | `fallExportieren`, `_csvFmla`, `fallExportierenAlsExcel`, `fallImportierenDatei`, `falTeilen`, `merkeExportZeitpunkt`, `pruefeExportReminder`, `exportReminderDismiss`, `exportBasisname` | ~190 (L66-76, 245-355, 2667-2684, 2707-2742) | `requiresPaid` (gates), Decimal, A (state), B (Registry), `AKTIONSTYPEN` | hoch (Daten-Pipeline) |
| **D** | **Navigation + Stepper** | `zeigeAnsicht`, `aktualisiereNavContext`, `egbgbHinweisToggle` | ~50 (L432-475, 2636-2639) | `state.ansicht`, DOM-Stepper, ruft E + F | klein, hoch |
| **E** | **Stammdaten-Formular** | `stammdatenSpeichern`, `stammdatenLaden`, `fgKatWechseln` | ~75 (L479-550) | A (state.fall), D (zeigeAnsicht), egbgbHinweisToggle | hoch |
| **F** | **Positionsliste + Undo** | `holeGruppen`, `neueRechnungsgruppe`, `pushUndo`, `undo`, `aktualisierUndoBtn`, `positionHinzufuegen`, `positionBearbeiten`, `positionLoeschenAnfragen`, `positionLoeschenAbbrechen`, `positionLoeschenBestaetigen`, `positionNachOben`, `positionNachUnten`, `badgeKlasse`, `renderePositionsliste`, `positionKurzbeschreibung`, `verjährungsWarnungHtml`, `ICON` Constant | ~230 (L552-836) | A (state), `AKTIONSTYPEN`, `escHtml`, J (Modal), Decimal, `formatEUR`/`formatDate`/`parseDate` | mittel-hoch |
| **G** | **Modal-Dispatcher + Datenleser** | `modalOeffnen`, `renderModalInhalt`, `modalSpeichern`, `modalDatenLesen`, `zeigeModalFehler`, `modalDynamischAktualisieren`, `modalTyp`, `modalAktuellePos`, `modalGruppeId` | ~395 (L838-1232) | F (pushUndo, renderePositionsliste), H (Templates), I (RVG/Zins), `AKTIONSTYPEN`, `STANDARDKOSTEN`, `VV_DEFINITIONEN`, `RVG_TABELLE`, `BASISZINSSAETZE`, `berechneRVGGesamt`, `berechneVerzugszinsen`, `gkgGebuehr` | mittel |
| **H** | **Modal-Templates (HTML-Strings)** | `datumFeld`, `betragFeld`, `tituliertFeld`, `tplHauptforderung`, `tplAnwalt`, `tplZinsforderungTitel`, `tplZinsperiode`, `tplZahlung`, `tplEinfacheKosten`, `tplGerichtskosten`, `tplWiederkehrend`, `tplInkassopauschale` | ~385 (L1234-1618) | `escAttr`/`escHtml`, `VV_DEFINITIONEN`, `STANDARDKOSTEN`, `AKTIONSTYPEN`, `formatEUR`, `gkgGebuehr`, F.`holeGruppen`, A.`state.fall` | hoch (rein deklarativ, viele HTML-Snippets) |
| **I** | **Vorschau / Summary-Tabelle** | `rendereVorschau`, `baueSummaryTabelle`, `renderZinsdetail`, `positionDetailBeschreibung` | ~605 (L1620-2224) | K (`ladeEinstellungen`, `generiereImpressumFooterHtml`), `BASISZINSSAETZE`, `aktuellerBasiszinssatz`, `berechneVerzugszinsen`, `tageszins`, `berechneRVGGesamt`, `AKTIONSTYPEN`, Decimal, F.`verjährungsWarnungHtml` | mittel (Kernlogik in `baueSummaryTabelle` – sehr lang, eine Funktion mit ~430 LoC) |
| **J** | **Confirm-Modal-Helper** | `fordifyConfirm` | ~30 (L382-413) | bootstrap.Modal | sehr hoch (atomar) |
| **K** | **Einstellungen (Logo + Impressum)** | `ladeEinstellungen`, `speichereEinstellungen`, `zeigeEinstellungenModal`, `leseImpFelder`, `aktualisiereFussVorschau`, `generiereImpressumFooterHtml`, `logoHochladen`, `aktualisiereLogoVorschau`, `logoLoeschen`, `einstellungenSpeichern`, `einstellungenExportieren`, `einstellungenImportieren` | ~285 (L2226-2508) | `StorageBackend`, `STORAGE_KEY_SETTINGS`, `requiresPaid`, I.`rendereVorschau` (re-render nach speichern) | hoch |
| **L** | **Print / PDF (Popup-Window)** | `getFordifyBranding`, `drucken` | ~55 (L2510-2565) | `fordifyAuth`, `escHtml`, A.`state.fall`, I.`rendereVorschau` | sehr hoch (eigene Architektur-Säule!) |
| **M** | **Theme** | `themeWechseln`, `themeLaden` | ~25 (L2641-2663) | localStorage, DOM | sehr hoch (atomar) |
| **N** | **Onboarding** | `onboardingBestaetigen` (+ Init-Hook in DOMContentLoaded) | ~15 (L2622-2634) | bootstrap.Modal, localStorage | atomar |
| **O** | **GKG-Rechner-Stub** | `gkgGebuehr` | ~10 (L2693-2701) | `GKG_TABELLE` | atomar |
| **P** | **ZV-Auftrag (§ 753 ZPO)** | `zeigeZVModal`, `_setVal`, `erstelleZVAuftragJetzt` | ~85 (L2744-2815) | `requiresPaid`, `state.fall`, `StorageBackend`, `erstelleZVAuftrag` (in `zv.js`), `trackEvent`, PDFLib (lazy) | hoch (Brücke zu `zv.js`) |
| **Q** | **Init / DOMContentLoaded-Bootstrap** | DOMContentLoaded-Listener | ~50 (L2580-2629) | reichlich: A, D, E, M, F.undo, G.modalSpeichern/modalDynamischAktualisieren, N | sehr hoch (Reihenfolge-kritisch!) |

**LoC-Summe ~ 2880** (deckt sich mit 2829 – Differenz = Kommentare/Leerzeilen).

### Beobachtungen

- **G + H (Modal-System)** ist mit 780 LoC der dickste Brocken; Templates sind reine HTML-Strings ohne State-Mutation.
- **I (`baueSummaryTabelle`)** ist eine einzige ~430-LoC-Funktion. Sie ist die "schwerste" Funktion der App, aber stark intern gekoppelt (lokale Hilfsfunktionen via Closures).
- **A (State/Storage)** ist die Wurzel: alle anderen Cluster hängen davon ab. Das `state`-Objekt wird direkt mutiert (~80 Stellen in app.js, plus `konto.js`).
- **C (Export)** und **K (Settings)** sind beide selbstständige Daten-Pipelines mit klarer Eingabe → Ausgabe.
- **L (Print)** ist eigene Architektur-Säule: Popup-Window, Inline-HTML-Generation mit String-Konkatenation, hängt nur an `rendereVorschau` (Vorschau-DOM) + Branding.
- **Q (Init)** verteilt sich auf 50 LoC und referenziert ein knappes Dutzend Funktionen aus quer durchs File. Reihenfolge-Risiko bei Split: alle Module müssen vor `app.js` geladen sein.

---

## 2. Split-Feasibility pro Cluster

| Cluster | Schwierigkeit | Aufwand (h) | Risiko |
|---|---|---|---|
| **A** State+Storage | Easy | 1.5 | Niedrig – aber alle anderen Module müssen `state` weiterhin als Global lesen können. Lösung: `state` als globale Variable belassen, nur Funktionen extrahieren. |
| **B** Fallverwaltung | Medium | 2 | Mittel – referenziert `rendereVorschau`/`stammdatenLaden`/`fallModalSchliessen`; Reihenfolge im HTML beachten. |
| **C** Import/Export | Easy | 1.5 | Niedrig – klare Datenpipeline, ein einziger paid-gate. |
| **D** Nav/Stepper | Easy | 0.5 | Niedrig – aber rufe-Kette `zeigeAnsicht → renderePositionsliste/rendereVorschau` muss erhalten bleiben. |
| **E** Stammdaten | Easy | 1 | Niedrig – schreibt nur in `state.fall`, ruft `zeigeAnsicht`. |
| **F** Positionsliste+Undo | Medium | 2.5 | Mittel – `ICON` Const + `state` + viele inline-onclick-Strings in `renderePositionsliste` referenzieren globale Functions (`positionLoeschenBestaetigen` etc.). Müssen global bleiben. |
| **G** Modal-Dispatcher | Hard | 4 | Hoch – Modal-Datenlesen verweist auf RVG/Zins-Logik, Templates, State. Modul-Lokalstate (`modalTyp`, `modalAktuellePos`, `modalGruppeId`) muss kapselbar bleiben oder als globale `let` weiterleben. |
| **H** Modal-Templates | Easy | 2 | Niedrig – rein deklarative HTML-Strings. Großer Gewinn an Lesbarkeit. |
| **I** Vorschau+Summary | Hard | 5 | Hoch – `baueSummaryTabelle` ist ein 430-LoC-Monolith mit ~10 lokalen Closures (verrechneAufEntry, claimRow, payAllocRow, …). Eine "Verschiebung" ist trivial, eine **Aufteilung** der Funktion in sich selbst kostet richtig Zeit. |
| **J** Confirm-Modal | Easy | 0.25 | Sehr niedrig – atomar. |
| **K** Einstellungen | Easy | 1.5 | Niedrig – self-contained, einziger Outbound-Call: `rendereVorschau` nach Speichern. |
| **L** Print | Easy | 0.75 | Niedrig – ruft `rendereVorschau`, `getFordifyBranding`, `escHtml`. Self-contained Popup-Pipeline. **Spezielles Risiko:** Hardcodierte Bootstrap- und app.css-Pfade im HTML-String – bei Split-Refactoring müssen sie korrekt bleiben. |
| **M** Theme | Easy | 0.25 | Sehr niedrig – atomar, kann sofort raus. |
| **N** Onboarding | Easy | 0.25 | Sehr niedrig – atomar; aber DOMContentLoaded-Hook hängt drin. |
| **O** GKG-Rechner | Easy | 0.25 | Sehr niedrig – pure Funktion, gehört eigentlich nach `data.js` oder neue `gkg.js` (Konsistenz mit `zinsen.js`, `rvg.js`). |
| **P** ZV-Bridge | Medium | 1 | Mittel – braucht Lazy-Load-Logik; aber bereits halb-extrahiert (`zv.js` existiert). |
| **Q** Init | Hard | – | Sehr hoch – wenn `app.js` aufgesplittet wird, muss Init zuletzt ausgeführt werden und Zugriff auf alle Module haben. Erfordert eigene Datei `init.js` ganz am Ende der Script-Reihenfolge. |

---

## 3. Drei Split-Optionen

### Option 1 – Minimal (1 Modul rauslösen)

**Ziel:** Quick-Win, niedrigstes Risiko, sofortiger Gewinn an Lesbarkeit.

**Extrahieren:** `frontend/js/summary.js` mit `baueSummaryTabelle`, `renderZinsdetail`, `positionDetailBeschreibung` (Cluster **I** ohne `rendereVorschau` – das bleibt in app.js und ruft `baueSummaryTabelle` global).

**Optional gleich mit:** `frontend/js/print.js` (Cluster **L**) und `frontend/js/theme.js` (Cluster **M**) – beide atomar, in einer Sitzung erledigt.

| | |
|---|---|
| **Aufwand** | 2.5 h (nur Summary) bzw. 3.5 h inkl. Print + Theme |
| **Gewinn** | – `app.js` ~2200 LoC (–600); der "fettste" Cluster ist raus<br>– `baueSummaryTabelle` separat reviewbar und (in Zukunft) testbar<br>– SW-Cache: kleine Edits an Summary-Logik invalidieren nicht den großen Rest von app.js |
| **Kosten** | – Triviales Risiko: keine Reihenfolgeänderung in HTML<br>– Theme: muss vor `app.js` geladen werden (sonst läuft `themeLaden()` im DOMContentLoaded-Hook ins Leere). Wenn `theme.js` vor `app.js` kommt – kein Problem. |
| **Reihenfolge im HTML** | `…data.js → zinsen.js → rvg.js → verrechnung.js → summary.js → app.js → print.js → zv.js` |
| **Risiken** | sehr gering – `baueSummaryTabelle` ist eine pure Funktion (input: fall, basiszinssaetze, aufschlagPP). Alle Closures bleiben drin. |

---

### Option 2 – Moderat (3–4 Module rauslösen)

**Ziel:** Klare Architektur-Layers, deutliche Reduktion von `app.js` ohne Bruchstellen.

**Extrahieren:**

1. **`summary.js`** ← Cluster I (Vorschau-Rendering + Summary-Tabelle) – ~605 LoC
2. **`modal-templates.js`** ← Cluster H (alle `tpl*`-Funktionen + `datumFeld`/`betragFeld`/`tituliertFeld`) – ~385 LoC
3. **`einstellungen.js`** ← Cluster K (Logo + Impressum + Footer-HTML-Generierung) – ~285 LoC
4. **`print.js`** ← Cluster L + `getFordifyBranding` – ~55 LoC
5. *(bonus)* **`theme.js`** + **`gkg.js`** + **`fordify-confirm.js`** – atomare Mini-Module ~60 LoC

| | |
|---|---|
| **Aufwand** | 8–10 h |
| **Gewinn** | – `app.js` schrumpft auf ~1300 LoC (Kern: State + Navigation + Positionen + Modal-Dispatcher + Init)<br>– Templates sind die *Designer-freundliche* Datei (man arbeitet dort an Markup, nicht an Logik)<br>– Settings = eigene Datei mit klarem `lade/speichere/exportiere/importiere`-API<br>– Print = isolierte Säule, die man parallel überarbeiten kann (z.B. wenn man irgendwann auf jsPDF wechselt) |
| **Kosten** | – Reihenfolge-Sorgfalt im HTML<br>– `modalDynamischAktualisieren` ruft `gkgGebuehr` (jetzt in `gkg.js`); muss vor `app.js` geladen sein<br>– `einstellungen.js` ruft `rendereVorschau` (in `summary.js`); zirkulär? Nein – Aufruf erst zur Laufzeit. Aber `summary.js` muss vor `einstellungen.js` geladen sein (oder Reihenfolge: einstellungen kann später, weil sie nur per Modal-Speichern aufgerufen wird). |
| **Reihenfolge im HTML** | `utils.js → config.js → storage.js → auth-ui.js → contacts.js → auth.js → gates.js → decimal → bootstrap → data.js → zinsen.js → rvg.js → verrechnung.js → **gkg.js** → **modal-templates.js** → **summary.js** → **print.js** → **theme.js** → **einstellungen.js** → **fordify-confirm.js** → app.js → zv.js` |
| **Risiken** | – Mittel: Code-Move ist mechanisch, aber 4 Files = 4 Stellen mit potenziellen Tippfehlern beim Schneiden<br>– Service-Worker-Cache (`fordify-v200+`) muss alle neuen JS-Pfade enthalten (sonst Offline-PWA bricht!) |

---

### Option 3 – Aggressiv (komplette Modularisierung)

**Ziel:** `app.js` wird zur reinen Glue-Datei (Init + State).

**Zielstruktur:**

```
frontend/js/
├── utils.js                (vorhanden)
├── storage.js              (vorhanden)
├── data.js / zinsen.js / rvg.js / verrechnung.js / gates.js  (vorhanden)
├── state.js                ← Cluster A: state-Objekt + leerFall + neuId + Registry-CRUD + laden/speichern
├── faelle.js               ← Cluster B: fallWechseln/Anlegen/Löschen + Modal
├── faelle-io.js            ← Cluster C: Export/Import/Share + ExportReminder
├── nav.js                  ← Cluster D + E: zeigeAnsicht + Stammdaten
├── positionen.js           ← Cluster F: Liste + Undo + Reordering + Löschen
├── modal-dispatcher.js     ← Cluster G: modalOeffnen + modalSpeichern + modalDatenLesen + modalDynamisch
├── modal-templates.js      ← Cluster H
├── summary.js              ← Cluster I
├── einstellungen.js        ← Cluster K
├── print.js                ← Cluster L
├── theme.js                ← Cluster M
├── onboarding.js           ← Cluster N
├── gkg.js                  ← Cluster O
├── zv-ui.js                ← Cluster P (Bridge nach zv.js)
├── fordify-confirm.js      ← Cluster J
└── init.js                 ← Cluster Q: DOMContentLoaded-Bootstrap (ganz am Ende)
```

`app.js` verschwindet komplett (oder wird zum 50-LoC Glue-File mit Konstanten + Init-Imports).

| | |
|---|---|
| **Aufwand** | 20–25 h (inklusive Tests in mehreren Browsern, SW-Bump, Druck-Test, Konto-Sync-Test) |
| **Gewinn** | – Jede Datei <400 LoC, maximale Lesbarkeit<br>– Klare Architektur-Layers, sauberes Onboarding für neue Mitwirkende<br>– Bessere SW-Cache-Granularität: kleine Änderung an `theme.js` invalidiert nur `theme.js`, nicht den Modal-Code<br>– Vorbereitung für eventuelle ES-Modules-Migration (aber kein Build = bleibt Script-Tag) |
| **Kosten** | – Hoher Aufwand für viel mechanisches Code-Schieben<br>– Init-Reihenfolge wird zerbrechlicher: 18 Script-Tags im HTML, Reihenfolge ist kritisch<br>– `state`-Mutation durch viele Module = klassisches Spaghetti-Risiko, wenn nicht diszipliniert<br>– Risiko, dass cleverer Inline-Code in `renderePositionsliste` (HTML-Strings mit `onclick="positionLoeschenBestaetigen(...)"`) durch Suchen-Ersetzen falsch übertragen wird |
| **Reihenfolge im HTML** | siehe Liste oben, **`init.js` zwingend zuletzt** (nach allem, was es im DOMContentLoaded ansprechen will, plus nach `zv.js`). |
| **Risiken** | – Hoch: vielzählige Reihenfolge-Stolperfallen<br>– SW-Cache muss alle 18 Pfade kennen<br>– Konto.html lädt einige der gleichen Module (`storage.js`, `auth.js`) – muss synchron gehalten werden<br>– Drei Init-Hooks (Theme im Head, Auth via auth.js, App via init.js) müssen sauber sequenziert werden |

---

## 4. Konkrete Empfehlung

**→ Option 2 (moderat), in 3 Etappen, über 2–3 Sprints verteilt.**

Begründung:

1. **Option 1 löst die "ein-Modul-zu-groß"-Symptomatik nicht** – `app.js` bleibt mit ~2200 LoC immer noch deutlich über jedem anderen Modul. Der Gain ist zu klein für den Konventionsbruch.
2. **Option 3 ist überdimensioniert für den aktuellen Reifegrad.** Fordify hat *kein* Test-Setup, kein Build, keine Linter-Hooks – ein 25-h-Refactoring ohne Sicherheitsnetz ist ein Risiko pro 100 LoC. Verzicht auf Aggressiv-Modularisierung bis es Tests gibt.
3. **Option 2 trifft den 80/20-Punkt:** Die 4 großen Cluster (Summary 605 LoC, Modal-Templates 385 LoC, Einstellungen 285 LoC, Print 55 LoC) raus zu nehmen reduziert `app.js` um ~1330 LoC = etwa –47 %. Ergebnis: ~1300 LoC Kerndatei, jeder Sub-Cluster ≤ 600 LoC.
4. **Print bleibt eigene Säule** wie in der Aufgabe gefordert – `print.js` ist trivial zu extrahieren und macht die Architektur lesbarer.

### Reihenfolge der Etappen

#### Etappe 1 – Atomare Mini-Module (1 Sitzung, ~1.5 h, sehr geringes Risiko)

1. `frontend/js/theme.js` ← `themeWechseln`, `themeLaden`, `STORAGE_KEY_THEME`
2. `frontend/js/gkg.js` ← `gkgGebuehr` (nutzt `GKG_TABELLE` aus `data.js`)
3. `frontend/js/fordify-confirm.js` ← `fordifyConfirm`
4. SW-Cache-Bump (`fordify-v200`), neue Pfade in `sw.js` ergänzen.

→ Sofortgewinn: drei "verirrte" kleine Helfer sind raus, Konventions-Konsistenz mit `zinsen.js`/`rvg.js` erhöht.

#### Etappe 2 – Print + Settings (1 Sitzung, ~2.5 h, geringes Risiko)

5. `frontend/js/print.js` ← `getFordifyBranding`, `drucken`. Manueller Druck-Test im Popup-Window. SW-Bump.
6. `frontend/js/einstellungen.js` ← komplettes Cluster K. Manueller Test: Logo hoch-/runterladen, Impressum füllen, Vorschau prüfen, Export/Import-Round-Trip.

→ Gewinn: 340 LoC raus. Print ist als eigene Säule explizit sichtbar.

#### Etappe 3 – Templates + Summary (1–2 Sitzungen, ~5 h, mittleres Risiko)

7. `frontend/js/modal-templates.js` ← Cluster H. Achtung auf `holeGruppen()`-Call in `tplZinsperiode` (bleibt global in app.js).
8. `frontend/js/summary.js` ← Cluster I. Reines Verschieben, keine Refactoring an `baueSummaryTabelle` selbst.
9. Vollständiger End-to-End-Test: neuer Fall, alle Positionstypen anlegen (HF, Anwaltsvergütung, Zinsperiode, Zahlung mit Tilgungsbestimmung), Vorschau, Druck, Export, Reload.

→ Gewinn: ~990 LoC raus. `app.js` jetzt ~1300 LoC.

### Was NICHT angegangen werden sollte (für jetzt)

- **Cluster G (Modal-Dispatcher)** bleibt in `app.js`. Es ist der gravitative Mittelpunkt der Eingabe-UX; sein Schnitt mit den Templates ist nicht ganz sauber (Datenleser referenziert RVG/Zins-Logik direkt). Erst nach Etappen 1–3 betrachten, ggf. mit Tests.
- **Cluster A (State/Storage)** bleibt – `state` ist *die* globale Variable und ein "leise-Refactoring" könnte überraschende Bugs nach sich ziehen, da `konto.js` ggf. auf `state` zugreift (verifizieren!).
- **`baueSummaryTabelle` selbst** *nicht* in mehrere Funktionen zerlegen. Die Closures (`calcZinsen`, `verrechneAufEntry`, `claimRow`, `payAllocRow`, `zinsenNeuRow`, `renderPayAllocs`, `kostenBrutto`, `amtCell`, `datumCell`, `datumRangeCell`) sind essentiell Lesbarkeits-Helfer. Eine Aufteilung dieser einen Funktion ist ein eigenes Projekt mit eigenem Risiko.

### Pflicht-Checks pro Etappe

- [ ] SW-Cache-Version bumpen (`fordify-vN` in `frontend/sw.js` + Staging-Variante).
- [ ] Neue JS-Pfade in `sw.js` *cache-Liste* eintragen, sonst Offline-PWA bricht.
- [ ] HTML-Reihenfolge der Script-Tags prüfen (utility-Module *vor* Konsumenten).
- [ ] Manueller Smoke-Test: Stammdaten → Position anlegen → Vorschau → Druck → Export → Reload.
- [ ] `docs/SYSTEM.md` aktualisieren (neue Datei-Liste).
- [ ] `CLAUDE.md` Dateistruktur aktualisieren.

---

## 5. Anhang: Abhängigkeitsgraph (vereinfacht)

```
A (State)
  ↑ wird gelesen/mutiert von: B, C, E, F, G, I, K, L, P
  
B (Fallverw.) ──→ A, F, J, D, E
C (Import/Exp.) ─→ A, gates, decimal
D (Nav) ──────→ A, F, I
E (Stammdaten) ─→ A, D
F (Positionen) ─→ A, G, J, AKTIONSTYPEN
G (Modal) ────→ A, F, H, I (RVG/Zins/GKG-Calls)
H (Templates) ─→ A.state, escAttr, VV_DEFINITIONEN, STANDARDKOSTEN, gkgGebuehr, F.holeGruppen
I (Vorschau) ──→ A, K (ladeEinst.), zinsen, rvg, verrechnung, F.verjährungsWarnung
J (Confirm) ───→ bootstrap (atomar)
K (Einst.) ───→ Storage, I (rendereVorschau)
L (Print) ───→ I (rendereVorschau), fordifyAuth, A
M (Theme) ───→ DOM, localStorage (atomar)
N (Onboard.) ─→ bootstrap, localStorage (atomar)
O (GKG) ─────→ GKG_TABELLE (atomar, pure)
P (ZV) ──────→ A, Storage, zv.js (extern), gates
Q (Init) ────→ alles
```

**Kritische Pfade nach Split:**

- `print.js` → muss `rendereVorschau` (in `summary.js`) global verfügbar haben.
- `einstellungen.js` → muss `rendereVorschau` aufrufen können.
- `init.js` (im aggressiven Szenario) muss alle Module nach DOM-Ready koordinieren.
- Inline-`onclick`-Strings in `renderePositionsliste`, `zeigeFallModal` etc. erwarten globale Funktionsnamen → alle ausgelagerten Funktionen müssen weiterhin im globalen `window`-Scope leben (Standard bei Script-Tags ohne `type="module"`).
