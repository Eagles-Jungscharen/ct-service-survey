# Akzeptanzkriterien MVP

**Version:** 1.0  
**Gültig für:** Phase 1 (2-4 Wochen)  
**Erstellt:** 2026-08-01

---

## Nutzungshinweise

Diese Checklisten dienen zur Abnahme des MVP. Jeder Punkt muss erfüllt sein, damit die Phase als erfolgreich gilt.

**Testumgebung:** Manuell deployed in Azure (nicht lokal)  
**Test-Accounts:** Mind. 1 Admin-Account, 2 User-Accounts

---

## 1. Authentifizierung & Autorisierung

### 1.1 OIDC-Login

- [ ] Nicht-authentifizierter Benutzer wird auf Login-Seite umgeleitet
- [ ] Click auf "Login" leitet zu ChurchTools OIDC-Provider weiter
- [ ] Nach erfolgreicher Anmeldung bei ChurchTools: Redirect zurück zur App
- [ ] Benutzer ist eingeloggt, Name wird in Header angezeigt
- [ ] Bei bereits vorhandenem gültigem Token: kein erneuter Login erforderlich

### 1.2 Rollenbasierte Zugriffskontrolle

- [ ] Admin-Account sieht Admin-Menü-Einträge (z.B. "Umfrage erstellen")
- [ ] User-Account sieht keine Admin-Menü-Einträge
- [ ] Direkter URL-Aufruf einer Admin-Seite als User führt zu 403-Fehler
- [ ] Fehlerseite zeigt verständliche Meldung: "Keine Berechtigung"

### 1.3 Logout & Token-Ablauf

- [ ] Click auf "Logout" loggt Benutzer aus und leitet zu Login-Seite
- [ ] Nach Logout: API-Calls liefern 401-Fehler
- [ ] Bei abgelaufenem Token: automatischer Logout + Redirect zu Login
- [ ] Fehlerseite zeigt verständliche Meldung: "Sitzung abgelaufen"

---

## 2. User-Funktionen

### 2.1 Umfragen-Übersicht

- [ ] Nach Login: Umfragen-Übersicht wird angezeigt
- [ ] Liste zeigt nur aktive Umfragen (Status = "Active")
- [ ] Pro Umfrage sichtbar: Name, Beschreibung, Anzahl Termine
- [ ] Leere Liste zeigt Hinweis: "Keine aktiven Umfragen vorhanden"
- [ ] Filter "Alle" zeigt auch abgeschlossene Umfragen (Status = "Closed")

### 2.2 Verfügbarkeit eingeben

- [ ] Click auf Umfrage öffnet Detail-Ansicht mit allen Terminen
- [ ] Pro Termin: 3 Optionen sichtbar (Ja / Nein / Eventuell)
- [ ] Auswahl einer Option markiert diese visuell (z.B. Farbhintergrund)
- [ ] Textfeld "Bemerkung" kann optional befüllt werden
- [ ] Click auf "Speichern": Success-Meldung + Bestätigung sichtbar
- [ ] Nach Speichern: Reload der Seite zeigt gespeicherte Auswahl
- [ ] Nachträgliche Änderung möglich: neue Auswahl überschreibt alte
- [ ] Bei geschlossener Umfrage: Speichern-Button deaktiviert

### 2.3 Einteilungen einsehen

- [ ] Menü-Eintrag "Meine Einteilungen" führt zu Einteilungs-Übersicht
- [ ] Liste zeigt alle Termine, für die User eingeteilt ist
- [ ] Pro Eintrag sichtbar: Datum, Uhrzeit, Dienst-Typ, Umfrage-Name
- [ ] Sortierung: chronologisch nach Datum (neueste zuerst)
- [ ] Keine Bearbeitungs-/Lösch-Möglichkeit
- [ ] Leere Liste zeigt Hinweis: "Noch keine Einteilungen vorhanden"

---

## 3. Admin-Funktionen

### 3.1 Umfrage erstellen

- [ ] Admin-Menü zeigt "Umfrage erstellen"
- [ ] Formular mit Feldern: Name, Beschreibung, Status
- [ ] "Termin hinzufügen"-Button öffnet Termin-Formular
- [ ] Termin-Formular: Datum, Uhrzeit, Dienst-Typ (Dropdown), Pers.-Anzahl, Notizen
- [ ] Mind. 1 Termin erforderlich (Validierung)
- [ ] Name-Feld darf nicht leer sein (Validierung)
- [ ] Click auf "Speichern": Umfrage wird erstellt + Success-Meldung
- [ ] Bei Fehler: verständliche Fehlermeldung angezeigt
- [ ] Status "Draft": Umfrage nicht in User-Übersicht sichtbar
- [ ] Status "Active": Umfrage in User-Übersicht sichtbar

