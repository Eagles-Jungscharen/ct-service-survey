# API-Dokumentation

REST API-Dokumentation für das ChurchTool Service Survey Tool Backend.

## Base URL

**Lokal:** `http://localhost:7072`  
**Production:** `https://your-function-app.azurewebsites.net`

## Authentifizierung

Alle API-Endpunkte (außer `/api/health`) erfordern einen gültigen JWT Bearer Token.

```http
Authorization: Bearer {access_token}
```

Token wird vom ChurchTools OIDC-Provider ausgestellt.

## Endpunkte

### Health Check

#### `GET /api/health`

Überprüft die Verfügbarkeit des Backend-Services.

**Authentifizierung:** Keine

**Response:**
```json
{
  "status": "healthy",
  "service": "ct-service-survey"
}
```

---

### User Management

#### `GET /api/me`

Gibt Informationen über den aktuell eingeloggten Benutzer zurück.

**Authentifizierung:** Erforderlich

**Response:**
```json
{
  "userId": "12345",
  "displayName": "Max Mustermann",
  "email": "max@example.com",
  "isAdmin": true,
  "groups": [
    {
      "id": "1",
      "name": "Teamleiter"
    }
  ]
}
```

---

### Surveys (Umfragen)

#### `GET /api/surveys`

Liste aller Umfragen (Admin: alle, User: nur aktive).

**Authentifizierung:** Erforderlich

**Query Parameters:**
- `status` (optional): Filter nach Status (`Draft`, `Active`, `Closed`)

**Response:**
```json
[
  {
    "id": "survey-123",
    "name": "Gottesdienst-Umfrage Juli",
    "description": "Verfügbarkeit für Gottesdienste im Juli",
    "createdBy": "12345",
    "createdByName": "Max Mustermann",
    "status": "Active",
    "createdAt": "2026-06-01T10:00:00Z",
    "updatedAt": "2026-06-01T10:00:00Z",
    "dates": [
      {
        "id": "date-1",
        "surveyId": "survey-123",
        "date": "2026-07-07T09:30:00Z",
        "serviceType": "worship-leader",
        "serviceTypeName": "Lobpreis",
        "requiredPeople": 2,
        "notes": "Band-Setup ab 8:30"
      }
    ]
  }
]
```

#### `GET /api/surveys/{id}`

Einzelne Umfrage abrufen.

**Authentifizierung:** Erforderlich

**Response:** Siehe `GET /api/surveys` (einzelnes Objekt)

#### `POST /api/admin/surveys`

Neue Umfrage erstellen (nur Admin).

**Authentifizierung:** Erforderlich (Admin)

**Request Body:**
```json
{
  "name": "Gottesdienst-Umfrage Juli",
  "description": "Verfügbarkeit für Gottesdienste im Juli",
  "status": "Draft",
  "dates": [
    {
      "date": "2026-07-07T09:30:00Z",
      "serviceType": "worship-leader",
      "requiredPeople": 2,
      "notes": "Band-Setup ab 8:30"
    }
  ]
}
```

**Response:** Erstellte Survey (siehe `GET /api/surveys/{id}`)

**Status Codes:**
- `201 Created` - Erfolgreich erstellt
- `400 Bad Request` - Validierungsfehler
- `401 Unauthorized` - Nicht authentifiziert
- `403 Forbidden` - Keine Admin-Rechte

#### `PUT /api/admin/surveys/{id}`

Umfrage aktualisieren (nur Admin).

**Authentifizierung:** Erforderlich (Admin)

**Request Body:** Siehe `POST /api/admin/surveys`

**Response:** Aktualisierte Survey

#### `DELETE /api/admin/surveys/{id}`

Umfrage löschen (nur Admin, nur Drafts).

**Authentifizierung:** Erforderlich (Admin)

**Response:** `204 No Content`

---

### Responses (Rückmeldungen)

#### `GET /api/surveys/{surveyId}/responses`

Alle Rückmeldungen zu einer Umfrage (Admin: alle, User: nur eigene).

**Authentifizierung:** Erforderlich

