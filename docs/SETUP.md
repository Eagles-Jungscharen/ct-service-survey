# Entwicklungsumgebung einrichten

Diese Anleitung beschreibt die vollständige Einrichtung der Entwicklungsumgebung für das ChurchTool Service Survey Tool.

## Voraussetzungen

### Software-Anforderungen

- **Node.js** ≥ 20.0.0 ([Download](https://nodejs.org/))
- **.NET SDK** ≥ 10.0 ([Download](https://dotnet.microsoft.com/download))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Azure Functions Core Tools** v4 ([Anleitung](https://learn.microsoft.com/azure/azure-functions/functions-run-local))
- **Git** ([Download](https://git-scm.com/downloads))

### Optional

- **Visual Studio Code** mit Extensions:
  - Azure Functions
  - C# Dev Kit
  - ESLint
  - Azurite (alternativ zu Docker)

## Installation

### 1. Repository klonen

```bash
git clone https://github.com/Eagles-Jungscharen/ct-service-survey.git
cd ct-service-survey
```

### 2. Dependencies installieren

**Root + Frontend + Shared:**

```bash
npm install
```

**Backend (.NET):**

```bash
cd packages/backend
dotnet restore
cd ../..
```

### 3. Umgebungsvariablen konfigurieren

Kopiere die Beispiel-Datei und passe die Werte an:

```bash
cp .env.example .env.local
```

Bearbeite `.env.local` mit deinen Konfigurationswerten:

#### Frontend-Variablen (VITE_* Prefix)

```env
VITE_OIDC_AUTHORITY=https://authentication.your-church.church.tools/api/oidc
VITE_OIDC_CLIENT_ID=your-client-id
VITE_OIDC_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
VITE_API_BASE_URL=http://localhost:7072
```

#### Backend-Variablen

```env
AzureWebJobsStorage=UseDevelopmentStorage=true
FUNCTIONS_WORKER_RUNTIME=dotnet-isolated
CHURCHTOOL_URL=https://your-church.church.tools
OIDC_AUTHORITY_URL=https://authentication.your-church.church.tools/api/oidc
CHURCHTOOL_ADMIN_GROUP_ID=your-admin-group-id
SURVEY_STORAGE_CONNECTION_STRING=UseDevelopmentStorage=true
```

#### Environment-Sync ausführen

```bash
npm run sync:env
```

Dieser Befehl synchronisiert die Werte aus `.env.local` nach:
- `packages/frontend/.env.local`
- `packages/backend/local.settings.json`

### 4. Azurite starten (Azure Storage Emulator)

**Option A: Docker Compose (empfohlen)**

```bash
cd infrastructure/local
docker compose up -d
cd ../..
```

**Option B: VS Code Extension**

1. Installiere die "Azurite" Extension
2. Cmd+Shift+P → "Azurite: Start"

### 5. Shared Package builden

```bash
npm run build:shared
```

## Development Server starten

Öffne **drei separate Terminal-Fenster**:

### Terminal 1: Frontend

```bash
npm run dev:frontend
```

Die Applikation läuft auf: **http://localhost:5173**

### Terminal 2: Backend

```bash
npm run dev:backend
```

Die Azure Functions laufen auf: **http://localhost:7072**

API-Endpunkte:
- Health Check: http://localhost:7072/api/health
- Weitere Endpoints folgen

### Terminal 3: Shared Watch (optional)

Wenn du an den Shared Types arbeitest:

```bash
cd packages/shared
npm run watch
```

## Verifizierung

### 1. Frontend

Öffne [http://localhost:5173](http://localhost:5173) im Browser.
Du solltest die Willkommensseite sehen.

### 2. Backend

Teste den Health-Endpunkt:

```bash
curl http://localhost:7072/api/health
```

Erwartete Antwort:

```json
{
  "status": "healthy",
  "service": "ct-service-survey"
}
```

### 3. Azurite

Überprüfe, ob Azurite läuft:

```bash
docker ps | grep azurite
```

oder nutze Azure Storage Explorer und verbinde dich mit lokalem Emulator.

## Troubleshooting

### "npm install" schlägt fehl

- Stelle sicher, dass Node.js ≥ 20.0.0 installiert ist: `node --version`
- Lösche `node_modules/` und `package-lock.json`, dann erneut `npm install`

### ".NET restore" schlägt fehl

- Stelle sicher, dass .NET SDK ≥ 10.0 installiert ist: `dotnet --version`
- Überprüfe NuGet-Paketquellen: `dotnet nuget list source`

### Backend startet nicht

- Überprüfe, ob Port 7072 bereits belegt ist
- Stelle sicher, dass `local.settings.json` existiert (von sync:env erstellt)
- Überprüfe Azure Functions Core Tools: `func --version`

### Azurite startet nicht

- Überprüfe, ob Docker läuft: `docker ps`
- Überprüfe, ob Ports 10000-10002 verfügbar sind
- Lösche alte Container: `docker compose down -v`

### Frontend kann Backend nicht erreichen

- Überprüfe CORS-Einstellungen in `packages/backend/local.settings.json`
- Stelle sicher, dass `VITE_API_BASE_URL` korrekt gesetzt ist
- Überprüfe Browser-Console für CORS-Fehler

## Nächste Schritte

- [Architektur verstehen](ARCHITECTURE.md)
- [API-Dokumentation lesen](API.md)
- Code beitragen (siehe Root README.md)
- [Deployment vorbereiten](DEPLOYMENT.md)

## Weitere Ressourcen

- [Node.js Dokumentation](https://nodejs.org/docs/)
- [.NET Dokumentation](https://learn.microsoft.com/dotnet/)
- [Azure Functions Dokumentation](https://learn.microsoft.com/azure/azure-functions/)
- [React Dokumentation](https://react.dev/)
- [Vite Dokumentation](https://vite.dev/)
