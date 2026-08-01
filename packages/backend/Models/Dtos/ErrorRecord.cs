namespace EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;

/// <summary>
/// Fehler-Response gemäß Repository-Konventionen
/// Error: deutsche Fehlermeldung
/// ErrorCode: numerischer Fehlercode zur Identifikation
/// 1xxx: Authentifizierung & Autorisierung
/// 2xxx: Validierung
/// 3xxx: Ressource nicht gefunden
/// 5xxx: Interner Serverfehler
/// </summary>
public record ErrorRecord(
    string Error,
    int ErrorCode);
