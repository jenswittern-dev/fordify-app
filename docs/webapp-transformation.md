# Analyse: Transformation zu einer WebApp
**Stand: April 2026**

---

## Ausgangslage

debitum ist aktuell eine pure HTML/CSS/JS Single-Page-App, die lokal über das `file://`-Protokoll läuft. Alle Daten liegen im `localStorage` des Browsers. Es gibt keinen Server, keine Datenbank, keine Nutzerkonten.

**Das zentrale Problem:** Versionskontrolle. Nutzer arbeiten mit der Version, die sie einmal heruntergeladen haben — Updates erreichen sie nicht automatisch.

**Lösung:** Hosting auf einer Subdomain (z. B. `tool.kanzlei.de` oder `app.produkt.de`).

---

## Was sich sofort verbessert

- Alle Nutzer haben immer automatisch die neueste Version
- HTTPS statt `file://` → stabilere Browser-API-Unterstützung
- Bookmarkbar, verlinkbar, teilbar
- PWA (Progressive Web App) möglich: installierbar auf Desktop und Mobilgerät, Offline-Modus via Service Worker
- Keine Installation, kein Dateidownload, kein IT-Aufwand für Nutzer

## Was sich *nicht* ändert (bei reinem Static Hosting)

- Die gesamte Berechnungslogik bleibt clientseitig — kein Backend nötig
- `localStorage` funktioniert weiterhin, jetzt domain-scoped
- Kein Mandantendatum verlässt den Browser — das DSGVO-Versprechen bleibt vollständig intakt

## Was dadurch sichtbar wird

Das `localStorage`-Problem tritt stärker in den Vordergrund: Nutzer, die das Tool als „echte WebApp" wahrnehmen, erwarten, dass ihre Daten geräte- und browserübergreifend verfügbar sind. Der JSON-Export/Import als Workaround muss klar kommuniziert werden.

---

## Rechtliche Anforderungen

| Pflicht | Beschreibung | Trigger |
|---|---|---|
| **Impressum** (§ 5 TMG) | Pflicht ab öffentlich erreichbarer Website mit Geschäftszweck | Sofort bei Go-Live |
| **Datenschutzerklärung** (DSGVO Art. 13) | Auch bei reiner Static-App: Server-Logs (IP, Zeitstempel) sind personenbezogene Daten | Sofort bei Go-Live |
| **Cookie-Banner** | Nur nötig wenn Tracking/Analytics eingesetzt wird; bei reiner Static-App ohne Tracking entfällt er | Optional |
| **Haftungsausschluss** | Rechtlich relevante Berechnungen → Disclaimer empfohlen | Sofort bei Go-Live |
| **RDG-Frage** | Das Tool trifft keine rechtliche Beratung, sondern rechnet — vermutlich keine Rechtsdienstleistung i.S.d. RDG, aber prüfenswert | Vor Go-Live |

---

## Datenschutz & Hosting-Empfehlungen

- **EU-Hosting zwingend empfohlen** für die Zielgruppe (Anwälte, § 43a BRAO, DSGVO) — deutsche Anbieter: Hetzner, IONOS, Strato
- **Server-Logs minimieren** oder IP-Adressen sofort anonymisieren
- **Kein Tracking, keine Drittanbieter-Cookies** → kein Cookie-Banner nötig, stärkt das Datenschutzversprechen
- Bei Einsatz von Analytics: Matomo self-hosted bevorzugen (kein Drittland-Transfer)

---

## Die strategische Weggabelung: Nutzer-Accounts

Dies ist die wichtigste Architekturentscheidung:

### Option A: Reines Static Hosting (empfohlen für Stufe 1)

| Aspekt | Details |
|---|---|
| Backend | Keines erforderlich |
| Hosting | GitHub Pages, Netlify, Vercel, Hetzner Webspace |
| Kosten | ~0–5 €/Monat |
| DSGVO-Aufwand | Minimal (nur Server-Logs) |
| localStorage-Problem | Bleibt — JSON-Export als Migrationshilfe |
| Umsetzungszeit | Stunden |

### Option B: Static + optionale Nutzerkonten (Stufe 2)

| Aspekt | Details |
|---|---|
| Backend | Node.js / Python API oder BaaS (Supabase, Firebase) |
| Datenbank | PostgreSQL oder ähnlich, EU-gehostet |
| Auth | E-Mail/Passwort, ggf. OAuth |
| Kosten | 20–100 €/Monat (je nach Last) |
| DSGVO-Aufwand | Erheblich: Datenlöschung, Auskunftspflicht, AVV mit Hosting-Anbieter |
| Neue Möglichkeiten | Cloud-Sync, Multi-Device, Team-Sharing, Freemium |
| Umsetzungszeit | Wochen bis Monate |

---

## Neue Möglichkeiten durch WebApp-Status

| Möglichkeit | Beschreibung | Aufwand |
|---|---|---|
| **PWA / Offline-App** | Service Worker + Web App Manifest → installierbar, offline nutzbar | Gering |
| **Automatische Updates** | Kernanliegen gelöst: alle Nutzer immer auf neuestem Stand | Sofort |
| **SEO / Discoverability** | Tool wird über Suchmaschinen findbar → organischer Wachstumskanal | Gering (technisch) |
| **Freemium-Modell** | Basis kostenlos, Premium mit Cloud-Sync / mehr Features | Hoch |
| **White-Label-Lizenzierung** | Einbettbar in Kanzleisoftware als iFrame oder JS-Modul | Mittel |
| **URL-basierter Fall-Import** | Fälle per URL-Parameter oder komprimiertem JSON im Hash übergeben | Mittel |
| **API für Datenübergabe** | Externe Tools können Fälle per POST übergeben | Mittel |
| **Analytics (datenschutzkonform)** | Verstehen, welche Features genutzt werden | Gering |

---

## Risiken

| Risiko | Beschreibung | Gegenmaßnahme |
|---|---|---|
| **localStorage-Datenverlust** | Browser-Bereinigung, Wechsel des Browsers/Geräts | Prominenter Export-Hinweis, automatischer Export-Reminder |
| **Uptime-Erwartung** | Nutzer erwarten 99,9 % Verfügbarkeit einer "echten" WebApp | Monitoring (UptimeRobot kostenlos), CDN |
| **Support-Erwartung** | Öffentliches Tool → Nutzer erwarten Ansprechpartner | FAQ, GitHub Issues oder Kontaktformular |
| **Rechtliche Haftung** | Berechnungsfehler werden dem Anbieter zugeordnet | Klarer Haftungsausschluss, Versionierung mit Changelog |
| **Copycats** | Öffentlich erreichbarer Code ist inspizierbar | Kein vollständiger Schutz möglich; Markenschutz wichtiger |

---

## Empfohlene Reihenfolge

1. **Sofort:** Domain + EU-Hosting buchen, Static Deployment einrichten (< 1 Tag)
2. **Woche 1:** Impressum + Datenschutzerklärung, Haftungsausschluss im Footer
3. **Woche 2:** PWA-Manifest + Service Worker für Offline-Nutzung
4. **Monat 1:** Export-Reminder und Onboarding-Hinweis für neue Nutzer
5. **Monat 3–6:** Entscheidung über Nutzerkonten und Monetarisierung evaluieren

---

*Erstellt: April 2026*
