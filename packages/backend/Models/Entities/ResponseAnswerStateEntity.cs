using EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;

namespace EaglesJungscharen.Azure.ServiceSurvey.Models.Entities;

public class ResponseAnswerStateEntity
{
    public required string ResponseAnswerStateId { get; set; }
    public required string SurveyId { get; set; }
    public required string UserId { get; set; }
    public required ResponseAnswerState State { get; set; } = ResponseAnswerState.NotAnswered;
}