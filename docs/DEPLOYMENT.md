# Deployment-Guide

Anleitung zum Deployment des ChurchTool Service Survey Tools auf Azure.

## Übersicht

Das Deployment erfolgt in zwei Schritten:
1. **Infrastructure Deployment**: Erstellen der Azure-Ressourcen via Bicep
2. **Code Deployment**: Deployen von Frontend und Backend

## Voraussetzungen

### Tools

- **Azure CLI** ([Installation](https://learn.microsoft.com/cli/azure/install-azure-cli))
- **PowerShell** 7+ (für Deployment-Scripts)
- **Node.js** ≥ 20.0.0
- **.NET SDK** ≥ 10.0
- **Azure Functions Core Tools** v4

### Azure-Ressourcen

- Azure-Subscription mit ausreichenden Berechtigungen
- Resource Group (kann vom Script erstellt werden)

## Azure-Konfiguration

### 1. Azure CLI Login

```bash
az login
az account set --subscription "Your-Subscription-ID"
```

### 2. Resource Group erstellen (optional)

```bash
az group create \
  --name rg-ct-service-survey \
  --location westeurope
```

## Infrastructure Deployment

### Bicep-Templates

Die Bicep-Templates befinden sich in `infrastructure/azure/`:

- `main.bicep` - Haupt-Template
- `modules/storage-static-website.bicep` - Frontend Static Website
- `modules/storage-data.bicep` - Table Storage für Daten
- `modules/function-app.bicep` - Azure Functions Backend
- `modules/monitoring.bicep` - Application Insights + Log Analytics

### Deployment durchführen

**Option A: PowerShell-Script (empfohlen)**

```powershell
cd infrastructure/scripts
./deploy.ps1 `
  -ResourceGroupName "rg-ct-service-survey" `
  -Location "westeurope" `
  -Environment "dev"
```

Das Script:
1. Validiert die Bicep-Templates
2. Erstellt/aktualisiert Azure-Ressourcen
3. Schreibt Deployment-Outputs nach `infrastructure.local`

**Option B: Manuell via Azure CLI**

```bash
cd infrastructure/azure

# Template kompilieren
az bicep build --file main.bicep

# Deployment durchführen
az deployment group create \
  --resource-group rg-ct-service-survey \
  --template-file main.bicep \
  --parameters environment=dev
```

### Deployment-Outputs

Nach erfolgreichem Deployment werden folgende Informationen ausgegeben:

- `frontendUrl` - URL der Frontend Static Website
- `functionAppName` - Name der Function App
- `functionAppUrl` - URL der Function App
- `storageAccountName` - Name des Storage Accounts

Diese Werte werden in `infrastructure.local` gespeichert.

## Code Deployment

### Frontend

**Lokales Build:**

```bash
npm run build:frontend
```

Dies erstellt `packages/frontend/dist/` mit dem produktionsbereiten Frontend.

**Deployment via Azure CLI:**

```bash
az storage blob upload-batch \
  --account-name <storage-account-name> \
  --destination '$web' \
  --source packages/frontend/dist \
  --auth-mode login \
  --overwrite
```

**Deployment via PowerShell-Script:**

```powershell
cd infrastructure/scripts
./deploy-code.ps1 -Target Frontend
```

### Backend

**Lokales Build:**

```bash
npm run build:backend
```

Dies kompiliert das .NET-Projekt nach `packages/backend/bin/Release/`.

**Deployment via Azure Functions Core Tools:**

```bash
cd packages/backend
func azure functionapp publish <function-app-name>
```

**Deployment via PowerShell-Script:**

```powershell
cd infrastructure/scripts
./deploy-code.ps1 -Target Backend
```

### Komplettes Deployment

Deployment von Frontend und Backend in einem Schritt:

```powershell
cd infrastructure/scripts
./deploy-code.ps1 -Target All
```

## Umgebungsvariablen (Production)

### Frontend (.env.production)

Erstelle `packages/frontend/.env.production`:

```env
VITE_OIDC_AUTHORITY=https://authentication.your-church.church.tools/api/oidc
VITE_OIDC_CLIENT_ID=your-production-client-id
VITE_OIDC_REDIRECT_URI=https://your-app.azurewebsites.net/auth/callback
VITE_OIDC_POST_LOGOUT_REDIRECT_URI=https://your-app.azurewebsites.net
VITE_API_BASE_URL=https://your-function-app.azurewebsites.net
```

### Backend (Application Settings)

Konfiguriere über Azure Portal oder CLI:

```bash
az functionapp config appsettings set \
  --name <function-app-name> \
  --resource-group <resource-group> \
  --settings \
    CHURCHTOOL_URL="https://your-church.church.tools" \
    OIDC_AUTHORITY_URL="https://authentication.your-church.church.tools/api/oidc" \
    CHURCHTOOL_ADMIN_GROUP_ID="your-admin-group-id" \
    SURVEY_STORAGE_CONNECTION_STRING="<connection-string>"
```

**Connection String für Storage:**

```bash
az storage account show-connection-string \
  --name <storage-account-name> \
  --resource-group <resource-group> \
  --output tsv
```

## CI/CD mit GitHub Actions

### Workflow-Datei

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build Shared
        run: npm run build:shared
      
      - name: Build Frontend
        run: npm run build:frontend
      
      - name: Build Backend
        run: npm run build:backend
      
      - name: Deploy Frontend
        uses: azure/CLI@v1
        with:
          inlineScript: |
            az storage blob upload-batch \
              --account-name ${{ secrets.AZURE_STORAGE_ACCOUNT }} \
              --destination '$web' \
              --source packages/frontend/dist \
              --auth-mode login \
              --overwrite
      
      - name: Deploy Backend
        uses: Azure/functions-action@v1
        with:
          app-name: ${{ secrets.AZURE_FUNCTION_APP_NAME }}
          package: packages/backend/bin/Release/net10.0
```

### GitHub Secrets

Konfiguriere folgende Secrets im Repository:

- `AZURE_CREDENTIALS` - Service Principal JSON
- `AZURE_STORAGE_ACCOUNT` - Storage Account Name
- `AZURE_FUNCTION_APP_NAME` - Function App Name

## Verifizierung

### 1. Frontend-Deployment

```bash
curl https://your-app.azurewebsites.net
```

Sollte die React-App zurückgeben.

### 2. Backend-Deployment

```bash
curl https://your-function-app.azurewebsites.net/api/health
```

Erwartete Antwort:
```json
{
  "status": "healthy",
  "service": "ct-service-survey"
}
```

### 3. Application Insights

Überprüfe Telemetrie im Azure Portal:
1. Navigiere zur Function App
2. Öffne "Application Insights"
3. Überprüfe Logs und Performance-Metriken

## Troubleshooting

### Frontend lädt nicht

- Überprüfe Static Website-Konfiguration im Storage Account
- Stelle sicher, dass `$web` Container öffentlich zugänglich ist
- Überprüfe CORS-Einstellungen

### Backend-Fehler

- Überprüfe Application Settings in der Function App
- Überprüfe Connection Strings (Table Storage)
- Überprüfe Application Insights für Error-Logs

### CORS-Fehler

Konfiguriere CORS in der Function App:

```bash
az functionapp cors add \
  --name <function-app-name> \
  --resource-group <resource-group> \
  --allowed-origins https://your-app.azurewebsites.net
```

## Rollback

### Frontend

Upload einer vorherigen Version:

```bash
az storage blob upload-batch \
  --account-name <storage-account-name> \
  --destination '$web' \
  --source <previous-build-folder> \
  --overwrite
```

### Backend

Deploy eines vorherigen Builds:

```bash
cd packages/backend
func azure functionapp publish <function-app-name> --slot <slot-name>
```

oder nutze Azure Portal "Deployment Slots" für Blue-Green Deployments.

## Monitoring & Wartung

### Application Insights Queries

**Fehlerrate:**
```kusto
requests
| where timestamp > ago(1h)
| summarize ErrorRate = countif(success == false) * 100.0 / count()
```

**Langsame Requests:**
```kusto
requests
| where timestamp > ago(1h)
| where duration > 1000
| order by duration desc
```

### Kosten optimieren

- Nutze Consumption Plan für Functions (Pay-per-Use)
- Aktiviere Lifecycle Management für Blob Storage
- Überwache Table Storage-Nutzung

## Weitere Ressourcen

- [Azure Functions Deployment](https://learn.microsoft.com/azure/azure-functions/functions-deployment-technologies)
- [Azure Static Web Apps](https://learn.microsoft.com/azure/static-web-apps/)
- [Bicep Dokumentation](https://learn.microsoft.com/azure/azure-resource-manager/bicep/)
- [Application Insights](https://learn.microsoft.com/azure/azure-monitor/app/app-insights-overview)

## Nächste Schritte

- Custom Domain konfigurieren
- SSL-Zertifikat einrichten
- CDN für Frontend aktivieren
- Auto-Scaling konfigurieren
