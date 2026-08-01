# Phase 4 - Authentication & Authorization

## Implementierungsübersicht

### Frontend (OIDC-Integration)

**Komponenten:**
- `AuthContext.tsx` - Auth-Hooks (useUserInfo, useRequireAuth, useRequireAdmin)
- `ProtectedRoute.tsx` - Route Guard mit Admin-Check
- `UserMenu.tsx` - Login/Logout-Komponente mit User-Info
- `CallbackPage.tsx` - OIDC-Callback-Handler
- `api/client.ts` - JWT Bearer Token in API-Requests

**Flow:**
1. Nicht-angemeldete User werden zu ChurchTools OIDC Login weitergeleitet
2. Nach erfolgreicher Anmeldung: Redirect zu `/callback`
3. Token wird extrahiert und im API-Client registriert
4. JWT wird bei jedem API-Request im `Authorization`-Header gesendet
5. Admin-Status wird aus `groups`-Claim extrahiert (ChurchTools Group ID)

**Protected Routes:**
- `/surveys/*` - Authentifizierung erforderlich
- `/my-assignments` - Authentifizierung erforderlich  
- `/admin/*` - Admin-Berechtigung erforderlich (Group ID Check)

### Backend (JWT-Validierung)

**Integration:**
- ChurchTools IDP Services Package bereits integriert
- JWT-Validierung erfolgt automatisch durch `AddChurchToolIDPServices`
- `UserContextHelper.GetUserFromClaims()` extrahiert User-Info aus JWT:
  - `userId` aus Claims: NameIdentifier / "sub" / "person_id"
  - `displayName` aus Claims: Name / "name"
  - `isAdmin` aus "groups" Claim + CHURCHTOOL_ADMIN_GROUP_ID Config

**Verwendung in Functions:**
```csharp
var (userId, displayName, isAdmin) = UserContextHelper.GetUserFromClaims(
    req.HttpContext.User, 
    _configuration
);
```

## Konfiguration

### Frontend (.env)

Kopiere `packages/frontend/.env.example` nach `packages/frontend/.env` und konfiguriere:

```env
# API Backend URL
VITE_API_BASE_URL=http://localhost:7072

# ChurchTools OIDC Configuration
VITE_OIDC_AUTHORITY=https://deine-kirche.church.tools/api/login/oauth2
VITE_OIDC_CLIENT_ID=<deine-oidc-client-id>
VITE_OIDC_REDIRECT_URI=http://localhost:5173/callback
VITE_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:5173

# ChurchTools Admin Group ID
VITE_CHURCHTOOL_ADMIN_GROUP_ID=<group-id-für-admins>
```

**OIDC Client in ChurchTools erstellen:**
1. ChurchTools Admin → Einstellungen → API
2. Neuen OAuth2 Client erstellen
3. Redirect URI: `http://localhost:5173/callback` (lokal) oder `https://deine-domain.de/callback` (prod)
4. Client ID kopieren → `VITE_OIDC_CLIENT_ID`
5. Admin-Gruppe ID ermitteln → `VITE_CHURCHTOOL_ADMIN_GROUP_ID`

### Backend (local.settings.json)

Kopiere `packages/backend/local.settings.json.example` nach `packages/backend/local.settings.json`:

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
    "CHURCHTOOL_ADMIN_GROUP_ID": "<group-id-für-admins>"
  }
}
```

## Testing

### Lokales Testing (ohne echten ChurchTools-Server)

Für Development ohne ChurchTools-Instanz:
1. OIDC-Check temporär deaktivieren in `ProtectedRoute.tsx`
2. Mock-Token im API-Client setzen
3. Backend UserContextHelper mit Test-Claims verwenden

### Integration Testing

1. Frontend starten: `npm run dev` (in packages/frontend)
2. Backend starten: `func start` (in packages/backend, benötigt Azurite)
3. Browser öffnen: `http://localhost:5173`
4. Login-Flow testen:
   - Click "Anmelden" → Weiterleitung zu ChurchTools
   - ChurchTools-Login durchführen
   - Redirect zurück zu `/callback`
   - User-Menu sollte Namen + "(Admin)" anzeigen (falls Admin-Gruppe)

### Admin-Berechtigung testen

1. Als normaler User anmelden
2. Versuche `/admin/surveys` aufzurufen
3. Erwartung: "Keine Berechtigung"-Meldung
4. Als Admin-User (in Admin-Gruppe) anmelden
5. `/admin/surveys` sollte funktionieren

## Sicherheitshinweise

⚠️ **WICHTIG für Produktion:**

1. **HTTPS erzwingen** - OIDC Redirect URIs müssen HTTPS verwenden
2. **Token-Storage** - Tokens werden im Memory gespeichert (react-oidc-context)
3. **CORS konfigurieren** - Backend muss Frontend-Domain erlauben
4. **Admin Group ID geheim halten** - Nicht im Frontend-Code hardcoden
5. **Token-Expiration** - Automatic Silent Renew ist aktiviert

## Troubleshooting

**Problem: "Anwendung wird geladen..." hängt**
- Prüfe OIDC-Config in .env
- Prüfe Browser-Console auf CORS-Fehler
- Prüfe Network-Tab für fehlgeschlagene Token-Requests

**Problem: "Keine Berechtigung" als Admin**
- Prüfe `VITE_CHURCHTOOL_ADMIN_GROUP_ID` stimmt mit ChurchTools-Gruppe überein
- Prüfe Browser DevTools → Application → Session Storage → oidc.user
- Claims-Array "groups" muss Admin-Group-ID enthalten

**Problem: API-Requests ohne Token**
- Prüfe `apiClient.setTokenGetter()` wird in `AppContent` aufgerufen
- Prüfe `auth.user?.access_token` ist gesetzt
- Prüfe Network-Tab → Request Headers → `Authorization: Bearer ...`

**Problem: Backend 401 Unauthorized**
- Prüfe Backend OIDC_AUTHORITY_URL stimmt mit Frontend überein
- Prüfe ChurchTools IDP Services sind korrekt konfiguriert
- Prüfe Token ist gültig (nicht expired)
