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
}
