namespace EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;

public record SurveyRequestDto(
    string SurveyId,
    string CreaterId,
    string Title,
    List<DateTime> Dates);
