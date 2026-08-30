using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;
using EaglesJungscharen.Azure.ServiceSurvey.Services;
using Microsoft.Extensions.Caching.Memory;

namespace EaglesJungscharen.Azure.ServiceSurvey.Functions;

public class ResponsesFunction(
    ILogger<ResponsesFunction> logger,
    IResponseService responseService,
    IConfiguration configuration,
    IMemoryCache cache,
    IMeService meService) : AbstractFunctionBase(logger, cache, meService)
{
    private readonly ILogger<ResponsesFunction> _logger = logger;
    private readonly IResponseService _responseService = responseService;
    private readonly IConfiguration _configuration = configuration;

    private (string userId, string displayName, bool isAdmin)? GetUserFromClaims(ClaimsPrincipal? user)
    {
        return UserContextHelper.GetUserFromClaims(user, _configuration);
    }

    [Function("GetMyResponses")]
    public async Task<IActionResult> GetMyResponses(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "surveys/{surveyId}/responses/me")] HttpRequest req,
        string surveyId)
    {
        return await ExecuteAsync(req, async (request, meDto) =>
        {
            try
            {
                var userId = meDto.UserId;
                var responses = await _responseService.GetResponsesAsync(surveyId, userId);
                return new OkObjectResult(responses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Fehler beim Abrufen der eigenen Rückmeldungen für Umfrage {SurveyId}.", surveyId);
                return new ObjectResult(new ErrorRecord("Fehler beim Abrufen der Rückmeldungen.", 5000))
                {
                    StatusCode = 500
                };
            }
        });
    }

    [Function("GetAllResponses")]
    public async Task<IActionResult> GetAllResponses(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "surveys/{surveyId}/responses")] HttpRequest req,
        string surveyId)
    {
        return await ExecuteAsync(req, async (request, meDto) =>
        {
            try
            {
                var responses = await _responseService.GetAllResponsesForSurveyAsync(surveyId);
                return new OkObjectResult(responses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Fehler beim Abrufen aller Rückmeldungen für Umfrage {SurveyId}.", surveyId);
                return new ObjectResult(new ErrorRecord("Fehler beim Abrufen der Rückmeldungen.", 5000))
                {
                    StatusCode = 500
                };
            }
        });
    }
    [Function("GetResponseAnswerState")]
    public async Task<IActionResult> GetResponseAnswerState(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "surveys/{surveyId}/responses/me/state")] HttpRequest req,
        string surveyId)
    {
        return await ExecuteAsync(req, async (request, meDto) =>
        {
            try
            {
                var userId = meDto.UserId;
                var responseAnswerState = await _responseService.GetResponseAnswerStateAsync(surveyId, userId);
                return new OkObjectResult(responseAnswerState);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Fehler beim Abrufen des Antwortstatus für Umfrage {SurveyId}.", surveyId);
                return new ObjectResult(new ErrorRecord("Fehler beim Abrufen des Antwortstatus.", 5000))
                {
                    StatusCode = 500
                };
            }
        });
    }

    [Function("SubmitResponses")]
    public async Task<IActionResult> SubmitResponses(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "responses")] HttpRequest req)
    {
        return await ExecuteAsync(req, async (request, meDto) =>
        {

            try
            {

                var responseRequest = await req.ReadFromJsonAsync<SubmitResponsesRequest>();
                if (responseRequest == null)
                {
                    return new BadRequestObjectResult(new ErrorRecord("Ungültige Anfrage.", 2001));
                }

                // Validierung
                if (responseRequest.Responses == null || responseRequest.Responses.Count == 0)
                {
                    return new BadRequestObjectResult(new ErrorRecord("Mindestens eine Rückmeldung muss angegeben werden.", 2004));
                }

                var responses = await _responseService.SubmitResponsesAsync(responseRequest, meDto.UserId, meDto.DisplayName);
                await _responseService.SubmitResponseAnswerStateAsync(responseRequest.SurveyId, meDto.UserId, responseRequest.State);
                return new OkObjectResult(responses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Fehler beim Speichern der Rückmeldungen.");
                return new ObjectResult(new ErrorRecord("Fehler beim Speichern der Rückmeldungen.", 5004))
                {
                    StatusCode = 500
                };
            }
        });
    }
}
