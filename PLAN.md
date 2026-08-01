# Umsetzungsplan: ct-service-survey MVP

**Ziel:** Produktionsnahes MVP mit manuellem Azure-Deploy für User-Tests  
**Zeitrahmen:** 2-4 Wochen  
**Team:** Solo-Entwicklung  
**Release-Modell:** Manuell

---

## Prioritäten & Scope

### ✅ Im Scope (Phase 1)
- Backend API & Datenmodell
- Frontend UX & Flows
- Auth/OIDC & Rollenmodell
- UI-Unit-Tests für kritische Flows

### ❌ Explizit NICHT im Scope
- Infrastruktur-Ausbau
- CI/CD-Automatisierung
- Backend-Tests

### Definition of Done
MVP funktioniert, wenn er "von Hand" in die Azure-Infrastruktur deployed ist und User-Tests stattfinden können.

---

## Phasen-Übersicht

### Phase 1: Scope und Akzeptanzkriterien fixieren
**Ziel:** Klare Abgrenzung MVP-Funktionen und messbare Erfolgsmetriken

- [ ] **1.1** MVP-Funktionsumfang auf Kernabläufe begrenzen
  - User: Login, Umfragen sehen, Verfügbarkeit eingeben, Einteilungen einsehen
  - Admin: Umfragen erstellen/bearbeiten/löschen, Einteilungen verwalten
- [ ] **1.2** Akzeptanzkriterien pro Kernablauf dokumentieren
- [ ] **1.3** Nicht-Ziele in Dokumentation festhalten

**Deliverables:** 
- `docs/MVP_SCOPE.md` mit Funktionsübersicht
- `docs/ACCEPTANCE_CRITERIA.md` mit Checklisten pro Flow

---

### Phase 2: Backend API und Datenmodell stabilisieren
**Ziel:** Konsistente, produktionsreife API-Verträge

- [ ] **2.1** DTOs/Entities gegen MVP-Flows abgleichen
  - Bestehende DTOs prüfen: `MeDto`, `SurveyRequestDto`, `SurveyRequestEntryDto`, `ErrorRecord`
  - Fehlende DTOs identifizieren: Response, Assignment, Service-Entities
- [ ] **2.2** API-Verhalten vereinheitlichen
  - Deutsche Fehlermeldungen mit `error`-Feld (kompatibel: `message`)
  - HTTP-Statuscodes konsistent: 200/201/204/400/401/403/404/500
  - Validierung für alle Input-DTOs
- [ ] **2.3** Persistenzfluss in Azure Table Storage validieren
  - Tabellen: Surveys, ServiceDates, Responses, Assignments, Services
  - CRUD-Operationen für alle Entities testen
- [ ] **2.4** Health & Observability
  - `/api/health`-Endpunkt erweitern (DB-Konnektivität, ChurchTools-API)
  - Application Insights Logging für kritische Fehler

**Deliverables:**
- Vollständige DTO-Generierung (`npm run generate:types`)
- API-Endpunkte für: Surveys (CRUD), Responses (POST/GET), Assignments (CRUD)
- `docs/API.md` aktualisiert mit allen Endpunkten

---

### Phase 3: Frontend UX/Flows für MVP abschließen
**Ziel:** Durchgängige User/Admin-Journeys ohne Brüche

- [ ] **3.1** Seitenflüsse End-to-End validieren
  - User-Flow: Login → Umfragen-Übersicht → Verfügbarkeit eingeben → Einteilungen sehen
  - Admin-Flow: Login → Umfrage erstellen → Termine setzen → Rückmeldungen prüfen → Einteilungen vornehmen
- [ ] **3.2** API-Integration an stabilisierte DTOs angleichen
  - `packages/frontend/src/services/api` an neue Shared-Typen anpassen
  - TanStack Query Hooks für alle Endpunkte
- [ ] **3.3** Fehlerszenarien nutzerverständlich abbilden
  - Fehlermeldungen aus `error`-Feld anzeigen
  - Fallback-UI für Netzwerkfehler/Auth-Probleme
- [ ] **3.4** UI-Unit-Tests ergänzen
  - Kritische Komponenten: SurveyForm, ResponseInput, AssignmentList
  - Test-Framework: Vitest + React Testing Library

**Deliverables:**
- Vollständige User/Admin-Pages in `packages/frontend/src/pages`
- API-Client in `packages/frontend/src/services/api` abgeschlossen
- Mindestens 5 UI-Unit-Tests

---

