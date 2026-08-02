namespace EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;

/// <summary>
/// DTO für eine Einteilung (Admin → User zu Termin)
/// </summary>
public record AssignmentDto(
    string AssignmentId,
    string SurveyId,
    string ServiceDateId,
    string UserId,
    string UserName,
    string AssignedBy,
    DateTime AssignedAt);

/// <summary>
/// DTO für Bulk-Assignment für alle Termine einer Umfrage
/// </summary>
public record SubmitAssignmentsRequest(
    string SurveyId,
    List<ServiceDateAssignmentRequest> Assignments);

/// <summary>
/// DTO für Einteilungen pro Termin (nested in SubmitAssignmentsRequest)
/// </summary>
public record ServiceDateAssignmentRequest(
    string ServiceDateId,
    List<string> UserIds);

/// <summary>
/// DTO für Einteilungs-Übersicht (für User "Meine Einteilungen")
/// </summary>
public record MyAssignmentDto(
    string SurveyId,
    string SurveyTitle,
    string ServiceDateId,
    DateTime Date,
    string ServiceTypeName,
    DateTime AssignedAt);
