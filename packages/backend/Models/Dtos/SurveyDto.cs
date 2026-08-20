using System.Text.Json.Serialization;

namespace EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;

/// <summary>
/// Status-Enum für Umfragen (angepasst an MVP-Scope)
/// </summary>
public enum SurveyStatus
{
    [JsonStringEnumMemberName("draft")]
    Draft,
    [JsonStringEnumMemberName("active")]
    Active,
    [JsonStringEnumMemberName("closed")]
    Closed
}

/// <summary>
/// DTO für eine Umfrage (GET Response)
/// </summary>
public record SurveyDto(
    string Id,
    string CreatorId,
    string CreatorName,
    string Title,
    string Description,
    [property: JsonConverter(typeof(JsonStringEnumConverter))]
    SurveyStatus Status,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    List<ServiceDateDto> Dates);

/// <summary>
/// DTO für Umfrage-Erstellung/Update (POST/PUT Request)
/// </summary>
public record CreateSurveyRequest(
    string Title,
    string Description,
    [property: JsonConverter(typeof(JsonStringEnumConverter))]
    SurveyStatus Status,
    List<CreateServiceDateRequest> Dates);

/// <summary>
/// DTO für Update einer bestehenden Umfrage
/// </summary>
public record UpdateSurveyRequest(
    string Title,
    string Description,
    [property: JsonConverter(typeof(JsonStringEnumConverter))]
    SurveyStatus Status);

/// <summary>
/// DTO für Dienst-Termin-Erstellung (nested in CreateSurveyRequest)
/// </summary>
public record CreateServiceDateRequest(
    DateTime Date,
    string ServiceType,
    string Notes);