### 3.2 Umfrage bearbeiten

- [ ] Admin-Umfragen-Übersicht zeigt "Bearbeiten"-Button pro Umfrage
- [ ] Click auf "Bearbeiten": Formular mit bestehenden Daten vorausgefüllt
- [ ] Name, Beschreibung änderbar
- [ ] Status änderbar: Draft → Active → Closed
- [ ] Neue Termine hinzufügbar
- [ ] Bestehende Termine löschbar (mit Bestätigungsdialog)
- [ ] Click auf "Speichern": Änderungen übernommen + Success-Meldung
- [ ] Bei Status "Closed": Hinweis, dass Umfrage nicht mehr änderbar ist (außer Einteilungen)

### 3.3 Umfrage löschen

- [ ] Nur bei Status "Draft": "Löschen"-Button sichtbar
- [ ] Click auf "Löschen": Bestätigungsdialog mit Warnung
- [ ] Bei Status "Active"/"Closed": kein "Löschen"-Button
- [ ] Nach Bestätigung: Umfrage + Termine gelöscht
- [ ] Success-Meldung: "Umfrage erfolgreich gelöscht"
- [ ] Redirect zur Umfragen-Übersicht

### 3.4 Rückmeldungen einsehen

- [ ] In Umfrage-Detail-Ansicht (Admin): Tab "Rückmeldungen"
- [ ] Tabelle: Spalten = Termine, Zeilen = Benutzer
- [ ] Farbkodierung: Grün (Ja), Rot (Nein), Gelb (Eventuell), Grau (keine Antwort)
- [ ] Hover über Zelle: Tooltip mit Bemerkung (falls vorhanden)
- [ ] Filter: "Nur verfügbare User" zeigt nur Ja/Eventuell-Antworten
- [ ] Leere Tabelle: Hinweis "Noch keine Rückmeldungen vorhanden"

### 3.5 Einteilungen vornehmen

- [ ] In Umfrage-Detail-Ansicht (Admin): Tab "Einteilungen"
- [ ] Pro Termin: Liste verfügbarer User (Ja/Eventuell)
- [ ] Checkbox pro User + Termin
- [ ] Benötigte Personenanzahl sichtbar
- [ ] Warnung bei Überschreitung: "Mehr Personen eingeteilt als benötigt"
- [ ] Click auf "Speichern": Einteilungen übernommen + Success-Meldung
- [ ] Nachträgliche Änderung möglich (auch bei Status "Closed")
- [ ] User sieht neue Einteilung in "Meine Einteilungen"

---

## 4. Technische Anforderungen

### 4.1 Frontend

- [ ] Alle Seiten responsive auf Desktop (1920×1080) und Tablet (1024×768)
- [ ] Fluent UI Komponenten durchgängig verwendet (keine Custom-Styles für Standard-Elemente)
- [ ] Loading-Spinner während API-Calls sichtbar
- [ ] Fehler-Toasts bei API-Fehlern mit deutscher Meldung
- [ ] Client-Side Validierung: rote Umrandung + Fehlermeldung bei ungültigen Eingaben
- [ ] Keine Konsolen-Fehler im Browser (außer bekannte Warnings)

### 4.2 Backend

- [ ] Health-Endpunkt (`/api/health`) liefert 200 + JSON-Response
- [ ] Alle geschützten Endpunkte: ohne Token → 401
- [ ] Admin-Endpunkte: als User → 403
- [ ] Input-Validierung: ungültige Daten → 400 + deutsche Fehlermeldung im `error`-Feld
- [ ] Application Insights: Fehler geloggt (prüfbar in Azure Portal)
- [ ] Keine unbehandelten Exceptions im Function App Log

### 4.3 Datenmodell

- [ ] CRUD Survey: Create, Read, Update (nur Name/Beschreibung/Status)
- [ ] CRUD ServiceDates: Create, Read, Delete (als Teil von Survey)
- [ ] POST Response: Speichern von Rückmeldungen (alle Termine einer Umfrage)
- [ ] GET Response: Abrufen eigener Rückmeldungen
- [ ] CRUD Assignment: Create, Read, Update, Delete
- [ ] ChurchTools-API: Dienst-Typen werden korrekt abgerufen

### 4.4 Deployment

