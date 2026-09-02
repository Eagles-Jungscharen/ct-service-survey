using System.Text.Json.Serialization;

namespace EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;

/// <summary>
/// Verfügbarkeits-Status für Rückmeldungen
/// </summary>
public enum AvailabilityStatus
{
    [JsonStringEnumMemberName("unknown")]
    Unknown,
    [JsonStringEnumMemberName("yes")]
    Yes,
    [JsonStringEnumMemberName("no")]
    No,
    [JsonStringEnumMemberName("maybe")]
    Maybe
}

public enum ResponseAnswerState
{
    [JsonStringEnumMemberName("notAnswered")]
    NotAnswered,
    [JsonStringEnumMemberName("inEditing")]
    InEditing,
    [JsonStringEnumMemberName("answered")]
    Answered,
}

public record ResponseAnswerStateDto(
    string SurveyId,
    string UserId,
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
