namespace EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;

/// <summary>
/// DTO für einen Dienst-Termin innerhalb einer Umfrage
/// </summary>
public record ServiceDateDto(
    string Id,
    string SurveyId,
    DateTime Date,
    string ServiceType,
    string ServiceTypeName,
    int RequiredPeople,
    string Notes);
