# Lokale Entwicklungsumgebung

Dieses Verzeichnis enthält die Docker Compose-Konfiguration für die lokale Entwicklung.

## Azurite (Azure Storage Emulator)

Azurite ist ein lokaler Azure Storage Emulator, der Blob, Queue und Table Storage bereitstellt.

### Starten

```bash
cd infrastructure/local
docker compose up -d
```

### Stoppen

```bash
cd infrastructure/local
docker compose down
```

### Daten löschen

```bash
cd infrastructure/local
docker compose down -v
```

## Ports

- **10000**: Blob Service
- **10001**: Queue Service
- **10002**: Table Storage

## Connection String

Für lokale Entwicklung verwenden Sie:

```
UseDevelopmentStorage=true
```

oder explizit:

```
DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;QueueEndpoint=http://127.0.0.1:10001/devstoreaccount1;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;
```

## Alternativen

Statt Docker Compose können Sie auch:

1. **Azurite VS Code Extension** verwenden (Cmd+Shift+P → "Azurite: Start")
2. **Azure Storage Explorer** mit lokalem Emulator verwenden
