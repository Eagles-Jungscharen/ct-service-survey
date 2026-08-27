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

public class AssignmentsFunction(
    ILogger<AssignmentsFunction> logger,
    IAssignmentService assignmentService,
    IConfiguration configuration)
{
    private readonly ILogger<AssignmentsFunction> _logger = logger;
    private readonly IAssignmentService _assignmentService = assignmentService;
    private readonly IConfiguration _configuration = configuration;

    private (string userId, string displayName, bool isAdmin)? GetUserFromClaims(ClaimsPrincipal? user)
    {
        return UserContextHelper.GetUserFromClaims(user, _configuration);
    }

    [Function("GetMyAssignments")]
    public async Task<IActionResult> GetMyAssignments(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "assignments/me")] HttpRequest req)
    {
        try
        {
            var userInfo = GetUserFromClaims(req.HttpContext.User);
            if (userInfo == null)
            {
                return new UnauthorizedObjectResult(new ErrorRecord("Authentifizierung erforderlich.", 1001));
            }

            var (userId, displayName, isAdmin) = userInfo.Value;

            var assignments = await _assignmentService.GetMyAssignmentsAsync(userId);
            return new OkObjectResult(assignments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fehler beim Abrufen der eigenen Einteilungen.");
            return new ObjectResult(new ErrorRecord("Fehler beim Abrufen der Einteilungen.", 5000))
            {
                StatusCode = 500
            };
        }
    }

    [Function("GetAssignmentsForSurvey")]
    public async Task<IActionResult> GetAssignmentsForSurvey(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "surveys/{surveyId}/assignments")] HttpRequest req,
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
                return new ObjectResult(new ErrorRecord("Keine Berechtigung zum Abrufen der Einteilungen.", 1003))
                {
                    StatusCode = 403
                };
            }

            var assignments = await _assignmentService.GetAssignmentsForSurveyAsync(surveyId);
            return new OkObjectResult(assignments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fehler beim Abrufen der Einteilungen für Umfrage {SurveyId}.", surveyId);
            return new ObjectResult(new ErrorRecord("Fehler beim Abrufen der Einteilungen.", 5000))
            {
                StatusCode = 500
            };
        }
    }

    [Function("SubmitAssignments")]
    public async Task<IActionResult> SubmitAssignments(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "assignments")] HttpRequest req)
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
                return new ObjectResult(new ErrorRecord("Keine Berechtigung zum Vornehmen von Einteilungen.", 1003))
                {
                    StatusCode = 403
                };
            }

            var request = await JsonSerializer.DeserializeAsync<SubmitAssignmentsRequest>(req.Body);
            if (request == null)
            {
                return new BadRequestObjectResult(new ErrorRecord("Ungültige Anfrage.", 2001));
            }

            var assignments = await _assignmentService.SubmitAssignmentsAsync(request, userId);
            return new OkObjectResult(assignments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fehler beim Speichern der Einteilungen.");
            return new ObjectResult(new ErrorRecord("Fehler beim Speichern der Einteilungen.", 5004))
            {
                StatusCode = 500
            };
        }
    }
}
