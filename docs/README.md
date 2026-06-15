# Dokumentation

Willkommen zur Dokumentation des ChurchTool Service Survey Tools.

## Inhaltsverzeichnis

### 🚀 [Setup-Anleitung](SETUP.md)

Schritt-für-Schritt-Anleitung zur Einrichtung der lokalen Entwicklungsumgebung.

**Inhalte:**
- Voraussetzungen (Node.js, .NET, Docker, etc.)
- Installation von Dependencies
- Umgebungsvariablen konfigurieren
- Azurite starten
- Development Server starten
- Troubleshooting

### 🏛️ [Architektur](ARCHITECTURE.md)

Detaillierte Beschreibung der System-Architektur und Designentscheidungen.

**Inhalte:**
- Komponentenübersicht (Frontend, Backend, Shared)
- Authentifizierung & Autorisierung (OIDC)
- Datenmodell (Entitäten und Beziehungen)
- ChurchTools-Integration
- Deployment-Architektur auf Azure
- Sicherheitsaspekte
- Performance-Überlegungen
- Monitoring & Logging

### 📡 [API-Dokumentation](API.md)

Vollständige REST API-Referenz für das Backend.

**Inhalte:**
- Authentifizierung
- Health Check
- User Management (`/api/me`)
- Surveys (`/api/surveys`, `/api/admin/surveys`)
- Responses (`/api/surveys/{id}/responses`)
- Assignments (`/api/admin/assignments`, `/api/assignments/me`)
- Services (`/api/services`)
- Fehlerbehandlung
- HTTP-Status-Codes

### 🚢 [Deployment-Guide](DEPLOYMENT.md)

Anleitung zum Deployment auf Azure.

**Inhalte:**
- Voraussetzungen (Azure CLI, Tools)
- Infrastructure Deployment (Bicep)
- Code Deployment (Frontend + Backend)
- Umgebungsvariablen (Production)
- CI/CD mit GitHub Actions
- Verifizierung
- Troubleshooting
- Rollback-Strategien
- Monitoring

## Quick Links

### Für Entwickler

1. **Erste Schritte:** [Setup-Anleitung](SETUP.md)
2. **Architektur verstehen:** [Architektur](ARCHITECTURE.md)
3. **API nutzen:** [API-Dokumentation](API.md)
4. **Code-Beiträge:** Siehe Root [README.md](../README.md)

### Für DevOps/Admins

1. **Deployment:** [Deployment-Guide](DEPLOYMENT.md)
2. **Monitoring:** [Architektur > Monitoring](ARCHITECTURE.md#monitoring--logging)
3. **Sicherheit:** [Architektur > Sicherheit](ARCHITECTURE.md#sicherheitsaspekte)

## Technologie-Stack

- **Frontend:** React 19, TypeScript, Vite 8, Fluent UI 9, TanStack Query 5
- **Backend:** .NET 10, Azure Functions v4, ASP.NET Core
- **Datenbank:** Azure Table Storage
- **Auth:** ChurchTools OIDC (OpenID Connect)
- **DevOps:** Bicep (IaC), GitHub Actions (CI/CD)
- **Monitoring:** Application Insights

## Projekt-Struktur

```
ct-service-survey/
├── packages/
│   ├── frontend/         # React + Vite Frontend
│   ├── backend/          # .NET Azure Functions Backend
│   └── shared/           # TypeScript DTOs
├── infrastructure/
│   ├── local/            # Docker Compose (Azurite)
│   ├── azure/            # Bicep-Templates
│   └── scripts/          # Deployment-Scripts
├── docs/                 # Diese Dokumentation
└── scripts/              # Build-Scripts (sync-env)
```

## Support & Kontakt

- **Issues:** [GitHub Issues](https://github.com/Eagles-Jungscharen/ct-service-survey/issues)
- **Team:** EaglesJungscharen

## Lizenz

Dieses Projekt ist lizenziert unter der [Apache License 2.0](../LICENSE).

---

**Version:** 1.0.0  
**Letztes Update:** 2026-06-15
