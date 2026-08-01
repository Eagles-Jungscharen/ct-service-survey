using EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;

namespace EaglesJungscharen.Azure.ServiceSurvey.Services;

/// <summary>
/// Service-Interface für Einteilungen
/// </summary>
public interface IAssignmentService
{
    /// <summary>
    /// Ruft alle Einteilungen eines Users ab
    /// </summary>
    Task<List<MyAssignmentDto>> GetMyAssignmentsAsync(string userId);

    /// <summary>
    /// Ruft alle Einteilungen für eine Umfrage ab (Admin)
    /// </summary>
    Task<List<AssignmentDto>> GetAssignmentsForSurveyAsync(string surveyId);

    /// <summary>
    /// Speichert Einteilungen für alle Termine einer Umfrage (Bulk, Admin)
    /// </summary>
    Task<List<AssignmentDto>> SubmitAssignmentsAsync(SubmitAssignmentsRequest request, string adminUserId);

    /// <summary>
    /// Löscht alle Einteilungen für einen Termin (Admin)
    /// </summary>
    Task<bool> DeleteAssignmentsForServiceDateAsync(string surveyId, string serviceDateId);
}
