# Lokales Testing - Schritt-für-Schritt-Anleitung

## Voraussetzungen

### 1. Installierte Tools

**Erforderlich:**
- Node.js 18+ (für Frontend & npm workspaces)
- .NET 10 SDK (für Backend Azure Functions)
- Azure Functions Core Tools v4 (`npm install -g azure-functions-core-tools@4 --unsafe-perm true`)
- Azurite (Azure Storage Emulator): `npm install -g azurite`

**Optional (aber empfohlen):**
- Azure Storage Explorer (für Datenbank-Inspektion)
- REST Client (z.B. Thunder Client, Postman, oder VS Code REST Client Extension)

**Prüfen der Installation:**
```bash
node --version          # >= 18.0.0
dotnet --version        # >= 10.0.0
func --version          # >= 4.0.0
azurite --version       # >= 3.0.0
```

### 2. ChurchTools OIDC-Client (nur für Auth-Testing)

Falls du Auth testen möchtest, benötigst du einen OIDC-Client in deiner ChurchTools-Instanz:
1. ChurchTools Admin → Einstellungen → API → OAuth2 Clients
2. Neuen Client erstellen
3. Redirect URI: `http://localhost:5173/callback`
4. Client ID notieren

⚠️ **Alternativ:** Auth temporär deaktivieren für initiales Testing (siehe unten)

---

## Setup - Einmalig

### Schritt 1: Dependencies installieren

```bash
cd /Users/christianguedemann/Development/Repositories/C_EaglesJungscharen/ct-service-survey

# Alle npm-Packages installieren (Root + Workspaces)
npm install
```

### Schritt 2: Backend-Konfiguration

Erstelle `packages/backend/local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    
    "CHURCHTOOL_URL": "https://deine-kirche.church.tools",
    "OIDC_AUTHORITY_URL": "https://deine-kirche.church.tools/api/login/oauth2",
    "CHURCHTOOL_IDP_STORAGE_CONNECTION_STRING": "UseDevelopmentStorage=true",
    "SURVEY_STORAGE_CONNECTION_STRING": "UseDevelopmentStorage=true",
    "CHURCHTOOL_ADMIN_GROUP_ID": "123"
  },
  "Host": {
    "CORS": "*",
    "CORSCredentials": false
  }
}
```

**Wichtig:** `UseDevelopmentStorage=true` nutzt Azurite (localhost:10002 für Tables)

### Schritt 3: Frontend-Konfiguration

Erstelle `packages/frontend/.env`:

```env
# Backend URL
VITE_API_BASE_URL=http://localhost:7072

# ChurchTools OIDC (nur wenn du Auth testen willst)
VITE_OIDC_AUTHORITY=https://deine-kirche.church.tools/api/login/oauth2
VITE_OIDC_CLIENT_ID=deine-client-id
VITE_OIDC_REDIRECT_URI=http://localhost:5173/callback
VITE_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
VITE_CHURCHTOOL_ADMIN_GROUP_ID=123
```

### Schritt 4: Build durchführen

```bash
# Einmal kompilieren (shared types + backend + frontend)
npm run build:all
```

---

## Testing starten - 3 Terminals

### Terminal 1: Azurite (Storage Emulator)

```bash
# Storage Emulator starten (läuft dauerhaft)
azurite --silent --location /tmp/azurite --debug /tmp/azurite/debug.log
```

**Was passiert:**
- Table Storage: `localhost:10002`
- Blob Storage: `localhost:10000`
- Queue Storage: `localhost:10001`

**Tipp:** Lass dieses Terminal im Hintergrund laufen

### Terminal 2: Backend (Azure Functions)

```bash
cd packages/backend

# Functions starten
func start
```

**Was passiert:**
- Backend läuft auf: `http://localhost:7072`
- Alle API-Endpoints werden angezeigt
- Hot Reload bei Code-Änderungen (nach erneutem `dotnet build`)

**Erwartete Ausgabe:**
```
Azure Functions Core Tools
Core Tools Version: 4.x.x
Function Runtime Version: 4.x.x

Functions:

        AssignmentsFunction: [GET,POST] http://localhost:7072/api/assignments/{*route}
        
        HealthFunction: [GET] http://localhost:7072/api/health
        
        ResponsesFunction: [GET,POST] http://localhost:7072/api/responses/{*route}
        
        SurveysFunction: [DELETE,GET,POST,PUT] http://localhost:7072/api/surveys/{*route}

For detailed output, run func with --verbose flag.
```

### Terminal 3: Frontend (Vite Dev Server)

```bash
cd packages/frontend

# Dev Server starten
npm run dev
```

