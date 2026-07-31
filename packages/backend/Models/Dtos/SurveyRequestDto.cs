namespace EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;

public enum SurveyRequestStatus
{
    Draft,
    InSurvey,
    Closed
}

public record SurveyRequestDto(
    string SurveyId,
    string CreatorId,
    string CreatorName,
    string Title,
    string Description,
    SurveyRequestStatus Status,
    List<SurveyRequestEntryDto> Entries);
