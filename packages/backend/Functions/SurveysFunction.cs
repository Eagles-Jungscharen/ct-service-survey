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

public class SurveysFunction(ILogger<SurveysFunction> logger, ISurveyService surveyService, IChurchToolsService churchToolsService, IConfiguration configuration, IMemoryCache cache, IMeService meService) : AbstractFunctionBase(logger, cache, meService)
{
    private readonly ILogger<SurveysFunction> _logger = logger;
    private readonly ISurveyService _surveyService = surveyService;
    private readonly IChurchToolsService _churchToolsService = churchToolsService;
    private readonly IConfiguration _configuration = configuration;

    // Hilfsmethode um User-Informationen aus Claims zu extrahieren
    private (string userId, string displayName, bool isAdmin)? GetUserFromClaims(ClaimsPrincipal? user)
    {
        return UserContextHelper.GetUserFromClaims(user, _configuration);
    }

    [Function("GetSurveys")]
    public async Task<IActionResult> GetSurveys([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "surveys")] HttpRequest req)
    {
        return await ExecuteAsync(req, async (request, meDto) =>
        {
            try
            {
                SurveyStatus? statusFilter = null;
                if (req.Query.TryGetValue("status", out var statusValue))
                {
                    if (Enum.TryParse<SurveyStatus>(statusValue, true, out var parsed))
                    {
                        statusFilter = parsed;
                    }
                }

                var surveys = await _surveyService.GetSurveysAsync(meDto.UserId, meDto.IsAdmin, statusFilter);
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
        });
    }

    [Function("GetSurveyById")]
    public async Task<IActionResult> GetSurveyById([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "surveys/{surveyId}")] HttpRequest req, string surveyId)
    {
        return await ExecuteAsync(req, async (request, meDto) =>
        {
            try
            {
                var survey = await _surveyService.GetSurveyByIdAsync(surveyId);
                if (survey == null)
                {
                    return new NotFoundObjectResult(new ErrorRecord("Umfrage wurde nicht gefunden.", 3001));
                }

                // User darf nur Active/Closed sehen, Admin alles
                if (!meDto.IsAdmin && survey.Status != SurveyStatus.Active && survey.Status != SurveyStatus.Closed)
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
        });
    }

    [Function("CreateSurvey")]
    public async Task<IActionResult> CreateSurvey([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "surveys")] HttpRequest req)
    {
        return await ExecuteAsAdminAsync(req, async (request, meDto) =>
        {
            try
            {
                var createSurveyRequest = await req.ReadFromJsonAsync<CreateSurveyRequest>();
                if (createSurveyRequest == null)
                {
                    return new BadRequestObjectResult(new ErrorRecord("Ungültige Anfrage.", 2001));
                }

                // Validierung
                if (string.IsNullOrWhiteSpace(createSurveyRequest.Title))
                {
                    return new BadRequestObjectResult(new ErrorRecord("Titel darf nicht leer sein.", 2002));
                }

                if (createSurveyRequest.Dates == null || createSurveyRequest.Dates.Count == 0)
                {
                    return new BadRequestObjectResult(new ErrorRecord("Mindestens ein Termin muss angegeben werden.", 2003));
                }

                var survey = await _surveyService.CreateSurveyAsync(createSurveyRequest, meDto.UserId, meDto.DisplayName);
                return new ObjectResult(survey)
                {
                    StatusCode = 201
                };
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
                _logger.LogError(ex, "Fehler beim Erstellen der Umfrage.");
                return new ObjectResult(new ErrorRecord("Fehler beim Erstellen der Umfrage.", 5001))
                {
                    StatusCode = 500
                };
            }
        });

    }

    [Function("UpdateSurvey")]
    public async Task<IActionResult> UpdateSurvey([HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "surveys/{surveyId}")] HttpRequest req, string surveyId)
    {
        return await ExecuteAsAdminAsync(req, async (request, meDto) =>
        {
            try
            {
                var updateSurveyRequest = await req.ReadFromJsonAsync<UpdateSurveyRequest>();
                if (updateSurveyRequest == null)
                {
                    return new BadRequestObjectResult(new ErrorRecord("Ungültige Anfrage.", 2001));
                }

                // Validierung
                if (string.IsNullOrWhiteSpace(updateSurveyRequest.Title))
                {
                    return new BadRequestObjectResult(new ErrorRecord("Titel darf nicht leer sein.", 2002));
                }

                var survey = await _surveyService.UpdateSurveyAsync(surveyId, updateSurveyRequest, meDto.UserId, meDto.IsAdmin);
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
        });
    }

    [Function("DeleteSurvey")]
    public async Task<IActionResult> DeleteSurvey([HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "surveys/{surveyId}")] HttpRequest req, string surveyId)
    {
        return await ExecuteAsAdminAsync(req, async (request, meDto) =>
        {
            try
            {
                var deleted = await _surveyService.DeleteSurveyAsync(surveyId, meDto.UserId, meDto.IsAdmin);
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
        });
    }

    /// <summary>
    /// POST /api/surveys/fetch-events - Holt Events aus ChurchTools für einen Zeitraum und Service
    /// Nur für Admins zugänglich
    /// </summary>
    [Function("FetchEvents")]
    public async Task<IActionResult> FetchEvents(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "surveys/fetch-events")] HttpRequest req)
    {
        return await ExecuteAsAdminAsync(req, async (request, meDto) =>
        {
            try
            {
                var fetchEventsRequest = await request.ReadFromJsonAsync<FetchEventsRequest>();
                if (fetchEventsRequest == null)
                {
                    return new BadRequestObjectResult(new ErrorRecord("Ungültige Anfrage.", 2001));
                }

                // Validierung
                _logger.LogInformation("FetchEventsRequest: StartDate={StartDate}, EndDate={EndDate}, ServiceId={ServiceId}", fetchEventsRequest.StartDate, fetchEventsRequest.EndDate, fetchEventsRequest.ServiceId);
                if (fetchEventsRequest.StartDate >= fetchEventsRequest.EndDate)
                {
                    return new BadRequestObjectResult(new ErrorRecord("Start-Datum muss vor End-Datum liegen.", 2004));
                }

                var events = await _churchToolsService.FetchEventsAsync(
                    fetchEventsRequest.StartDate,
                    fetchEventsRequest.EndDate,
                    fetchEventsRequest.ServiceId);

                var response = new FetchEventsResponse(events);
                return new OkObjectResult(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Fehler beim Abrufen der Events aus ChurchTools.");
                return new ObjectResult(new ErrorRecord("Fehler beim Abrufen der Events.", 5004))
                {
                    StatusCode = 500
                };
            }
        });
    }

    /// <summary>
    /// POST /api/surveys/{surveyId}/activate - Aktiviert eine Draft-Umfrage
    /// Nur für Admins oder Creator zugänglich
    /// </summary>
    [Function("ActivateSurvey")]
    public async Task<IActionResult> ActivateSurvey(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "surveys/{surveyId}/activate")] HttpRequest req,
        string surveyId)
    {
        return await ExecuteAsync(req, async (request, meDto) =>
        {
            try
            {
                var activateRequest = await request.ReadFromJsonAsync<ActivateSurveyRequest>();
                if (activateRequest == null)
                {
                    return new BadRequestObjectResult(new ErrorRecord("Ungültige Anfrage.", 2001));
                }

                // Validierung
                if (activateRequest.InvitedPersonIds == null || activateRequest.InvitedPersonIds.Count == 0)
                {
                    return new BadRequestObjectResult(new ErrorRecord("Mindestens eine Person muss eingeladen werden.", 2005));
                }

                if (activateRequest.EndDate <= DateTime.UtcNow)
                {
                    return new BadRequestObjectResult(new ErrorRecord("Das Ende-Datum muss in der Zukunft liegen.", 2006));
                }

                var survey = await _surveyService.ActivateSurveyAsync(surveyId, activateRequest, meDto.UserId, meDto.IsAdmin);

                if (survey == null)
                {
                    return new NotFoundObjectResult(new ErrorRecord("Umfrage nicht gefunden.", 3000));
                }

                return new OkObjectResult(survey);
            }
            catch (UnauthorizedAccessException)
            {
                return new ObjectResult(new ErrorRecord("Keine Berechtigung zum Aktivieren dieser Umfrage.", 1003))
                {
                    StatusCode = 403
                };
            }
            catch (InvalidOperationException ex)
            {
                return new BadRequestObjectResult(new ErrorRecord(ex.Message, 2007));
            }
            catch (ArgumentException ex)
            {
                return new BadRequestObjectResult(new ErrorRecord(ex.Message, 2008));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Fehler beim Aktivieren der Umfrage {SurveyId}.", surveyId);
                return new ObjectResult(new ErrorRecord("Fehler beim Aktivieren der Umfrage.", 5005))
                {
                    StatusCode = 500
                };
            }
        });
    }

    /// <summary>
    /// GET /api/surveys/by-tag/{tag} - Ruft eine Umfrage anhand des Access-TAGs ab
    /// Öffentlich zugänglich (keine Auth erforderlich)
    /// </summary>
    [Function("GetSurveyByTag")]
    public async Task<IActionResult> GetSurveyByTag(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "surveys/by-tag/{tag}")] HttpRequest req,
        string tag)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(tag))
            {
                return new BadRequestObjectResult(new ErrorRecord("TAG fehlt.", 2009));
            }

            var survey = await _surveyService.GetSurveyByTagAsync(tag);

            if (survey == null)
            {
                return new NotFoundObjectResult(new ErrorRecord("Umfrage nicht gefunden oder nicht aktiv.", 3000));
            }

            return new OkObjectResult(survey);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fehler beim Abrufen der Umfrage mit TAG {Tag}.", tag);
            return new ObjectResult(new ErrorRecord("Fehler beim Abrufen der Umfrage.", 5006))
            {
                StatusCode = 500
            };
        }
    }
}