**Was passiert:**
- Frontend läuft auf: `http://localhost:5173`
- Hot Module Replacement (HMR) aktiviert
- Änderungen sofort im Browser sichtbar

**Erwartete Ausgabe:**
```
VITE v8.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## Testing ohne ChurchTools Auth (Empfohlen für Start)

### Option A: Auth temporär deaktivieren

**1. Frontend: ProtectedRoute.tsx anpassen**

Öffne `packages/frontend/src/components/ProtectedRoute.tsx` und kommentiere den Auth-Check aus:

```tsx
export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  // TEMP: Auth deaktiviert für lokales Testing
  return <>{children}</>
  
  /* Original Code:
  const styles = useStyles()
  const auth = useAuth()
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      auth.signinRedirect()
    }
  }, [auth.isLoading, auth.isAuthenticated, auth])
  
  ... rest des Codes
  */
}
```

**2. Backend: UserContextHelper Mock**

Öffne `packages/backend/Functions/UserContextHelper.cs` und füge Test-User hinzu:

```csharp
public static (string userId, string displayName, bool isAdmin) GetUserFromClaims(
    ClaimsPrincipal user, 
    IConfiguration configuration)
{
    // TEMP: Mock-User für lokales Testing ohne Auth
    return ("test-user-123", "Test Benutzer", true);
    
    /* Original Code:
    var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier) 
        ?? user.FindFirst("sub") 
        ?? user.FindFirst("person_id");
    ... rest des Codes
    */
}
```

**Nach Testing:** Mache diese Änderungen wieder rückgängig!

### Option B: Mit echtem ChurchTools OIDC

Falls du eine ChurchTools-Instanz hast:
1. OIDC-Client in ChurchTools erstellen (siehe oben)
2. `.env` mit korrekten Werten füllen
3. Browser zu `http://localhost:5173` → Auto-Redirect zu ChurchTools Login
4. Nach Login → Redirect zurück zu App

---

## Test-Szenarien

### 1. Health Check (Backend läuft?)

**Browser:** `http://localhost:7072/api/health`

**Erwartete Antwort:**
```json
{
  "status": "healthy",
  "timestamp": "2026-08-01T12:34:56.789Z"
}
```

### 2. Frontend-Smoke-Test

**Browser:** `http://localhost:5173`

**Erwartung:**
- Seite lädt ohne Fehler
- Navigation sichtbar: "Umfragen" / "Meine Einteilungen" / "Verwaltung"
- Keine Konsolen-Fehler (F12 → Console)

### 3. API-Integration testen (ohne Auth)

**A. Umfrage erstellen (POST /surveys)**

REST Client Request:
```http
POST http://localhost:7072/api/surveys
Content-Type: application/json

{
  "title": "Test-Umfrage August 2026",
  "description": "Lokaler Test",
  "status": "draft",
  "dates": [
    {
      "date": "2026-08-15T10:00:00Z",
      "serviceType": "42",
      "requiredPeople": 3,
      "notes": "Test-Gottesdienst"
    }
  ]
}
```

**Erwartete Antwort:** Status 200 + Survey-DTO mit generierter ID

**B. Umfragen abrufen (GET /surveys)**

```http
GET http://localhost:7072/api/surveys
```

**Erwartete Antwort:** Array mit der erstellten Umfrage

**C. Antwort speichern (POST /responses)**

```http
POST http://localhost:7072/api/responses
Content-Type: application/json

{
  "surveyId": "<survey-id-von-oben>",
  "responses": [
    {
      "serviceDateId": "<service-date-id>",
      "availability": "yes",
      "remarks": "Bin dabei!"
    }
  ]
}
```

### 4. Frontend-Flow testen

**Mitarbeiter-Flow:**
1. Browser: `http://localhost:5173/surveys`
2. Klick auf "Neue Umfrage" (falls Admin-Mock aktiv)
3. Formular ausfüllen → "Erstellen"
4. Umfrage sollte in Liste erscheinen
5. Klick auf Umfrage → Detail-Ansicht
6. "Verfügbarkeit melden" → Formular ausfüllen → "Absenden"
7. Zurück zu Detail → Deine Antwort sollte angezeigt werden

**Admin-Flow:**
1. Navigation → "Verwaltung"
2. Umfrage bearbeiten
3. Dienst hinzufügen
4. "Zu Einteilungen" → Checkboxen für User-Zuordnung
5. "Einteilungen speichern"
6. Navigation → "Meine Einteilungen" (sollte Zuweisung zeigen)

### 5. Datenbank inspizieren (Azure Storage Explorer)

**Verbindung zu Azurite:**
1. Azure Storage Explorer öffnen
2. Connect to Local Emulator
3. Connection String: `UseDevelopmentStorage=true`
4. Tables öffnen → Du solltest sehen:
   - Surveys
   - ServiceDates
   - Responses
   - Assignments
   - Services

