namespace EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;

/// <summary>
/// Verfügbarkeits-Status für Rückmeldungen
/// </summary>
public enum AvailabilityStatus
{
    Unknown,
    Yes,
    No,
    Maybe
}

/// <summary>
/// DTO für eine einzelne Rückmeldung (User × Termin)
/// </summary>
public record ResponseDto(
    string SurveyId,
    string ServiceDateId,
    string UserId,
    string UserName,
    AvailabilityStatus Availability,
    string Remarks,
    DateTime CreatedAt,
    DateTime UpdatedAt);

/// <summary>
/// DTO für Bulk-Submission aller Rückmeldungen eines Users für eine Umfrage
/// </summary>
public record SubmitResponsesRequest(
    string SurveyId,
    List<ServiceDateResponseRequest> Responses);

/// <summary>
/// DTO für eine einzelne Rückmeldung (nested in SubmitResponsesRequest)
/// </summary>
public record ServiceDateResponseRequest(
    string ServiceDateId,
    AvailabilityStatus Availability,
    string Remarks);