- [ ] Infrastruktur erfolgreich deployed via `infrastructure/scripts/deploy.ps1`
- [ ] Backend deployed: Function App erreichbar unter Production-URL
- [ ] Frontend deployed: Static Website erreichbar unter Production-URL
- [ ] Umgebungsvariablen korrekt gesetzt (ChurchTools-URLs, Admin-Group-ID)
- [ ] HTTPS-Zugriff funktioniert (kein Mixed Content)

---

## 5. Qualitätskriterien

### 5.1 Performance

- [ ] Umfragen-Übersicht lädt in < 3 Sekunden
- [ ] API-Response für einfache Queries (GET /api/surveys) < 500ms
- [ ] Keine blockierenden UI-Freezes bei Interaktionen

### 5.2 Usability

- [ ] Admin kann ohne Anleitung Umfrage erstellen
- [ ] User kann ohne Anleitung Verfügbarkeit eingeben
- [ ] Fehler-Meldungen verständlich formuliert (kein Technik-Jargon)
- [ ] Navigation intuitiv: max. 3 Clicks zu jeder Funktion

### 5.3 Stabilität

- [ ] 10× Umfrage erstellen/bearbeiten/löschen ohne Fehler
- [ ] 10× Rückmeldungen eingeben/ändern ohne Datenverlust
- [ ] ChurchTools-API-Ausfall: Frontend zeigt Fehler, kein Crash
- [ ] Paralleles Bearbeiten durch 2 User: keine Race Conditions

---

## 6. Smoke-Test-Durchlauf (End-to-End)

### Szenario: Admin erstellt Umfrage, User antwortet, Admin teilt ein

1. **Setup**
   - [ ] Admin-Account und 2 User-Accounts bereit
   - [ ] ChurchTools-Integration funktioniert (Login möglich)

2. **Admin: Umfrage erstellen**
   - [ ] Login als Admin
   - [ ] "Umfrage erstellen" → Formular ausfüllen
   - [ ] 3 Termine hinzufügen (verschiedene Dienst-Typen)
   - [ ] Status: "Active" → Speichern
   - [ ] Success-Meldung sichtbar

3. **User 1: Rückmeldung geben**
   - [ ] Login als User 1
   - [ ] Neue Umfrage in Übersicht sichtbar
   - [ ] Umfrage öffnen → Verfügbarkeit für 2 Termine "Ja", 1 Termin "Nein"
   - [ ] Bemerkung bei 1 Termin eingeben → Speichern
   - [ ] Success-Meldung sichtbar

4. **User 2: Rückmeldung geben**
   - [ ] Login als User 2
   - [ ] Umfrage öffnen → Verfügbarkeit für alle Termine "Ja" → Speichern

5. **Admin: Rückmeldungen prüfen**
   - [ ] Login als Admin
   - [ ] Umfrage öffnen → Tab "Rückmeldungen"
   - [ ] Tabelle zeigt 2 User × 3 Termine
   - [ ] Farbkodierung korrekt (Grün, Rot)
   - [ ] Bemerkung von User 1 sichtbar

6. **Admin: Einteilungen vornehmen**
   - [ ] Tab "Einteilungen"
   - [ ] User 1 für Termin 1 + 2 einteilen
   - [ ] User 2 für Termin 3 einteilen → Speichern
   - [ ] Success-Meldung sichtbar

7. **User 1: Einteilungen einsehen**
   - [ ] Login als User 1
   - [ ] "Meine Einteilungen" → 2 Einträge sichtbar
   - [ ] Termine entsprechen Admin-Zuteilung

8. **Admin: Umfrage schließen**
   - [ ] Umfrage bearbeiten → Status: "Closed" → Speichern
   - [ ] User-Übersicht: Umfrage nicht mehr in "Aktive" (nur in "Alle")

9. **User 1: Keine Änderung mehr möglich**
   - [ ] Umfrage öffnen (über "Alle")
   - [ ] "Speichern"-Button deaktiviert
   - [ ] Hinweis: "Umfrage ist geschlossen"

---

## Abnahme-Kriterien

### Kritisch (Blocker)
- Alle Punkte in Abschnitt 1 (Auth), 2 (User), 3 (Admin) müssen erfüllt sein
- Smoke-Test-Durchlauf (Abschnitt 6) erfolgreich
- Keine kritischen Fehler in Browser-/Function-App-Logs

### Wichtig (High)
- Mind. 90% der Punkte in Abschnitt 4 (Technisch) und 5 (Qualität)
- Bekannte Einschränkungen dokumentiert

### Optional (Low)
- Performance-Ziele (< 3s, < 500ms) als Richtwerte, nicht harte Anforderungen
- UI-Feinschliff (z.B. Animationen) nice-to-have

---

**Änderungshistorie:**
- 2026-08-01: Initiale Version
