# MVP Scope Definition

**Version:** 1.0  
**Gültig für:** Phase 1 (2-4 Wochen)  
**Erstellt:** 2026-08-01

---

## Zielsetzung

Das MVP (Minimum Viable Product) ermöglicht die Kernfunktionalität der Terminumfrage-Anwendung mit manuellem Azure-Deployment für erste User-Tests.

**Definition of Done:**  
Das MVP ist fertig, wenn es "von Hand" in die Azure-Infrastruktur deployed ist und User-Tests durchgeführt werden können.

---

## User-Rollen

### Mitarbeiter (User)
Standard-Benutzer mit Zugriff auf Umfragen und eigene Rückmeldungen.

**ChurchTools-Berechtigung:** Authentifizierter Benutzer

### Teamleiter (Admin)
Erweiterte Rechte für Umfragenverwaltung und Einteilungen.

**ChurchTools-Berechtigung:** Mitglied der konfigurierten Admin-Gruppe (`CHURCHTOOL_ADMIN_GROUP_ID`)

---

## Kernfunktionen (Im Scope)

### 1. Authentifizierung & Autorisierung

#### ✅ OIDC-basierter Login
- Benutzer wird zu ChurchTools OIDC-Provider weitergeleitet
- Nach erfolgreicher Authentifizierung Redirect zurück zur App
- JWT-Token wird im Frontend gespeichert (Session Storage)
- Automatisches Logout bei abgelaufenem Token

#### ✅ Rollenbasierte Zugriffskontrolle
- Backend: JWT-Validierung für alle geschützten Endpunkte
- Admin-Check über Gruppen-Mitgliedschaft (aus JWT Claims)
- Frontend: Route-Guards für Admin-Seiten
- Fehlerbehandlung: 401 (unauthenticated), 403 (forbidden)

**Nicht im MVP:**
- ❌ Mehrfaktor-Authentifizierung
- ❌ Feingranulare Berechtigungen (nur User/Admin)
- ❌ Offline-Token-Refresh

---

### 2. User-Funktionen

#### ✅ Umfragen-Übersicht
- Liste aller aktiven Umfragen für den Benutzer
- Anzeige: Name, Beschreibung, Anzahl Termine, Status
- Filterung nach Status: Aktiv, Abgeschlossen
- Click auf Umfrage → Detail-Ansicht

#### ✅ Verfügbarkeit eingeben
- Für jeden Termin in einer Umfrage Verfügbarkeit angeben:
  - **Ja** (verfügbar)
  - **Nein** (nicht verfügbar)
  - **Eventuell** (unter Vorbehalt)
- Optional: Bemerkung pro Termin
- Speichern aller Rückmeldungen auf einmal
- Nachträgliches Ändern bis Umfrage geschlossen wird

#### ✅ Einteilungen einsehen
- Übersicht aller Termine, für die der Benutzer eingeteilt ist
- Anzeige: Datum, Dienst-Typ, Umfrage-Name
- Sortierung nach Datum
- Keine Bearbeitungsmöglichkeit

**Nicht im MVP:**
- ❌ Push-Benachrichtigungen bei neuen Umfragen
- ❌ E-Mail-Erinnerungen
- ❌ Kalender-Export (iCal)
- ❌ Historische Ansicht (vergangene Einteilungen)

---

### 3. Admin-Funktionen

#### ✅ Umfrage erstellen
- Formular mit Feldern:
  - Name (Pflichtfeld)
  - Beschreibung (optional)
  - Status: Draft, Active, Closed
- Hinzufügen mehrerer Termine:
  - Datum + Uhrzeit
  - Dienst-Typ (aus ChurchTools-API)
  - Benötigte Personenanzahl
  - Notizen (optional)
- Speichern als Draft oder direkt Active
- Validierung: Mind. 1 Termin, Name nicht leer

#### ✅ Umfrage bearbeiten
- Ändern von Name, Beschreibung, Status
- Hinzufügen/Löschen von Terminen
- Status-Änderung: Draft → Active → Closed
- Keine Änderung nach Status "Closed"

