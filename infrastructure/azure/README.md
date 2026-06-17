# Azure Infrastructure

Dieses Verzeichnis wird die Bicep-Templates für das Azure-Deployment enthalten.

## Geplante Module

- `main.bicep` - Haupt-Deployment-Template
- `modules/storage-static-website.bicep` - Frontend Static Website Hosting
- `modules/storage-data.bicep` - Table Storage für Daten
- `modules/function-app.bicep` - Azure Functions Backend
- `modules/monitoring.bicep` - Application Insights + Log Analytics
- `modules/cdn.bicep` - Optional: Azure CDN für Custom Domain

## Deployment

## Bereitstellen mit Bicep

Aus dem Repository-Root:

```bash
az deployment group create \
   --resource-group <your-resource-group> \
   --template-file infrastructure/azure/main.bicep \
   --parameters environmentName=prod prefix=ctsurvey
```

Optionale Parameter in `main.bicep`:
- `enableCdn` (Standard: `true`)
- `frontendCustomDomain` (standardmäßig leer)
- explizite Ressourcennamen, wenn keine automatisch generierten Namen gewünscht sind

Static Website nach der Bereitstellung aktivieren (erforderlich für Blob Static Website Hosting):

```bash
az storage blob service-properties update \
   --account-name <frontend-storage-account-name> \
   --static-website \
   --index-document index.html \
   --404-document index.html
```

## Architekturhinweise

### Hosting-Entscheidung Frontend: Blob Storage Static Website

**Warum Blob Storage statt Azure Static Web Apps:**
- ✅ **Einfachheit**: Keine verwaltete Functions-Integration nötig (es gibt eine separate Function App)
- ✅ **Kosten**: Geringere Kosten bei kleinerem Deployment
- ✅ **Kontrolle**: Volle Kontrolle über CDN- und Caching-Konfiguration
- ✅ **Trennung**: Klare Trennung zwischen Frontend- und Backend-Deployments

**Abwägungen:**
- ⚠️ Benutzerdefinierte Domain erfordert Azure CDN (separate Ressource)
- ⚠️ Kein integriertes CI/CD (stattdessen GitHub Actions nutzen)
- ⚠️ Keine Preview-Umgebungen (manuelles Staging-Setup bei Bedarf)

### DNS-Konfiguration

Für benutzerdefinierte Domains werden zwei separate DNS-Einträge benötigt:
- **Frontend**: CNAME zum CDN-Endpunkt (z. B. billing.feg-effretikon.ch → CDN)
- **Backend**: CNAME zur Function App (z. B. api-billing.feg-effretikon.ch → Function App)

Siehe [setup-custom-domains.ps1](../scripts/setup-custom-domains.ps1) - Hinweis: Das Skript muss für CDN statt Static Web App angepasst werden.

## Zukünftige Erweiterungen

- CI/CD-Integration mit GitHub Actions
   - Separate Workflows für Frontend (Blob Storage) und Backend (Function App)
- Unterstützung mehrerer Umgebungen (dev, staging, production)
   - Separate Storage Accounts pro Umgebung
- Automatisierte Backups und Disaster Recovery
- Kostenoptimierung
   - CDN-Tier prüfen (Standard Microsoft ist am günstigsten)
   - Für fortgeschrittene Szenarien Azure Front Door in Betracht ziehen
- Sicherheits-Härtung
   - Private Endpoints für Function App und Storage
   - VNet-Integration für das Backend
   - WAF-Regeln auf CDN/Front Door