### Phase 4: Auth/OIDC und Rollenlogik absichern
**Ziel:** Sichere, konsistente Authentifizierung und Autorisierung

- [ ] **4.1** OIDC-Konfiguration validieren
  - `packages/frontend/src/config/oidc.ts` für lokal + Azure
  - Redirect-URLs korrekt
  - Claims-Mapping (User-ID, Gruppen-IDs)
- [ ] **4.2** Rollenentscheidung konsistent machen
  - Backend: JWT-Validierung + Admin-Gruppencheck in Middleware
  - Frontend: Route-Guards für Admin-Seiten
- [ ] **4.3** Negativfälle prüfen
  - Ungültiges/fehlendes Token → 401
  - Falsche Rolle → 403
  - Abgelaufene Session → Auto-Logout + Redirect

**Deliverables:**
- Auth-Middleware in `packages/backend/Middleware`
- Frontend Route-Guards
- OIDC-Konfiguration dokumentiert in `docs/SETUP.md`

---

### Phase 5: Manuelle Release-Readiness und User-Testfreigabe
**Ziel:** Deployment-fähiges MVP mit klarer Testanleitung

- [ ] **5.1** Durchgängigen Deploy-Probelauf dokumentieren
  - Infrastruktur bereitstellen: `infrastructure/scripts/deploy.ps1`
  - Backend deployen: `func azure functionapp publish`
  - Frontend deployen: Upload zu Blob Storage
- [ ] **5.2** Smoke-Checklist Post-Deploy
  - Health-Endpunkt erreichbar
  - Login funktioniert
  - Umfrage erstellen/beantworten/einteilungen
- [ ] **5.3** User-Testfreigabe
  - Testskript mit Beispiel-Szenarien
  - Bekannte Einschränkungen dokumentieren

**Deliverables:**
- `docs/DEPLOYMENT.md` mit Schritt-für-Schritt-Anleitung
- `docs/SMOKE_TEST.md` Checklist
- `docs/USER_TEST_GUIDE.md` für Tester

---

## Verification Criteria

1. ✅ Build-Reihenfolge erfolgreich
   ```bash
   npm run build:shared
   npm run build:frontend
   npm run build:backend
   ```

2. ✅ Lokaler End-to-End Smoke-Test
   - Login mit ChurchTools-Account
   - Umfrage beantworten als User
   - Umfrage verwalten als Admin
   - Rollenwechsel funktioniert

3. ✅ UI-Unit-Tests laufen grün
   ```bash
   npm run test:frontend
   ```

4. ✅ Manueller Azure-Deploy erfolgreich
   - Infrastruktur provisioniert
   - Code deployed
   - Smoke-Checklist bestanden

5. ✅ Dokumentation vollständig
   - API-Endpunkte dokumentiert
   - MVP-Scope klar abgegrenzt
   - Deployment-Anleitung vorhanden

---

## Relevante Dateien

### Backend
- `packages/backend/Functions/` - API-Endpunkte
- `packages/backend/Services/` - Geschäftslogik
- `packages/backend/Models/Dtos/` - C# DTO-Quelle
- `packages/backend/Models/Entities/` - Table Storage Entities
- `packages/backend/Middleware/` - Auth & Validation

### Frontend
- `packages/frontend/src/pages/` - User/Admin-Views
- `packages/frontend/src/services/api/` - API-Client
- `packages/frontend/src/components/` - UI-Komponenten
- `packages/frontend/src/config/oidc.ts` - Auth-Konfiguration

### Shared
- `packages/shared/src/generated/dtos.ts` - Generierte TypeScript-Typen (nicht manuell editieren!)
- `packages/shared/src/types/` - Ergänzende Frontend-Typen

### Infrastruktur
- `infrastructure/azure/main.bicep` - Azure-Ressourcen
- `infrastructure/scripts/deploy.ps1` - Deployment-Skript

### Dokumentation
- `docs/API.md` - API-Verträge
- `docs/ARCHITECTURE.md` - Architekturziele
- `docs/SETUP.md` - Entwicklungsumgebung

---

## Weitere Überlegungen

1. **Dokumentationsfokus:** In Phase 1 nur API + User-Test-Guide aktualisieren oder auch Architekturdetails nachziehen?
2. **Risikopolster:** Puffer für Auth-/OIDC-Unklarheiten einplanen?
3. **Phase 2 vorbereiten:** CI/CD und Infrastruktur-Härtung als separaten Folgeplan vormerken

---

**Letzte Aktualisierung:** 2026-08-01  
**Status:** 🚧 Phase 1 läuft
