using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using System.Text.Json;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;
using EaglesJungscharen.Azure.ServiceSurvey.Services;

namespace EaglesJungscharen.Azure.ServiceSurvey.Functions;

public class ResponsesFunction
{
    private readonly ILogger<ResponsesFunction> _logger;
    private readonly IResponseService _responseService;
    private readonly IConfiguration _configuration;

    public ResponsesFunction(
        ILogger<ResponsesFunction> logger,
        IResponseService responseService,
        IConfiguration configuration)
    {
        _logger = logger;
        _responseService = responseService;
        _configuration = configuration;
    }

    private (string userId, string displayName, bool isAdmin)? GetUserFromClaims(ClaimsPrincipal? user)
    {
        return UserContextHelper.GetUserFromClaims(user, _configuration);
    }

    [Function("GetMyResponses")]
    public async Task<IActionResult> GetMyResponses(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "surveys/{surveyId}/responses/me")] HttpRequest req,
        string surveyId)
    {
        try
        {
            var userInfo = GetUserFromClaims(req.HttpContext.User);
            if (userInfo == null)
            {
                return new UnauthorizedObjectResult(new ErrorRecord("Authentifizierung erforderlich.", 1001));
            }

            var (userId, displayName, isAdmin) = userInfo.Value;

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
    }

    [Function("GetAllResponses")]
    public async Task<IActionResult> GetAllResponses(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "surveys/{surveyId}/responses")] HttpRequest req,
        string surveyId)
    {
        try
        {
            var userInfo = GetUserFromClaims(req.HttpContext.User);
            if (userInfo == null)
            {
                return new UnauthorizedObjectResult(new ErrorRecord("Authentifizierung erforderlich.", 1001));
            }

            var (userId, displayName, isAdmin) = userInfo.Value;

            if (!isAdmin)
            {
                return new ObjectResult(new ErrorRecord("Keine Berechtigung zum Abrufen aller Rückmeldungen.", 1003))
                {
                    StatusCode = 403
                };
            }

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
    }

    [Function("SubmitResponses")]
    public async Task<IActionResult> SubmitResponses(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "responses")] HttpRequest req)
    {
        try
        {
            var userInfo = GetUserFromClaims(req.HttpContext.User);
            if (userInfo == null)
            {
                return new UnauthorizedObjectResult(new ErrorRecord("Authentifizierung erforderlich.", 1001));
            }

            var (userId, displayName, isAdmin) = userInfo.Value;

            var request = await JsonSerializer.DeserializeAsync<SubmitResponsesRequest>(req.Body);
            if (request == null)
            {
                return new BadRequestObjectResult(new ErrorRecord("Ungültige Anfrage.", 2001));
            }

            // Validierung
            if (request.Responses == null || request.Responses.Count == 0)
            {
                return new BadRequestObjectResult(new ErrorRecord("Mindestens eine Rückmeldung muss angegeben werden.", 2004));
            }

            var responses = await _responseService.SubmitResponsesAsync(request, userId, displayName);
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
    }
}
