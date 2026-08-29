using System.Text.Json.Serialization;

namespace EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum SurveyRequestStatus
{
    [JsonStringEnumMemberName("draft")]
    Draft,
    [JsonStringEnumMemberName("inSurvey")]
    InSurvey,
    [JsonStringEnumMemberName("closed")]
    Closed
}

public record SurveyRequestDto(
    string SurveyId,
    string CreatorId,
    string CreatorName,
    string Title,
    string Description,
    int ServiceId,
    string ServiceName,
    [property: JsonConverter(typeof(JsonStringEnumConverter))]
    SurveyRequestStatus Status,
    List<SurveyRequestEntryDto> Entries);
