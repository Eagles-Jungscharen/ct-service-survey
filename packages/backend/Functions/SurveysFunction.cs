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
    private readonly IChurchToolsService _churchToolsService;
    private readonly IConfiguration _configuration;

    public SurveysFunction(
        ILogger<SurveysFunction> logger,
        ISurveyService surveyService,
        IChurchToolsService churchToolsService,
        IConfiguration configuration)
    {
        _logger = logger;
        _surveyService = surveyService;
        _churchToolsService = churchToolsService;
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
                return new UnauthorizedObjectResult(new ErrorRecord("Authentifizierung erforderlich.", 1001));
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
            return new ObjectResult(new ErrorRecord("Fehler beim Abrufen der Umfragen.", 5000))
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
                return new UnauthorizedObjectResult(new ErrorRecord("Authentifizierung erforderlich.", 1001));
            }

            var (userId, displayName, isAdmin) = userInfo.Value;

            var survey = await _surveyService.GetSurveyByIdAsync(surveyId);
            if (survey == null)
            {
                return new NotFoundObjectResult(new ErrorRecord("Umfrage wurde nicht gefunden.", 3001));
            }

            // User darf nur Active/Closed sehen, Admin alles
            if (!isAdmin && survey.Status != SurveyStatus.Active && survey.Status != SurveyStatus.Closed)
            {
                return new NotFoundObjectResult(new ErrorRecord("Umfrage wurde nicht gefunden.", 3001));
            }

            return new OkObjectResult(survey);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fehler beim Abrufen der Umfrage {SurveyId}.", surveyId);
            return new ObjectResult(new ErrorRecord("Fehler beim Abrufen der Umfrage.", 5000))
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
                return new UnauthorizedObjectResult(new ErrorRecord("Authentifizierung erforderlich.", 1001));
            }

            var (userId, displayName, isAdmin) = userInfo.Value;

            if (!isAdmin)
            {
                return new ObjectResult(new ErrorRecord("Keine Berechtigung zum Erstellen von Umfragen.", 1003))
                {
                    StatusCode = 403
                };
            }

            var request = await JsonSerializer.DeserializeAsync<CreateSurveyRequest>(req.Body);
            if (request == null)
            {
                return new BadRequestObjectResult(new ErrorRecord("Ungültige Anfrage.", 2001));
            }

            // Validierung
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return new BadRequestObjectResult(new ErrorRecord("Titel darf nicht leer sein.", 2002));
            }

            if (request.Dates == null || request.Dates.Count == 0)
            {
                return new BadRequestObjectResult(new ErrorRecord("Mindestens ein Termin muss angegeben werden.", 2003));
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
            return new ObjectResult(new ErrorRecord("Fehler beim Erstellen der Umfrage.", 5001))
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
                return new UnauthorizedObjectResult(new ErrorRecord("Authentifizierung erforderlich.", 1001));
            }

            var (userId, displayName, isAdmin) = userInfo.Value;

            var request = await JsonSerializer.DeserializeAsync<UpdateSurveyRequest>(req.Body);
            if (request == null)
            {
                return new BadRequestObjectResult(new ErrorRecord("Ungültige Anfrage.", 2001));
            }

            // Validierung
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return new BadRequestObjectResult(new ErrorRecord("Titel darf nicht leer sein.", 2002));
            }

            var survey = await _surveyService.UpdateSurveyAsync(surveyId, request, userId, isAdmin);
            if (survey == null)
            {
                return new NotFoundObjectResult(new ErrorRecord("Umfrage wurde nicht gefunden.", 3001));
            }

            return new OkObjectResult(survey);
        }
        catch (UnauthorizedAccessException)
        {
            return new ObjectResult(new ErrorRecord("Keine Berechtigung zum Bearbeiten dieser Umfrage.", 1002))
            {
                StatusCode = 403
            };
        }
        catch (InvalidOperationException ex)
        {
            return new BadRequestObjectResult(new ErrorRecord(ex.Message, 4000));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fehler beim Aktualisieren der Umfrage {SurveyId}.", surveyId);
            return new ObjectResult(new ErrorRecord("Fehler beim Aktualisieren der Umfrage.", 5002))
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
                return new UnauthorizedObjectResult(new ErrorRecord("Authentifizierung erforderlich.", 1001));
            }

            var (userId, displayName, isAdmin) = userInfo.Value;

            var deleted = await _surveyService.DeleteSurveyAsync(surveyId, userId, isAdmin);
            if (!deleted)
            {
                return new NotFoundObjectResult(new ErrorRecord("Umfrage wurde nicht gefunden.", 3001));
            }

            return new NoContentResult();
        }
        catch (UnauthorizedAccessException)
        {
            return new ObjectResult(new ErrorRecord("Keine Berechtigung zum Löschen dieser Umfrage.", 1002))
            {
                StatusCode = 403
            };
        }
        catch (InvalidOperationException ex)
        {
            return new BadRequestObjectResult(new ErrorRecord(ex.Message, 4000));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fehler beim Löschen der Umfrage {SurveyId}.", surveyId);
            return new ObjectResult(new ErrorRecord("Fehler beim Löschen der Umfrage.", 5003))
            {
                StatusCode = 500
            };
        }
    }

    /// <summary>
    /// POST /api/surveys/fetch-events - Holt Events aus ChurchTools für einen Zeitraum und Service
    /// Nur für Admins zugänglich
    /// </summary>
    [Function("FetchEvents")]
    public async Task<IActionResult> FetchEvents(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "surveys/fetch-events")] HttpRequest req)
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
                return new ObjectResult(new ErrorRecord("Keine Berechtigung zum Abrufen von Events.", 1003))
                {
                    StatusCode = 403
                };
            }

            var request = await JsonSerializer.DeserializeAsync<FetchEventsRequest>(req.Body);
            if (request == null)
            {
                return new BadRequestObjectResult(new ErrorRecord("Ungültige Anfrage.", 2001));
            }

            // Validierung
            if (request.StartDate >= request.EndDate)
            {
                return new BadRequestObjectResult(new ErrorRecord("Start-Datum muss vor End-Datum liegen.", 2004));
            }

            var events = await _churchToolsService.FetchEventsAsync(
                request.StartDate,
                request.EndDate,
                request.ServiceId);

            var response = new FetchEventsResponse(events);
            return new OkObjectResult(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fehler beim Abrufen der Events aus ChurchTools.");
            return new ObjectResult(new ErrorRecord("Fehler beim Abrufen der Events aus ChurchTools.", 5000))
            {
                StatusCode = 500
            };
        }
    }
}