#### ✅ Umfrage löschen
- Nur möglich im Status "Draft"
- Bestätigungsdialog
- Löscht Umfrage + zugehörige Termine (Cascade)
- Rückmeldungen werden nicht gelöscht (Hinweis an Admin)

#### ✅ Rückmeldungen einsehen
- Tabelle: Benutzer × Termine
- Farbkodierung: Grün (Ja), Rot (Nein), Gelb (Eventuell)
- Anzeige von Bemerkungen
- Filtermöglichkeit nach Verfügbarkeit

#### ✅ Einteilungen vornehmen
- Drag & Drop oder Checkbox-basiert
- Benutzer zu Terminen zuweisen
- Warnung bei Überschreitung benötigter Personenanzahl
- Speichern aller Einteilungen auf einmal
- Nachträgliche Änderung möglich (auch bei Status "Closed")

**Nicht im MVP:**
- ❌ Automatische Einteilungsvorschläge
- ❌ Konflikt-Erkennung (gleicher User, mehrere Dienste zur selben Zeit)
- ❌ Import/Export von Umfragen
- ❌ Umfragen-Vorlagen
- ❌ Mitarbeiter direkt aus App einladen (nur über ChurchTools-Gruppen)
- ❌ Statistiken/Reports

---

## Technische Anforderungen

### Frontend
- ✅ Responsive Design (Desktop + Tablet, keine mobile Optimierung)
- ✅ Fluent UI 9 Komponenten durchgängig nutzen
- ✅ Client-Side Validierung für alle Formulare
- ✅ Loading-States während API-Calls
- ✅ Fehlerbehandlung mit nutzerfreundlichen Meldungen (Deutsch)
- ✅ TanStack Query für Server State Management

### Backend
- ✅ JWT-Validierung für alle geschützten Endpunkte
- ✅ Input-Validierung für alle POST/PUT-Requests
- ✅ Deutsche Fehlermeldungen im `error`-Feld
- ✅ HTTP-Statuscodes konsistent: 200/201/204/400/401/403/404/500
- ✅ Application Insights Logging für Fehler + kritische Events
- ✅ Health-Endpunkt mit DB-Konnektivitätscheck

### Datenmodell
- ✅ Azure Table Storage mit 5 Tabellen:
  - Surveys
  - ServiceDates
  - Responses
  - Assignments
  - Services
- ✅ CRUD-Operationen für Surveys, ServiceDates, Assignments
- ✅ POST/GET für Responses
- ✅ ChurchTools-API-Integration für Dienst-Typen

### Deployment
- ✅ Manueller Deploy via `infrastructure/scripts/deploy.ps1`
- ✅ Bicep-basierte Infrastruktur (vorhanden, muss nur ausgeführt werden)
- ✅ Umgebungsvariablen-Management über `scripts/sync-env.mjs`

**Nicht im MVP:**
- ❌ Automatisierte CI/CD-Pipeline
- ❌ Multi-Region-Deployment
- ❌ Auto-Scaling
- ❌ Backend-Unit-/Integrationstests
- ❌ E2E-Tests (nur manuelle Smoke-Tests)

---

## Qualitätskriterien

### Performance
- Seiten-Ladezeit < 3 Sekunden (lokal)
- API-Response-Zeit < 500ms (einfache Queries)

### Usability
- Intuitive Navigation ohne Schulung
- Fehler-Meldungen verständlich formuliert
- Keine kritischen UX-Brüche

### Stabilität
- Keine Datenverluste bei Fehlern
- Graceful Degradation bei ChurchTools-API-Ausfall
- Keine unbehandelten Exceptions im Frontend

---

## Abgrenzung zu zukünftigen Phasen

### Phase 2 (Post-MVP)
- CI/CD-Automatisierung
- Backend-Tests
- Performance-Optimierung
- Multi-Region-Support

### Phase 3 (Features)
- Push-Benachrichtigungen
- Kalender-Integration
- Automatische Einteilungsvorschläge
- Statistiken & Reports

---

**Änderungshistorie:**
- 2026-08-01: Initiale Version
