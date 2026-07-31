namespace EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;

public record SurveyRequestEntryDto(
    string EventId,
    DateTime Date,
    string EventName);