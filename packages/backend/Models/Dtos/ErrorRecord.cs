namespace EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;

/// <summary>
/// Fehler-Response gemäß Repository-Konventionen
/// error: deutsche Fehlermeldung (primär)
/// message: optionale Kopie für Kompatibilität
/// </summary>
public record ErrorRecord(
    string Error,
    string? Message = null);