**Tabellen-Inhalt prüfen:**
- Surveys: PartitionKey="Survey", RowKey=surveyId
- ServiceDates: PartitionKey=surveyId, RowKey=serviceDateId
- Responses: PartitionKey=surveyId, RowKey=userId_serviceDateId

---

## Häufige Probleme & Lösungen

### Backend startet nicht

**Problem:** `Port 7072 already in use`
- **Lösung:** Anderen Prozess stoppen: `lsof -ti:7072 | xargs kill -9`

**Problem:** `Could not connect to storage emulator`
- **Lösung:** Azurite läuft nicht → Terminal 1 prüfen

**Problem:** `ChurchToolIDPServices configuration error`
- **Lösung:** `local.settings.json` prüfen, CHURCHTOOL_URL muss gültig sein

### Frontend startet nicht

**Problem:** `EADDRINUSE: address already in use :::5173`
- **Lösung:** Port ändern: `npm run dev -- --port 5174`

**Problem:** `import.meta.env.VITE_API_BASE_URL is undefined`
- **Lösung:** `.env` Datei erstellt? Vite neu starten nach .env-Änderungen

### API-Requests schlagen fehl

**Problem:** `CORS error` in Browser Console
- **Lösung:** `local.settings.json` → Host.CORS auf "*" setzen

**Problem:** `401 Unauthorized`
- **Lösung:** Auth temporär deaktivieren (siehe Option A oben)

**Problem:** `404 Not Found` für alle Endpoints
- **Lösung:** Backend-URL prüfen, sollte `http://localhost:7072` sein (nicht https)

### Datenbankfehler

**Problem:** `Table 'Surveys' does not exist`
- **Lösung:** Tables werden automatisch erstellt beim ersten Backend-Start
- Falls nicht: Azurite stoppen, `/tmp/azurite` löschen, Azurite neu starten

**Problem:** `RequestFailedException: 404 Not Found`
- **Lösung:** Normal bei GET auf nicht-existierende Entities, kein echter Fehler

---

## Debugging-Tipps

### Backend (.NET)

**Logs anschauen:**
- Im Terminal wo `func start` läuft
- Detaillierter: `func start --verbose`

**Breakpoints setzen:**
1. VS Code: Run → Start Debugging (F5)
2. Wähle ".NET Core Attach"
3. Wähle `dotnet` Prozess von Functions
4. Breakpoints in `.cs` Dateien setzen

### Frontend (React)

**Browser DevTools:**
- Console (Fehler, Warnungen)
- Network Tab (API-Requests prüfen)
- Application → Session Storage → `oidc.user` (Auth-Token)
- React DevTools Extension (Component-Inspektion)

**Vite-Logs:**
- Im Terminal wo `npm run dev` läuft
- HMR-Updates werden angezeigt

### Azurite

**Debug-Logs:**
```bash
tail -f /tmp/azurite/debug.log
```

**Tables zurücksetzen:**
```bash
# Azurite stoppen (Ctrl+C)
rm -rf /tmp/azurite
# Azurite neu starten
azurite --silent --location /tmp/azurite --debug /tmp/azurite/debug.log
```

---

## Nächste Schritte

Nach erfolgreichem lokalem Testing:

1. **Code-Review durchführen:**
   - Backend Services reviewen
   - Frontend Components reviewen
   - API-Kontrakte validieren

2. **Acceptance Criteria durchgehen:**
   - `docs/ACCEPTANCE_CRITERIA.md` Punkt für Punkt abhaken

3. **Deployment vorbereiten:**
   - Azure-Infrastruktur bereitstellen
   - Produktions-Konfiguration erstellen
   - CI/CD überlegen (optional für MVP)

4. **User Testing:**
   - Test-User einladen
   - Feedback sammeln
   - Bugs fixen

---

## Cleanup

**Nach dem Testing:**

```bash
# Terminals stoppen (Ctrl+C in allen 3 Terminals)

# Optional: Azurite-Daten löschen
rm -rf /tmp/azurite

# Optional: node_modules cleanen (spart Speicher)
npm run clean
```

**Auth-Mocks entfernen:**
- `ProtectedRoute.tsx` zurücksetzen
- `UserContextHelper.cs` zurücksetzen

---

## Zusammenfassung - Quick Start

```bash
# Terminal 1
azurite --silent --location /tmp/azurite --debug /tmp/azurite/debug.log

# Terminal 2
cd packages/backend
func start

# Terminal 3
cd packages/frontend
npm run dev

# Browser
open http://localhost:5173
```

Viel Erfolg beim Testing! 🚀
