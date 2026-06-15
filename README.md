# ChurchTool Service Survey Tool

> Ein Terminumfrage-System für ChurchTools-Dienste mit React-Frontend, .NET-Backend und Azure-Integration.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green)
![.NET](https://img.shields.io/badge/.NET-10.0-purple)

## 📋 Übersicht

Das ChurchTool Service Survey Tool ist eine webbasierte Anwendung zur Erstellung und Verwaltung von Terminumfragen für ChurchTools-Dienste. Teamleiter können Umfragen für spezifische Dienste und Termine erstellen, Mitarbeiter geben ihre Verfügbarkeit an, und die finale Einteilung wird vom Teamleiter vorgenommen.

### Hauptfunktionen

- ✅ **Umfrageerstellung**: Intuitive Benutzeroberfläche für Teamleiter zur Erstellung von Terminumfragen
- 📅 **Terminverwaltung**: Flexible Definition von Diensten und Terminen
- 👥 **Mitarbeiter-Einladung**: Einfaches Einladen von ChurchTools-Benutzern
- ✍️ **Verfügbarkeitserfassung**: Mitarbeiter können ihre Verfügbarkeit für Termine angeben
- 📊 **Einteilungsverwaltung**: Teamleiter können basierend auf Rückmeldungen Mitarbeiter einteilen
- 🔐 **ChurchTools-Integration**: Authentifizierung via OIDC und API-Integration für Dienste/Mitarbeiter
- 👨‍💼 **Admin-Funktionen**: Erweiterte Verwaltungsrechte für Teamleiter
- 💾 **Cloud-Speicherung**: Persistente Datenspeicherung in Azure Table Storage

## 🏗️ Monorepo-Struktur

Dieses Projekt ist als Monorepo organisiert mit npm workspaces:

```
ct-service-survey/
├── packages/
│   ├── frontend/         # React + Vite Frontend
│   ├── backend/          # .NET Azure Functions Backend
│   └── shared/           # Gemeinsame TypeScript-Typen (DTOs)
├── infrastructure/       # Docker Compose, IaC (Bicep)
├── docs/                 # Projektdokumentation
├── scripts/              # Build- und Deployment-Scripts
├── .github/workflows/    # CI/CD Pipelines
└── package.json          # Root workspace configuration
```

### Packages

| Package | Beschreibung | Technologien |
|---------|--------------|--------------|
| **Frontend** | Benutzeroberfläche | React 19, TypeScript, Vite, Fluent UI |
| **Backend** | REST API | .NET 10, Azure Functions, Table Storage |
| **Shared** | Type-Definitionen | TypeScript |

## 🚀 Quick Start

### Voraussetzungen

- Node.js ≥ 20.0.0
- .NET SDK ≥ 10.0
- Docker Desktop (für Azurite)
- Azure Functions Core Tools v4

### Installation

1. **Repository klonen**

```bash
git clone https://github.com/Eagles-Jungscharen/ct-service-survey.git
cd ct-service-survey
```

2. **Dependencies installieren**

```bash
npm install
cd packages/backend && dotnet restore && cd ../..
```

3. **Umgebungsvariablen konfigurieren**

```bash
cp .env.example .env.local
# Bearbeite .env.local mit deinen Konfigurationswerten
npm run sync:env
```

Der Sync schreibt die Werte nach `packages/frontend/.env.local` und `packages/backend/local.settings.json`.

4. **Azurite starten** (Azure Storage Emulator)

```bash
cd infrastructure/local
docker compose up -d
cd ../..
```

5. **Shared Package builden**

```bash
npm run build:shared
```

### Development Server starten

Öffne drei separate Terminal-Fenster:

**Terminal 1 - Frontend:**

```bash
npm run dev:frontend
# Läuft auf http://localhost:5173
```

**Terminal 2 - Backend:**

```bash
npm run dev:backend
# Läuft auf http://localhost:7072
```

**Terminal 3 - Shared Watch (optional):**

```bash
cd packages/shared
npm run watch
```

Öffne die Anwendung im Browser: [http://localhost:5173](http://localhost:5173/)

## 📚 Dokumentation

Umfassende Dokumentation findest du im `/docs` Verzeichnis:

- [SETUP.md](docs/SETUP.md) - Entwicklungsumgebung einrichten
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System-Architektur und Design
- [API.md](docs/API.md) - Backend API-Dokumentation
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deployment-Prozess

## 🛠️ Entwicklung

### Verfügbare Scripts

Im Root-Verzeichnis:

```bash
# Frontend
npm run sync:env          # Root .env.local in Frontend/Backend synchronisieren
npm run dev:frontend       # Frontend Dev-Server starten
npm run build:frontend     # Frontend für Production bauen

# Backend
npm run dev:backend        # Backend (Azure Functions) starten
npm run build:backend      # Backend kompilieren

# Shared
npm run build:shared       # Shared Types kompilieren

# Alle Packages
npm run build:all          # Alle Packages bauen
npm run lint               # Alle Packages linten
npm run clean              # Build-Artefakte löschen
```

### Typen hinzufügen oder ändern

1. Typen in `packages/shared/src/types/` bearbeiten
2. Shared Package neu bauen: `npm run build:shared`
3. Frontend holt sich automatisch die neuen Typen
4. Backend C# DTOs müssen manuell synchronisiert werden

### Packages hinzufügen

**Frontend:**

```bash
npm install <package> --workspace=@ct-service-survey/frontend
```

**Shared:**

```bash
npm install <package> --workspace=@ct-service-survey/shared
```

**Backend:**

```bash
cd packages/backend
dotnet add package <PackageName>
```

## 🧪 Testing

(Wird noch implementiert)

```bash
# Frontend Tests
npm run test:frontend

# Backend Tests
npm run test:backend
```

## 📦 Build & Deployment

### Production Build

```bash
npm run build:all
```

Dies baut:

- Frontend → `packages/frontend/dist/`
- Backend → `packages/backend/bin/Release/`
- Shared → `packages/shared/dist/`

### Deployment

Siehe [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) für detaillierte Deployment-Anweisungen zu Azure.

## 🏛️ Architektur

Das System besteht aus drei Hauptkomponenten:

1. **Frontend (React)**: Single-Page-Application mit React Router, Fluent UI Design System
2. **Backend (Azure Functions)**: Serverless REST API mit .NET 10 Isolated Worker
3. **Storage (Azure Table Storage)**: NoSQL-Datenbank für Umfragen, Rückmeldungen und Einteilungen

**Authentifizierung:** OIDC via ChurchTool IDP

Siehe [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) für Details.

## 🤝 Contributing

Contributions sind willkommen! Bitte beachte:

1. Code-Style gemäss ESLint/TypeScript-Konfiguration
2. Typen in `@ct-service-survey/shared` mit Backend-DTOs synchronisieren
3. Dokumentation bei Änderungen aktualisieren
4. Lokales Testen vor dem Push

## 📋 Projekt-Status

### ✅ Implementiert

- Monorepo-Struktur mit npm workspaces
- Basis-Konfiguration für Frontend, Backend und Shared
- Environment-Synchronisation
- Lokale Entwicklungsumgebung mit Azurite

### 🚧 In Arbeit

- Frontend mit React, TypeScript, Vite
- Backend mit .NET 10 Azure Functions
- ChurchTools OIDC-Authentifizierung
- Umfrage-CRUD-Operationen
- Verfügbarkeitserfassung
- Einteilungsverwaltung

### 🔮 Geplant

- Unit & Integration Tests
- CI/CD mit GitHub Actions
- Azure Deployment (IaC mit Bicep)
- E-Mail-Benachrichtigungen
- Dashboard für Teamleiter
- PDF/Excel-Export

## 📄 Lizenz

Dieses Projekt ist lizenziert unter der [Apache License 2.0](LICENSE).

## 👥 Team

EaglesJungscharen

## 📞 Support

- Dokumentation: [/docs](docs)
- Issues: [GitHub Issues](https://github.com/Eagles-Jungscharen/ct-service-survey/issues)

## 🔗 Links

- [ChurchTool](https://www.church.tools/)
- [Azure Functions](https://azure.microsoft.com/services/functions/)
- [React](https://react.dev/)
- [Vite](https://vite.dev/)
- [Fluent UI](https://react.fluentui.dev/)

---

Made with ❤️ for the ChurchTool Community
Applikation zur Planung von Einsätzen in einer Kirche via Churchtools