**Response:**
```json
[
  {
    "id": "response-456",
    "surveyId": "survey-123",
    "userId": "12345",
    "userName": "Max Mustermann",
    "availability": [
      {
        "serviceDateId": "date-1",
        "available": true,
        "notes": "Kann beide Termine"
      }
    ],
    "submittedAt": "2026-06-02T14:30:00Z",
    "updatedAt": "2026-06-02T14:30:00Z"
  }
]
```

#### `POST /api/surveys/{surveyId}/responses`

Eigene Rückmeldung einreichen oder aktualisieren.

**Authentifizierung:** Erforderlich

**Request Body:**
```json
{
  "surveyId": "survey-123",
  "availability": [
    {
      "serviceDateId": "date-1",
      "available": true,
      "notes": "Kann beide Termine"
    }
  ]
}
```

**Response:** Erstellte/Aktualisierte Response

**Status Codes:**
- `200 OK` - Aktualisiert
- `201 Created` - Neu erstellt
- `400 Bad Request` - Validierungsfehler
- `404 Not Found` - Umfrage nicht gefunden

---

### Assignments (Einteilungen)

#### `GET /api/admin/assignments/{surveyId}`

Alle Einteilungen zu einer Umfrage (nur Admin).

**Authentifizierung:** Erforderlich (Admin)

**Response:**
```json
[
  {
    "id": "assignment-789",
    "serviceDateId": "date-1",
    "surveyId": "survey-123",
    "userId": "12345",
    "userName": "Max Mustermann",
    "serviceType": "worship-leader",
    "serviceTypeName": "Lobpreis",
    "date": "2026-07-07T09:30:00Z",
    "confirmedAt": null,
    "notes": "Lead-Gitarre",
    "createdBy": "admin-user",
    "createdAt": "2026-06-05T10:00:00Z"
  }
]
```

#### `POST /api/admin/assignments`

Einteilungen erstellen (nur Admin).

**Authentifizierung:** Erforderlich (Admin)

**Request Body:**
```json
{
  "surveyId": "survey-123",
  "assignments": [
    {
      "serviceDateId": "date-1",
      "userId": "12345",
      "notes": "Lead-Gitarre"
    }
  ]
}
```

**Response:** Array der erstellten Assignments

#### `DELETE /api/admin/assignments/{id}`

Einteilung löschen (nur Admin).

**Authentifizierung:** Erforderlich (Admin)

**Response:** `204 No Content`

#### `GET /api/assignments/me`

Eigene Einteilungen abrufen.

**Authentifizierung:** Erforderlich

**Response:** Array der eigenen Assignments (siehe `GET /api/admin/assignments`)

---

### Services (Dienste)

#### `GET /api/services`

Liste aller verfügbaren Dienste (aus ChurchTools).

**Authentifizierung:** Erforderlich

**Response:**
```json
[
  {
    "id": "worship-leader",
    "name": "Lobpreis",
    "churchToolsServiceId": "5",
    "description": "Lobpreis-Team",
    "isActive": true
  }
]
```

---

## Fehlerbehandlung

### Fehlerformat

```json
{
  "message": "Validation failed",
  "code": 1002,
  "details": "Field 'name' is required"
}
```

### Standard-Fehler-Codes

| Code | Beschreibung |
|------|-------------|
| `1001` | Nicht authentifiziert |
| `1002` | Validierungsfehler |
| `1003` | Keine Berechtigung (nicht Admin) |
| `1004` | Ressource nicht gefunden |
| `1005` | Konflikt (z.B. doppelte Einteilung) |

### HTTP-Status-Codes

- `200 OK` - Erfolgreiche Abfrage
- `201 Created` - Ressource erfolgreich erstellt
- `204 No Content` - Erfolgreiche Löschung
- `400 Bad Request` - Validierungsfehler
- `401 Unauthorized` - Nicht authentifiziert
- `403 Forbidden` - Keine Berechtigung
- `404 Not Found` - Ressource nicht gefunden
- `409 Conflict` - Konflikt bei Erstellung
- `500 Internal Server Error` - Server-Fehler

## Rate Limiting

_(Geplant für zukünftige Versionen)_

## Versionierung

Aktuell: `v1` (implizit in allen Routen)

## Weitere Ressourcen

- [Architektur-Dokumentation](ARCHITECTURE.md)
- [Setup-Anleitung](SETUP.md)
- [Deployment-Guide](DEPLOYMENT.md)
