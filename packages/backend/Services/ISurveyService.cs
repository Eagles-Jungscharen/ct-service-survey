using EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;

namespace EaglesJungscharen.Azure.ServiceSurvey.Services;

/// <summary>
/// Service-Interface für Umfragen-Verwaltung
/// </summary>
public interface ISurveyService
{
    /// <summary>
    /// Ruft alle Umfragen ab (Admin: alle, User: nur Active/Closed)
    /// </summary>
    Task<List<SurveyDto>> GetSurveysAsync(string userId, bool isAdmin, SurveyStatus? statusFilter = null);

    /// <summary>
    /// Ruft eine einzelne Umfrage ab
    /// </summary>
    Task<SurveyDto?> GetSurveyByIdAsync(string surveyId);

    /// <summary>
    /// Erstellt eine neue Umfrage
    /// </summary>
    Task<SurveyDto> CreateSurveyAsync(CreateSurveyRequest request, string creatorId, string creatorName);

    /// <summary>
    /// Aktualisiert eine bestehende Umfrage
    /// </summary>
    Task<SurveyDto?> UpdateSurveyAsync(string surveyId, UpdateSurveyRequest request, string userId, bool isAdmin);

    /// <summary>
    /// Löscht eine Umfrage (nur Draft-Status)
    /// </summary>
    Task<bool> DeleteSurveyAsync(string surveyId, string userId, bool isAdmin);

    /// <summary>
    /// Fügt einen Termin zu einer Umfrage hinzu
    /// </summary>
    Task<ServiceDateDto?> AddServiceDateAsync(string surveyId, CreateServiceDateRequest request, string userId, bool isAdmin);

    /// <summary>
    /// Löscht einen Termin aus einer Umfrage
    /// </summary>
    Task<bool> DeleteServiceDateAsync(string surveyId, string serviceDateId, string userId, bool isAdmin);

    /// <summary>
    /// Aktiviert eine Draft-Umfrage mit eingeladenen Personen und Ende-Datum
    /// </summary>
    Task<SurveyDto?> ActivateSurveyAsync(string surveyId, ActivateSurveyRequest request, string userId, bool isAdmin);

    /// <summary>
    /// Schliesst eine Umfrage manuell
    /// </summary>
    Task<SurveyDto?> CloseSurveyAsync(string surveyId, string userId, bool isAdmin);

    /// <summary>
    /// Ruft eine Umfrage anhand des Access-TAGs ab (nur Active)
    /// </summary>
    Task<SurveyDto?> GetSurveyByTagAsync(string tag);
}
