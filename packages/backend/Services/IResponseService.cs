using EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;

namespace EaglesJungscharen.Azure.ServiceSurvey.Services;

/// <summary>
/// Service-Interface für Rückmeldungen
/// </summary>
public interface IResponseService
{
    /// <summary>
    /// Ruft alle Rückmeldungen eines Users für eine Umfrage ab
    /// </summary>
    Task<List<ResponseDto>> GetResponsesAsync(string surveyId, string userId);

    /// <summary>
    /// Ruft alle Rückmeldungen für eine Umfrage ab (Admin)
    /// </summary>
    Task<List<ResponseDto>> GetAllResponsesForSurveyAsync(string surveyId);

    /// <summary>
    /// Speichert Rückmeldungen eines Users für alle Termine einer Umfrage (Bulk)
    /// </summary>
    Task<List<ResponseDto>> SubmitResponsesAsync(SubmitResponsesRequest request, string userId, string userName);

    Task<ResponseAnswerStateDto> GetResponseAnswerStateAsync(string surveyId, string userId);
    Task<List<ResponseAnswerStateDto>> GetAllResponseAnswerStateAsync(string surveyId);
    Task<ResponseAnswerStateDto> SubmitResponseAnswerStateAsync(string surveyId, string userId, ResponseAnswerState state);
}
