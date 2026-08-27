using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using Microsoft.Extensions.Caching.Memory;
using EaglesJungscharen.Azure.ServiceSurvey.Models.Dtos;
using EaglesJungscharen.Azure.ServiceSurvey.Services;

namespace EaglesJungscharen.Azure.ServiceSurvey.Functions;

/// <summary>
/// Azure Function für ChurchTools Services (Dienste)
/// </summary>
public class ServicesFunction(ILogger<ServicesFunction> logger,IChurchToolsService churchToolsService, IMemoryCache cache, IMeService meService) : AbstractFunctionBase(logger, cache, meService)
{
    private readonly ILogger<ServicesFunction> _logger = logger;
    private readonly IChurchToolsService _churchToolsService = churchToolsService;


    /// <summary>
    /// GET /api/services - Holt alle verfügbaren Services (Dienste) aus ChurchTools
    /// Nur für Admins zugänglich
    /// </summary>
    [Function("GetServices")]
    public async Task<IActionResult> GetServices(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "services")] HttpRequest req)
    {
        return await ExecuteAsAdminAsync(req, async (request, meDto) =>
        {
            try
            {
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
        });
    }

    /// <summary>
    /// GET /api/persons/search?q={query} - Sucht Personen in ChurchTools
    /// Nur für Admins zugänglich
    /// </summary>
    [Function("SearchPersons")]
    public async Task<IActionResult> SearchPersons(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "persons/search")] HttpRequest req)
    {
        return await ExecuteAsAdminAsync(req, async (request, meDto) =>
        {
            try
            {
                var query = request.Query["q"].ToString();
                
                if (string.IsNullOrWhiteSpace(query))
                {
                    return new BadRequestObjectResult(new ErrorRecord("Suchbegriff 'q' fehlt.", 2001));
                }

                var persons = await _churchToolsService.SearchPersonsAsync(query);
                return new OkObjectResult(persons);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Fehler beim Suchen von Personen in ChurchTools.");
                return new ObjectResult(new ErrorRecord("Fehler beim Suchen von Personen.", 5001))
                {
                    StatusCode = 500
                };
            }
        });
    }
}
