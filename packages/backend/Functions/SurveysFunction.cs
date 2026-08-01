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

public class SurveysFunction
{
    private readonly ILogger<SurveysFunction> _logger;
    private readonly ISurveyService _surveyService;
    private readonly IConfiguration _configuration;

    public SurveysFunction(
        ILogger<SurveysFunction> logger,
        ISurveyService surveyService,
        IConfiguration configuration)
    {
        _logger = logger;
        _surveyService = surveyService;
        _configuration = configuration;
    }

    // Hilfsmethode um User-Informationen aus Claims zu extrahieren
    private (string userId, string displayName, bool isAdmin)? GetUserFromClaims(ClaimsPrincipal? user)
    {
        return UserContextHelper.GetUserFromClaims(user, _configuration);
    }

    [Function("GetSurveys")]
    public async Task<IActionResult> GetSurveys(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "surveys")] HttpRequest req)
    {
        try
        {
            var userInfo = GetUserFromClaims(req.HttpContext.User);
            if (userInfo == null)
            {
                return new UnauthorizedObjectResult(new ErrorRecord("Authentifizierung erforderlich."));
            }

            var (userId, displayName, isAdmin) = userInfo.Value;

            // Status-Filter aus Query-Parameter
            SurveyStatus? statusFilter = null;
            if (req.Query.TryGetValue("status", out var statusValue))
            {
                if (Enum.TryParse<SurveyStatus>(statusValue, true, out var parsed))
                {
                    statusFilter = parsed;
                }
            }

            var surveys = await _surveyService.GetSurveysAsync(userId, isAdmin, statusFilter);
            return new OkObjectResult(surveys);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fehler beim Abrufen der Umfragen.");
            return new ObjectResult(new ErrorRecord("Fehler beim Abrufen der Umfragen."))
            {
                StatusCode = 500
            };
        }
    }

    [Function("GetSurveyById")]
    public async Task<IActionResult> GetSurveyById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "surveys/{surveyId}")] HttpRequest req,
        string surveyId)
    {
        try
        {
            var userInfo = GetUserFromClaims(req.HttpContext.User);
            if (userInfo == null)
            {
                return new UnauthorizedObjectResult(new ErrorRecord("Authentifizierung erforderlich."));
            }

            var (userId, displayName, isAdmin) = userInfo.Value;

            var survey = await _surveyService.GetSurveyByIdAsync(surveyId);
            if (survey == null)
            {
                return new NotFoundObjectResult(new ErrorRecord("Umfrage wurde nicht gefunden."));
            }

            // User darf nur Active/Closed sehen, Admin alles
            if (!isAdmin && survey.Status != SurveyStatus.Active && survey.Status != SurveyStatus.Closed)
            {
                return new NotFoundObjectResult(new ErrorRecord("Umfrage wurde nicht gefunden."));
            }

            return new OkObjectResult(survey);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fehler beim Abrufen der Umfrage {SurveyId}.", surveyId);
            return new ObjectResult(new ErrorRecord("Fehler beim Abrufen der Umfrage."))
            {
                StatusCode = 500
            };
        }
    }

    [Function("CreateSurvey")]
    public async Task<IActionResult> CreateSurvey(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "surveys")] HttpRequest req)
    {
        try
        {
            var userInfo = GetUserFromClaims(req.HttpContext.User);
            if (userInfo == null)
            {
                return new UnauthorizedObjectResult(new ErrorRecord("Authentifizierung erforderlich."));
            }

            var (userId, displayName, isAdmin) = userInfo.Value;

            if (!isAdmin)
            {
                return new ObjectResult(new ErrorRecord("Keine Berechtigung zum Erstellen von Umfragen."))
                {
                    StatusCode = 403
                };
            }

            var request = await JsonSerializer.DeserializeAsync<CreateSurveyRequest>(req.Body);
            if (request == null)
            {
                return new BadRequestObjectResult(new ErrorRecord("Ungültige Anfrage."));
            }

            // Validierung
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return new BadRequestObjectResult(new ErrorRecord("Titel darf nicht leer sein."));
            }

            if (request.Dates == null || request.Dates.Count == 0)
            {
                return new BadRequestObjectResult(new ErrorRecord("Mindestens ein Termin muss angegeben werden."));
            }

            var survey = await _surveyService.CreateSurveyAsync(request, userId, displayName);
            return new ObjectResult(survey)
            {
                StatusCode = 201
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fehler beim Erstellen der Umfrage.");
            return new ObjectResult(new ErrorRecord("Fehler beim Erstellen der Umfrage."))
            {
                StatusCode = 500
            };
        }
    }

    [Function("UpdateSurvey")]
    public async Task<IActionResult> UpdateSurvey(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "surveys/{surveyId}")] HttpRequest req,
        string surveyId)
    {
        try
        {
            var userInfo = GetUserFromClaims(req.HttpContext.User);
            if (userInfo == null)
            {
                return new UnauthorizedObjectResult(new ErrorRecord("Authentifizierung erforderlich."));
            }

            var (userId, displayName, isAdmin) = userInfo.Value;

            var request = await JsonSerializer.DeserializeAsync<UpdateSurveyRequest>(req.Body);
            if (request == null)
            {
                return new BadRequestObjectResult(new ErrorRecord("Ungültige Anfrage."));
            }

            // Validierung
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return new BadRequestObjectResult(new ErrorRecord("Titel darf nicht leer sein."));
            }

            var survey = await _surveyService.UpdateSurveyAsync(surveyId, request, userId, isAdmin);
            if (survey == null)
            {
                return new NotFoundObjectResult(new ErrorRecord("Umfrage wurde nicht gefunden."));
            }

            return new OkObjectResult(survey);
        }
        catch (UnauthorizedAccessException)
        {
            return new ObjectResult(new ErrorRecord("Keine Berechtigung zum Bearbeiten dieser Umfrage."))
            {
                StatusCode = 403
            };
        }
        catch (InvalidOperationException ex)
        {
            return new BadRequestObjectResult(new ErrorRecord(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fehler beim Aktualisieren der Umfrage {SurveyId}.", surveyId);
            return new ObjectResult(new ErrorRecord("Fehler beim Aktualisieren der Umfrage."))
            {
                StatusCode = 500
            };
        }
    }

    [Function("DeleteSurvey")]
    public async Task<IActionResult> DeleteSurvey(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "surveys/{surveyId}")] HttpRequest req,
        string surveyId)
    {
        try
        {
            var userInfo = GetUserFromClaims(req.HttpContext.User);
            if (userInfo == null)
            {
                return new UnauthorizedObjectResult(new ErrorRecord("Authentifizierung erforderlich."));
            }

            var (userId, displayName, isAdmin) = userInfo.Value;

            var deleted = await _surveyService.DeleteSurveyAsync(surveyId, userId, isAdmin);
            if (!deleted)
            {
                return new NotFoundObjectResult(new ErrorRecord("Umfrage wurde nicht gefunden."));
            }

            return new NoContentResult();
        }
        catch (UnauthorizedAccessException)
        {
            return new ObjectResult(new ErrorRecord("Keine Berechtigung zum Löschen dieser Umfrage."))
            {
                StatusCode = 403
            };
        }
        catch (InvalidOperationException ex)
        {
            return new BadRequestObjectResult(new ErrorRecord(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fehler beim Löschen der Umfrage {SurveyId}.", surveyId);
            return new ObjectResult(new ErrorRecord("Fehler beim Löschen der Umfrage."))
            {
                StatusCode = 500
            };
        }
    }
}
