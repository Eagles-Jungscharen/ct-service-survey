using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;
using EaglesJungscharen.Azure.ServiceSurvey.Services;

namespace EaglesJungscharen.Azure.ServiceSurvey.Functions;

/// <summary>
/// Azure Function für ChurchTools Services (Dienste)
/// </summary>
public class ServicesFunction
{
    private readonly ILogger<ServicesFunction> _logger;
    private readonly IChurchToolsService _churchToolsService;
    private readonly IConfiguration _configuration;

    public ServicesFunction(
        ILogger<ServicesFunction> logger,
        IChurchToolsService churchToolsService,
        IConfiguration configuration)
    {
        _logger = logger;
        _churchToolsService = churchToolsService;
        _configuration = configuration;
    }

    // Hilfsmethode um User-Informationen aus Claims zu extrahieren
    private (string userId, string displayName, bool isAdmin)? GetUserFromClaims(ClaimsPrincipal? user)
    {
        return UserContextHelper.GetUserFromClaims(user, _configuration);
    }

    /// <summary>
    /// GET /api/services - Holt alle verfügbaren Services (Dienste) aus ChurchTools
    /// Nur für Admins zugänglich
    /// </summary>
    [Function("GetServices")]
    public async Task<IActionResult> GetServices(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "services")] HttpRequest req)
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
                return new ObjectResult(new ErrorRecord("Keine Berechtigung zum Abrufen von Services.", 1003))
                {
                    StatusCode = 403
                };
            }

            var services = await _churchToolsService.FetchServicesAsync();
            return new OkObjectResult(services);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fehler beim Abrufen der Services aus ChurchTools.");
            return new ObjectResult(new ErrorRecord("Fehler beim Abrufen der Services.", 5000))
            {
                StatusCode = 500
            };
        }
    }
}
