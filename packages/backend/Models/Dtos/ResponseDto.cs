using System.Text.Json.Serialization;

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

public enum ResponseAnswerState
{
    NotAnswered,
    InEditing,
    Answered,
}

public record ResponseAnswerStateDto(
    string SurveyId,
    [property: JsonConverter(typeof(JsonStringEnumConverter))]
    ResponseAnswerState State);

/// <summary>
/// DTO für eine einzelne Rückmeldung (User × Termin)
/// </summary>
public record ResponseDto(
    string ResponseId,
    string SurveyId,
    string ServiceDateId,
    string UserId,
    string UserName,
    [property: JsonConverter(typeof(JsonStringEnumConverter))]
    AvailabilityStatus Availability,
    string Remarks,
    DateTime CreatedAt,
    DateTime UpdatedAt);

/// <summary>
/// DTO für Bulk-Submission aller Rückmeldungen eines Users für eine Umfrage
/// </summary>
public record SubmitResponsesRequest(
    string SurveyId,
    [property: JsonConverter(typeof(JsonStringEnumConverter))]
    ResponseAnswerState State,
    List<ServiceDateResponseRequest> Responses);

/// <summary>
/// DTO für eine einzelne Rückmeldung (nested in SubmitResponsesRequest)
/// </summary>
public record ServiceDateResponseRequest(
    string ServiceDateId,
    [property: JsonConverter(typeof(JsonStringEnumConverter))]
    AvailabilityStatus Availability,
    string Remarks);
